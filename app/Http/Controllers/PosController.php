<?php

namespace App\Http\Controllers;

use App\Custom\PrintableItem;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Client;
use App\Models\HeldItem;
use App\Models\PaymentSale;
use App\Models\Product;
use App\Models\Setting;
use App\Models\ProductVariant;
use App\Models\product_warehouse;
use App\Models\PaymentWithCreditCard;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Warehouse;
use App\utils\helpers;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Mike42\Escpos\EscposImage;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;
use Stripe;

class PosController extends BaseController
{

    //------------ Create New  POS --------------\\

    public function CreatePOS(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);

        request()->validate([
            'client_id' => 'required',
            'warehouse_id' => 'required',
            'payment.amount' => 'required',
        ]);

        $item = \DB::transaction(function () use ($request) {
            $helpers = new helpers();
            $role = Auth::user()->roles()->first();
            $view_records = Role::findOrFail($role->id)->inRole('record_view');
            $order = new Sale;

            $order->is_pos = 1;
            $order->date = Carbon::now();
            $order->Ref = app('App\Http\Controllers\SalesController')->getNumberOrder();
            $order->client_id = $request->client_id;
            $order->warehouse_id = $request->warehouse_id;
            $order->tax_rate = $request->tax_rate;
            $order->TaxNet = $request->TaxNet;
            $order->discount = $request->discount;
            $order->shipping = $request->shipping;
            $order->GrandTotal = $request->GrandTotal;
            $order->statut = 'completed';
            $order->user_id = Auth::user()->id;

            $order->save();

            $data = $request['details'];
            $this->printDetails($data, $request);

            foreach ($data as $key => $value) {
                $orderDetails[] = [
                    'date' => Carbon::now(),
                    'sale_id' => $order->id,
                    'quantity' => $value['quantity'],
                    'product_id' => $value['product_id'],
                    'product_variant_id' => $value['product_variant_id'],
                    'total' => $value['subtotal'],
                    'price' => $value['Unit_price'],
                    'TaxNet' => $value['tax_percent'],
                    'tax_method' => $value['tax_method'],
                    'discount' => $value['discount'],
                    'discount_method' => $value['discount_Method'],
                ];

                $unit = Product::with('unitSale')
                    ->where('id', $value['product_id'])
                    ->where('deleted_at', '=', null)
                    ->first();

                $unit->update(["popularity" => $unit->popularity + $value['quantity']]);

                if ($value['product_variant_id'] !== null) {
                    $product_warehouse = product_warehouse::where('warehouse_id', $order->warehouse_id)
                        ->where('product_id', $value['product_id'])->where('product_variant_id', $value['product_variant_id'])
                        ->first();

                    if ($unit && $product_warehouse) {
                        if ($unit['unitSale']->operator == '/') {
                            $product_warehouse->qte -= $value['quantity'] / $unit['unitSale']->operator_value;
                        } else {
                            $product_warehouse->qte -= $value['quantity'] * $unit['unitSale']->operator_value;
                        }
                        $product_warehouse->save();
                    }
                } else {
                    $product_warehouse = product_warehouse::where('warehouse_id', $order->warehouse_id)
                        ->where('product_id', $value['product_id'])
                        ->first();
                    if ($unit && $product_warehouse) {
                        if ($unit['unitSale']->operator == '/') {
                            $product_warehouse->qte -= $value['quantity'] / $unit['unitSale']->operator_value;
                        } else {
                            $product_warehouse->qte -= $value['quantity'] * $unit['unitSale']->operator_value;
                        }
                        $product_warehouse->save();
                    }
                }
            }

            SaleDetail::insert($orderDetails);

            $sale = Sale::findOrFail($order->id);
            // Check If User Has Permission view All Records
            if (!$view_records) {
                // Check If User->id === sale->id
                $this->authorizeForUser($request->user('api'), 'check_record', $sale);
            }

            try {

                $total_paid = $sale->paid_amount + $request->payment['amount'];
                $due = $sale->GrandTotal - $total_paid;

                if ($due === 0.0 || $due < 0.0) {
                    $payment_statut = 'paid';
                } else if ($due != $sale->GrandTotal) {
                    $payment_statut = 'partial';
                } else if ($due == $sale->GrandTotal) {
                    $payment_statut = 'unpaid';
                }

                if ($request->payment['Reglement'] == 'credit card') {
                    $Client = Client::whereId($request->client_id)->first();
                    Stripe\Stripe::setApiKey(config('app.STRIPE_SECRET'));

                    $PaymentWithCreditCard = PaymentWithCreditCard::where('customer_id', $request->client_id)->first();
                    if (!$PaymentWithCreditCard) {
                        // Create a Customer
                        $customer = \Stripe\Customer::create([
                            'source' => $request->token,
                            'email' => $Client->email,
                        ]);

                        // Charge the Customer instead of the card:
                        $charge = \Stripe\Charge::create([
                            'amount' => $request->payment['amount'] * 100,
                            'currency' => 'usd',
                            'customer' => $customer->id,
                        ]);
                        $PaymentCard['customer_stripe_id'] = $customer->id;
                    } else {
                        $customer_id = $PaymentWithCreditCard->customer_stripe_id;
                        $charge = \Stripe\Charge::create([
                            'amount' => $request->payment['amount'] * 100,
                            'currency' => 'usd',
                            'customer' => $customer_id,
                        ]);
                        $PaymentCard['customer_stripe_id'] = $customer_id;
                    }

                    $PaymentSale = new PaymentSale();
                    $PaymentSale->sale_id = $order->id;
                    $PaymentSale->Ref = app('App\Http\Controllers\PaymentSalesController')->getNumberOrder();
                    $PaymentSale->date = Carbon::now();
                    $PaymentSale->Reglement = $request->payment['Reglement'];
                    $PaymentSale->montant = $request->payment['amount'];
                    $PaymentSale->notes = $request->payment['notes'];
                    $PaymentSale->user_id = Auth::user()->id;
                    $PaymentSale->save();

                    $sale->update([
                        'paid_amount' => $total_paid,
                        'payment_statut' => $payment_statut,
                    ]);

                    $PaymentCard['customer_id'] = $request->client_id;
                    $PaymentCard['payment_id'] = $PaymentSale->id;
                    $PaymentCard['charge_id'] = $charge->id;
                    PaymentWithCreditCard::create($PaymentCard);

                    // Paying Method Cash
                } else {

                    PaymentSale::create([
                        'sale_id' => $order->id,
                        'Ref' => app('App\Http\Controllers\PaymentSalesController')->getNumberOrder(),
                        'date' => Carbon::now(),
                        'Reglement' => $request->payment['Reglement'],
                        'montant' => $request->payment['amount'],
                        'notes' => $request->payment['notes'],
                        'user_id' => Auth::user()->id,
                    ]);

                    $sale->update([
                        'paid_amount' => $total_paid,
                        'payment_statut' => $payment_statut,
                    ]);
                }
            } catch (Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }

            return $order->id;
        }, 10);

        return response()->json(['success' => true, 'id' => $item]);
    }

    public function printDetails($details, $request)
    {
        if(config('values.backend_printing')==0){
          return false;
        }
        $setting = Setting::find(1);
        $connector = new FilePrintConnector("/dev/usb/lp1");
        //$connector = new WindowsPrintConnector("printer share name");
        //$connector = new NetworkPrintConnector("10.x.x.x", 9100);

        $printer = new Printer($connector);

        $printer->setJustification(Printer::JUSTIFY_CENTER);
        try {
            $logo = EscposImage::load(asset("images/" . $setting->logo), false);
            $printer->graphics($logo);
        } catch (\Exception $e) {
            Log::error("Could not load image :" . $e->getMessage());
            Log::info("image path " . "images/" . $setting->logo);
        }


        $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $printer->setEmphasis(true);
        $printer->text($setting->CompanyName . "\n");
        $printer->selectPrintMode();
        $printer->text($setting->CompanyPhone . "\n");
        $printer->text($setting->email . "\n");
        $printer->text("Business No. 522533 Account No. 7842949\n");
        $printer->feed();

        //title of the receipt
        $printer->text("Sales Receipt\n");


        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $heading = str_pad("Qty", 5, ' ') . str_pad("Item", 25, ' ') . str_pad("Price", 9, ' ', STR_PAD_LEFT) . str_pad("Total", 9, ' ', STR_PAD_LEFT);
        $printer->setEmphasis(false);
        $printer->text("$heading\n");
        $printer->text(str_repeat(".", 48) . "\n");
        //Print product details
        $total = 0;
        foreach ($details as $key => $value) {
            $product = new PrintableItem($value['name'], $value['Net_price'],  $value['quantity']);
            $printer->text($product->getPrintatbleRow());
            $total += $product->getTotal();
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $formatted_totals = str_pad("Total", 36, ' ') . str_pad(number_format($total), 12, ' ', STR_PAD_LEFT);
        $printer->text($formatted_totals);
        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->text("Thank you and Come again\n");
        $user = $request->user('api');
        $names = "Served By " . $user->firstname ."\n";
        $printer->text($names);
        $printer->feed(2);

        $date = Carbon::now()->format("l jS \of F Y h:i:s A");
        $printer->text("$date\n");
        $printer->feed();

        $printer->setBarcodeHeight(80);
        $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
        $barcode = app('App\Http\Controllers\PaymentSalesController')->getNumberOrder();
        $barcode = str_replace('/', '', $barcode);
        $barcode = str_replace('_', '', $barcode);
        $printer->barcode($barcode);
        $printer->feed();

        $printer->cut();
        $printer->close();
    }

    //------------ Get Products--------------\\

    public function GetProductsByParametre(request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);
        // How many items do you want to display.
        $perPage = 4500;
        $pageStart = \Request::get('page', 1);
        // Start displaying items from this number;
        $offSet = ($pageStart * $perPage) - $perPage;
        $data = array();

        $product_warehouse_data = product_warehouse::where('warehouse_id', $request->warehouse_id)
            ->with('product', 'product.unitSale')
            ->where('deleted_at', '=', null)
            ->where(function ($query) use ($request) {
                if ($request->stock == '1') {
                    return $query->where('qte', '>', 0);
                }
            })
            // Filter
            ->where(function ($query) use ($request) {
                return $query->when($request->filled('category_id'), function ($query) use ($request) {
                    return $query->whereHas('product', function ($q) use ($request) {
                        $q->where('category_id', '=', $request->category_id);
                    });
                });
            })
            ->where(function ($query) use ($request) {
                return $query->when($request->filled('brand_id'), function ($query) use ($request) {
                    return $query->whereHas('product', function ($q) use ($request) {
                        $q->where('brand_id', '=', $request->brand_id);
                    });
                });
            });
        // Search With Multiple Param
        // ->where(function ($query) use ($request) {
        //     return $query->when($request->filled('search'), function ($query) use ($request) {
        //         return $query->Where(function ($query) use ($request) {
        //             return $query->whereHas('product', function ($q) use ($request) {
        //                 $q->where('name', 'LIKE', "%{$request->search}%")
        //                     ->orWhere('code', 'LIKE', "%{$request->search}%");
        //             });
        //         });
        //     });
        // });

        $totalRows = $product_warehouse_data->count();

        $product_warehouse_data = $product_warehouse_data
            ->offset($offSet)
            ->limit(4500)
            ->get();

        foreach ($product_warehouse_data as $product_warehouse) {
            if ($product_warehouse->product_variant_id) {
                $productsVariants = ProductVariant::where('product_id', $product_warehouse->product_id)
                    ->where('id', $product_warehouse->product_variant_id)
                    ->where('deleted_at', null)
                    ->first();

                $item['product_variant_id'] = $product_warehouse->product_variant_id;
                $item['Variant'] = $productsVariants->name;
                $item['code'] = $productsVariants->name . '-' . $product_warehouse['product']->code;
            } else if ($product_warehouse->product_variant_id === null) {
                $item['product_variant_id'] = null;
                $item['Variant'] = null;
                $item['code'] = $product_warehouse['product']->code;
            }
            $item['id'] = $product_warehouse->product_id;
            $item['barcode'] = $product_warehouse['product']->code;
            $item['popularity'] = $product_warehouse['product']->popularity;
            $item['name'] = $product_warehouse['product']->name;
            $firstimage = explode(',', $product_warehouse['product']->image);
            $item['image'] = $firstimage[0];

            if ($product_warehouse['product']['unitSale']->operator == '/') {
                $item['qte_sale'] = $product_warehouse->qte * $product_warehouse['product']['unitSale']->operator_value;
                $price = $product_warehouse['product']->price / $product_warehouse['product']['unitSale']->operator_value;
            } else {
                $item['qte_sale'] = $product_warehouse->qte / $product_warehouse['product']['unitSale']->operator_value;
                $price = $product_warehouse['product']->price * $product_warehouse['product']['unitSale']->operator_value;
            }
            $item['unitSale'] = $product_warehouse['product']['unitSale']->ShortName;

            if ($product_warehouse['product']->TaxNet !== 0.0) {

                //Exclusive
                if ($product_warehouse['product']->tax_method == '1') {
                    $tax_price = $price * $product_warehouse['product']->TaxNet / 100;

                    $item['Net_price'] = $price + $tax_price;

                    // Inxclusive
                } else {
                    $item['Net_price'] = $price;
                }
            } else {
                $item['Net_price'] = $price;
            }

            $data[] = $item;
        }

        $data = collect($data);
        $sorted = $data->sortBy(['popularity', 'desc']);
        return response()->json([
            'products' => array_reverse($sorted->values()->all()),
            'totalRows' => $totalRows,
        ]);
    }

    //--------------------- Get Element POS ------------------------\\

    public function GetELementPos(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);

        $warehouses = Warehouse::where('deleted_at', '=', null)->get(['id', 'name']);
        $clients = Client::where('deleted_at', '=', null)->get(['id', 'name']);
        $settings = Setting::where('deleted_at', '=', null)->first();
        if ($settings->warehouse_id) {
            if (Warehouse::where('id', $settings->warehouse_id)->where('deleted_at', '=', null)->first()) {
                $defaultWarehouse = $settings->warehouse_id;
            } else {
                $defaultWarehouse = '';
            }
        } else {
            $defaultWarehouse = '';
        }

        if ($settings->client_id) {
            if (Client::where('id', $settings->client_id)->where('deleted_at', '=', null)->first()) {
                $defaultClient = $settings->client_id;
            } else {
                $defaultClient = '';
            }
        } else {
            $defaultClient = '';
        }
        $categories = Category::where('deleted_at', '=', null)->get(['id', 'name']);
        $brands = Brand::where('deleted_at', '=', null)->get();
        $stripe_key = config('app.STRIPE_KEY');
        //Log::info("Display type: ".$settings->display);

        return response()->json([
            'stripe_key' => $stripe_key,
            'brands' => $brands,
            'defaultWarehouse' => $defaultWarehouse,
            'defaultClient' => $defaultClient,
            'clients' => $clients,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'display' => $settings->display == 'undefined' ? 'list' : $settings->display,
        ]);
    }

    public function hold(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);
        $details = $request->details;
        //Log::debug("DATA ".json_encode($details));
        $id = $request->id;
        if (empty($id)) {
            HeldItem::create([
                'user_id' => $request->user('api')->id,
                'client_id' => $request->client_id,
                'number_items' => sizeof($details),
                'details' => json_encode($details),
            ]);
        } else {
            $item = HeldItem::findOrFail($id);
            if ($item) {
                $item->update([
                    'number_items' => sizeof($details),
                    'client_id' => $request->client_id,
                    'details' => json_encode($details),
                ]);
            }
        }
        $items = $this->getHeldItems($request);
        return response()->json(['success' => true, 'message' => "Items held successfully", 'items' => $items]);
    }

    public function heldItems(Request  $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);
        $items = $this->getHeldItems($request);
        return response()->json(['success' => true, 'items' => $items]);
    }

    public function deleteItem(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);
        $id = $request->id;
        if ($request->user('api')->hasRole('Admin')) {
            HeldItem::where(['id' => $id])->delete(); //, 'user_id'=>$request->user('api')->id
            return response()->json(['success' => true, 'message' => "Admin : Item deleted successfully"]);
        } else {
            HeldItem::where(['id' => $id, 'user_id' => $request->user('api')->id])->delete(); //, 'user_id'=>$request->user('api')->id
            return response()->json(['success' => true, 'message' => "My item deleted successfully"]);
        }
    }

    /**
     * @param Request $request
     * @return array
     */
    public function getHeldItems(Request $request): array
    {
        //->where(['user_id' => $request->user('api')->id])
        if ($request->user('api')->hasRole('Admin')) {
            $held_items = HeldItem::with('client','user')->get();
        }else{
            $held_items = HeldItem::with('client','user')->where(['user_id' => $request->user('api')->id])->get();
        }
        $items = [];
        foreach ($held_items as $item) {
            $data = [
                'id' => $item->id,
                'client' => $item->client,
                'items' => json_decode($item->details),
                'user' => $item->user->firstname,
                'total' => $this->computeTotals(json_decode($item->details)),
                'number_items' => $item->number_items,
                'comment' => $item->comment,
                'created_at' => $item->created_at->format('d-m-Y h:i A')
            ];
            $items[] = $data;
        }
        return $items;
    }

    public function updateComment(Request $request){
      $id = $request->id;
      $comment = $request->comment;
      HeldItem::where('id',$id)->update(['comment'=>$comment]);
      return response()->json(['success' => true, 'message' => "Comment updated successfully"]);
    }

    public function computeTotals(array $items): string
    {
        $total = 0;
        foreach ($items as $item) {
            $total += $item->subtotal;
        }
        return number_format($total);
    }
}

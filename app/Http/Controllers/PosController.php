<?php

namespace App\Http\Controllers;

use App\Custom\PrintableItem;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Client;
use App\Models\HeldItem;
use App\Models\Setting;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\product_warehouse;
use App\Services\DailyReportService;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Warehouse;
use App\Traits\PrinterTrait;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\Printer;
use Stripe;

class PosController extends BaseController
{

    use PrinterTrait;

    //------------ Create New  POS --------------\\

    public function CreatePOS(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);

        request()->validate([
            'client_id' => 'required',
            'warehouse_id' => 'required',
            'payment.amount' => 'required',
        ]);


        $held_item_id = $request->held_item_id;
        if ($held_item_id) {
            $held_item_user = HeldItem::find($held_item_id)->user;
        } else {
            $held_item_user = $request->user('api');
        }


        $item = \DB::transaction(function () use ($request, $held_item_user) {
            $role = Auth::user()->roles()->first();
            $view_records = Role::findOrFail($role->id)->inRole('record_view');
            $order = new Sale;
            $barcode = app('App\Http\Controllers\PaymentSalesController')->getNumberOrder();
            $barcode = str_replace("\/", "", $barcode);
            $barcode = str_replace("_", "", $barcode);

            $order->is_pos = 1;
            $order->date = Carbon::now();
            $order->Ref = $barcode;
            $order->client_id = $request->client_id;
            $order->warehouse_id = $request->warehouse_id;
            $order->tax_rate = $request->tax_rate;
            $order->TaxNet = $request->TaxNet;
            $order->discount = $request->discount;
            $order->shipping = $request->shipping;
            $order->GrandTotal = $request->GrandTotal;
            $order->statut = 'pending';
            $order->user_id = $held_item_user ? $held_item_user->id : Auth::user()->id;

            $order->save();

            $data = $request['details'];

            $this->printDetails($data, $request, $held_item_user, $barcode);
            $this->printDetails($data, $request, $held_item_user, $barcode, 'Hotel Copy - For  Internal Use Only');

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
            $held_item_id = $request->held_item_id;
            if (!empty($held_item_id)) {
                HeldItem::where('id', $held_item_id)->delete();
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
                    $payment_statut = 'unpaid';
                } else if ($due != $sale->GrandTotal) {
                    $payment_statut = 'partial';
                } else if ($due == $sale->GrandTotal) {
                    $payment_statut = 'unpaid';
                }


                /*PaymentSale::create([
                    'sale_id' => $order->id,
                    'Ref' => app('App\Http\Controllers\PaymentSalesController')->getNumberOrder(),
                    'date' => Carbon::now(),
                    'Reglement' => $request->payment['Reglement'],
                    'montant' => $request->payment['amount'],
                    'notes' => $request->payment['notes'],
                    'user_id' => $held_item_user? $held_item_user->id : Auth::user()->id
                ]);*/

                $sale->update([
                    //'paid_amount' => $total_paid,
                    'paid_amount' => 0,
                    'payment_statut' => $payment_statut,
                ]);

            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }

            return $order->id;
        }, 10);

        return response()->json(['success' => true, 'id' => $item]);
    }


    public function generateDailyReceipt(Request $request)
    {

        $report = new  DailyReportService();
        $result = $report->getDailyReport();
        $connector = $this->getPrintConnector();

        $printer = new Printer($connector);
        $this->printHeaderDetails($printer);
        $printer->feed();
        $date = Carbon::now();

        $printer->text("Sales Report For " . $date->format('d/m/Y') . "\n");
        $printer->feed(2);

        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();

        $printer->setEmphasis(false);
        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $printer->setEmphasis(true);
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->setEmphasis(false);

        $heading = str_pad("Qty", 5, ' ') . str_pad("Item", 25, ' ') . str_pad("Price", 9, ' ', STR_PAD_LEFT) . str_pad("Total", 9, ' ', STR_PAD_LEFT);
        $printer->setEmphasis(false);
        $printer->text("$heading\n");
        $printer->text(str_repeat(".", 48) . "\n");
        //Print product details
        $total = 0;
        foreach ($result["data"] as $key => $value) {
            $product = new PrintableItem($value->Product, $value->Price, $value->Quantity);
            $printer->text($product->getPrintatbleRowMod());
        }

        $printer->text(str_repeat(".", 48) . "\n");
        $printer->selectPrintMode();


        foreach ($result['summary'] as $key => $value) {
            $sub_total_text = str_pad($value->Method, 36, ' ') . str_pad(number_format($value->Total), 12, ' ', STR_PAD_LEFT);
            $printer->text(strtoupper($sub_total_text) . "\n");
            $total += $value->Total;
        }

        // $grand_total_text = str_pad("GRAND TOTAL", 36, ' ') . str_pad(number_format($total), 12, ' ', STR_PAD_LEFT);
        // $printer->text($grand_total_text);

        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $user = $request->user('api');
        $printer->text("Generated By ".$user->firstname."\n");
        //Log::info($user);
        $printer->feed();


        $names = "Daily Sales Report\n";
        $printer->text($names);

        $printer->feed();
        $printer->cut();
        $printer->close();
        return response()->json(['success' => true]);


    }

    public function generateMonthlyReceipt(Request $request)
    {
        $from = Carbon::parse($request->fromDate);
        $to = Carbon::parse($request->toDate);
        $report = new  DailyReportService();
        $results = $report->getMonthyReport($from, $to);


        $connector = $this->getPrintConnector();

        $printer = new Printer($connector);
        $this->printHeaderDetails($printer);
        $printer->feed();
        $printer->text("Sales From " . $from->format('d/m/Y') . " - " . $to->format('d/m/Y') . "\n");
        $printer->feed(2);

        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();

        $printer->setEmphasis(false);

        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $printer->setEmphasis(true);

        //title of the receipt
        // $printer->text("Order For $client->name\n");

        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->setEmphasis(false);

        $heading = str_pad("Qty", 5, ' ') . str_pad("Item", 25, ' ') . str_pad("Price", 9, ' ', STR_PAD_LEFT) . str_pad("Total", 9, ' ', STR_PAD_LEFT);
        $printer->setEmphasis(false);
        $printer->text("$heading\n");
        $printer->text(str_repeat(".", 48) . "\n");
        //Print product details
        $total = 0;
        $products = $results['data'];
        $products_total = 0;

        foreach ($products as $key => $value) {
            $product = new PrintableItem($value->Product, $value->Price, $value->Quantity);
            $printer->text($product->getPrintatbleRowMod());
            $products_total += $value->Price * $value->Quantity;
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $printer->selectPrintMode();

        $methods = $results['summary'];
        foreach ($methods as $key => $value) {
            $sub_total_text = str_pad($value->Method, 36, ' ') . str_pad(number_format($value->Total), 12, ' ', STR_PAD_LEFT);
            $printer->text(strtoupper($sub_total_text) . "\n");
            $total += $value->Total;
        }

        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $user = $request->user('api');
        //Log::info($user);
        $printer->feed();


        $names = "Monthly Sales Report\n";
        $printer->text($names);

        $printer->feed();


        $printer->cut();
        $printer->close();
        $difference = abs($products_total - $total);
        Log::info("Total product $products_total vs total collections $total Diffrence is $difference");
        return response()->json(['success' => true]);

    }

    public function generateOrderReceipt(Request $request)
    {
        $details = $request->details;

        $items = [];
        foreach ($details as $key => $value) {
            if (!isset($value['locked'])) {
                $items[] = $value;
            }
        }

        $details = $items;

        if (sizeof($details) == 0) {
            return response()->json(['success' => false, 'message' => 'No new items on the list to print']);
        }

        $client_id = $request->client_id;
        $client = Client::where('id', $client_id)->first();
        $connector = $this->getPrintConnector();

        $printer = new Printer($connector);
        $this->printHeaderDetails($printer);
        $printer->feed();

        $printer->text("Order Receipt - For Internal Use Only\n");
        $printer->feed(2);

        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();
        $date = Carbon::now();
        $printer->setEmphasis(false);
        $printer->text("Date:" . $date->format("d/m/Y") . "\n");
        $printer->text("Time:" . $date->format("H:i A") . "\n");


        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $printer->setEmphasis(true);

        //title of the receipt
        $printer->text("Order For $client->name\n");

        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->setEmphasis(false);

        $heading = str_pad("Qty", 5, ' ') . str_pad("Item", 25, ' ') . str_pad("Price", 9, ' ', STR_PAD_LEFT) . str_pad("Total", 9, ' ', STR_PAD_LEFT);
        $printer->setEmphasis(false);
        $printer->text("$heading\n");
        $printer->text(str_repeat(".", 48) . "\n");
        //Print product details
        $total = 0;
        foreach ($details as $key => $value) {
            $product = new PrintableItem($value['name'], $value['Net_price'], $value['quantity']);
            $printer->text($product->getPrintatbleRow());
            $total += $product->getTotal();
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $printer->setTextSize(1, 1);

        $printer->selectPrintMode();

        $total = str_pad("GRAND TOTAL", 36, ' ') . str_pad(number_format($total - $request->discount), 12, ' ', STR_PAD_LEFT);

        // $printer->text($subtotal);
        //$printer->text($discount);

        $printer->setEmphasis(true);
        $printer->text($total);
        $printer->selectPrintMode();
        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $printer->feed(2);
        $printer->feed();
        $user = $request->user('api');
        $printer->feed();


        $names = "Ordered By " . $user->firstname . "\n";
        $printer->text($names);
        $printer->feed();
        //$contact = "Chui POS Systems 0719247956\n";
        //$printer->text($contact);
        $printer->feed();
        $printer->cut();
        $printer->close();
        return response()->json(['success' => true]);
    }

    public function printDetails($details, $request, $held_item_user, $barcode, $type = 'Customer\'s Receipt')
    {
        if ($request->payment['print_receipt'] == "2") {
            return false;
        }

        $connector = $this->getPrintConnector();
        $printer = new Printer($connector);
        $this->printHeaderDetails($printer);
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();
        $date = Carbon::now();
        $printer->setEmphasis(false);
        $printer->text("Date:" . $date->format("d/m/Y") . "\n");
        $printer->text("Time:" . $date->format("H:i A") . "\n");

        $printer->setJustification(Printer::JUSTIFY_CENTER);

        //title of the receipt
        $printer->text("Sales Receipt No. $barcode\n");
        $printer->text("$type\n");
        $printer->feed();

        $printer->setJustification(Printer::JUSTIFY_LEFT);

        $printer->setEmphasis(false);

        $heading = str_pad("Qty", 5, ' ') . str_pad("Item", 25, ' ') . str_pad("Price", 9, ' ', STR_PAD_LEFT) . str_pad("Total", 9, ' ', STR_PAD_LEFT);
        $printer->setEmphasis(false);
        $printer->text("$heading\n");
        $printer->text(str_repeat(".", 48) . "\n");
        //Print product details
        $total = 0;
        foreach ($details as $key => $value) {
            $product = new PrintableItem($value['name'], $value['Net_price'], $value['quantity']);
            $printer->text($product->getPrintatbleRow());
            $total += $product->getTotal();
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $printer->setTextSize(1, 1);
        $subtotal = str_pad("Subtotal", 36, ' ') . str_pad(number_format($total), 12, ' ', STR_PAD_LEFT);
        $discount = str_pad("Discount", 36, ' ') . str_pad(number_format($request->discount), 12, ' ', STR_PAD_LEFT);

        $printer->selectPrintMode();

        $total = str_pad("GRAND TOTAL", 36, ' ') . str_pad(number_format($total - $request->discount), 12, ' ', STR_PAD_LEFT);

        $printer->text($subtotal);
        $printer->text($discount);

        $printer->setEmphasis(true);
        $printer->text($total);
        $printer->selectPrintMode();


        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);


        $printer->feed(2);

        $this->printFooterInfo($printer);

        $printer->feed();
        $printer->text("Goods once sold are not re-accepted\n");

        $printer->feed();

        $printer->text("Thank You and Come Again!\n");
        $user = $held_item_user ? $held_item_user : $request->user('api');
        $printer->setBarcodeHeight(80);
        $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
        $barcode = str_replace('/', '', $barcode);
        $barcode = str_replace('_', '', $barcode);
        $printer->barcode($barcode);
        $printer->feed();
        $printer->feed();


        $names = "Served By " . $user->firstname . "\n";
        $printer->text($names);
        $printer->feed();
        //$contact = "Chui POS Systems 0719247956\n";
        //$printer->text($contact);

        $printer->feed();
        $printer->cut();
        //open drawer
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
        request()->validate([
            'client_id' => 'required',
        ]);
        $id = $request->id;

        for ($i = 0; $i < sizeof($details); $i++) {
            $details[$i]['locked'] = true;
        }

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

    public function heldItems(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'Sales_pos', Sale::class);
        $items = $this->getHeldItems($request);
        //Log::info($items);
        //$items = [];
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
        if ($request->user('api')->hasRole('Admin') or $request->user('api')->hasRole('Cahier/Purchases')) {
            $held_items = HeldItem::with('client', 'user')->orderBy('created_at', 'desc')->get();
        } else {
            $held_items = HeldItem::with('client', 'user')->where(['user_id' => $request->user('api')->id])->orderBy('created_at', 'desc')->get();
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

    public function updateComment(Request $request)
    {
        $id = $request->id;
        $comment = $request->comment;
        HeldItem::where('id', $id)->update(['comment' => $comment]);
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

<?php

namespace App\Http\Controllers;

use App\Custom\PrintableItem;
use App\Exports\Payment_Sale_Export;
use App\Mail\Payment_Sale;
use App\Models\Client;
use App\Models\PaymentSale;
use App\Models\Role;
use App\Models\Sale;
use App\Models\Setting;
use App\Traits\PrinterTrait;
use App\utils\helpers;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;
use Mike42\Escpos\Printer;
use Twilio\Rest\Client as Client_Twilio;
use PDF;

class PaymentSalesController extends BaseController
{

    use PrinterTrait;

    //------------- Get All Payments Sales --------------\\

    public function index(Request  $request)
    {
        $this->authorizeForUser($request->user('api'), 'Reports_payments_Sales', PaymentSale::class);

        // How many items do you want to display.
        $perPage = $request->limit;
        $pageStart = Request::get('page', 1);
        // Start displaying items from this number;
        $offSet = ($pageStart * $perPage) - $perPage;
        $order = $request->SortField;
        $dir = $request->SortType;
        $helpers = new helpers();
        $role = Auth::user()->roles()->first();
        $view_records = Role::findOrFail($role->id)->inRole('record_view');
        // Filter fields With Params to retriever
        $param = array(0 => 'like', 1 => '=', 2 => 'like', 3 => '=');
        $columns = array(0 => 'Ref', 1 => 'sale_id', 2 => 'Reglement', 3 => 'date');
        $data = array();

        // Check If User Has Permission View  All Records
        $Payments = PaymentSale::with('sale.client')
            ->where('deleted_at', '=', null)
            ->where(function ($query) use ($view_records) {
                if (!$view_records) {
                    return $query->where('user_id', '=', Auth::user()->id);
                }
            })
            // Multiple Filter
            ->where(function ($query) use ($request) {
                return $query->when($request->filled('client_id'), function ($query) use ($request) {
                    return $query->whereHas('sale.client', function ($q) use ($request) {
                        $q->where('id', '=', $request->client_id);
                    });
                });
            });
        $Filtred = $helpers->filter($Payments, $columns, $param, $request)
            // Search With Multiple Param
            ->where(function ($query) use ($request) {
                return $query->when($request->filled('search'), function ($query) use ($request) {
                    return $query->where('Ref', 'LIKE', "%{$request->search}%")
                        ->orWhere('date', 'LIKE', "%{$request->search}%")
                        ->orWhere('Reglement', 'LIKE', "%{$request->search}%")
                        ->orWhere(function ($query) use ($request) {
                            return $query->whereHas('sale', function ($q) use ($request) {
                                $q->where('Ref', 'LIKE', "%{$request->search}%");
                            });
                        })
                        ->orWhere(function ($query) use ($request) {
                            return $query->whereHas('sale.client', function ($q) use ($request) {
                                $q->where('name', 'LIKE', "%{$request->search}%");
                            });
                        });
                });
            });

        $totalRows = $Filtred->count();
        $Payments = $Filtred->offset($offSet)
            ->limit($perPage)
            ->orderBy($order, $dir)
            ->get();

        foreach ($Payments as $Payment) {

            $item['date'] = $Payment->date;
            $item['Ref'] = $Payment->Ref;
            $item['Ref_Sale'] = $Payment['sale']->Ref;
            $item['client_name'] = $Payment['sale']['client']->name;
            $item['Reglement'] = $Payment->Reglement;
            $item['montant'] = number_format($Payment->montant, 2, '.', '');

            $data[] = $item;
        }

        $clients = Client::where('deleted_at', '=', null)->get(['id', 'name']);
        $sales = Sale::get(['Ref', 'id']);

        return response()->json([
            'totalRows' => $totalRows,
            'payments' => $data,
            'sales' => $sales,
            'clients' => $clients,
        ]);

    }

    //----------- Store new Payment Sale --------------\\

    //----------- Store new Payment Sale --------------\\

    public function store(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'create', PaymentSale::class);

        DB::transaction(function () use ($request) {
            $helpers = new helpers();
            $role = Auth::user()->roles()->first();
            $view_records = Role::findOrFail($role->id)->inRole('record_view');
            $sale = Sale::findOrFail($request['sale_id']);

            // Check If User Has Permission view All Records
            if (!$view_records) {
                // Check If User->id === sale->id
                $this->authorizeForUser($request->user('api'), 'check_record', $sale);
            }

            try {

                $total_paid = $sale->paid_amount + $request['montant'];
                $due = $sale->GrandTotal - $total_paid;

                if ($due === 0.0 || $due < 0.0) {
                    $payment_statut = 'paid';
                } else if ($due !== $sale->GrandTotal) {
                    $payment_statut = 'partial';
                } else if ($due === $sale->GrandTotal) {
                    $payment_statut = 'unpaid';
                }


                PaymentSale::create([
                    'sale_id' => $request['sale_id'],
                    'Ref' => $this->getNumberOrder(),
                    'date' => $request['date'],
                    'Reglement' => $request['Reglement'],
                    'montant' => $request['montant'],
                    'notes' => $request['notes'],
                    'user_id' => Auth::user()->id,
                ]);

                $sale->update([
                    'paid_amount' => $total_paid,
                    'payment_statut' => $payment_statut,
                    'statut' => 'completed'
                ]);

                //Check if receipt should be printed
                if ($request['print_receipt'] == '1') {
                    $payment_methods = $sale->facture;
                    $this->printReceipt($sale, $payment_methods);
                }

            } catch (Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }

        }, 10);

        return response()->json(['success' => true, 'message' => 'Payment Create successfully'], 200);
    }

    public function expressPrint(Request $request, $id, $type)
    {
        $sale = Sale::findOrFail($id);
        $payment_methods = $sale->facture;
        if ($type == 'payment') {
            $this->printReceipt($sale, $payment_methods);
        }else if ($type == 'internal') {
            $this->printReceipt($sale, $payment_methods, 'Sales Receipt');
        }
        return response()->json(['success' => true, 'message' => 'Receipt Printed successfully'], 200);
    }

    public function printReceipt($sale, $payment_methods, $type = 'Customer\'s Receipt')
    {
        $connector = $this->getPrintConnector();
        $printer = new Printer($connector);
        $this->printHeaderDetails($printer);
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();
        $date = $sale->created_at;
        $printer->setEmphasis(false);
        $printer->text("Date:" . $date->format("d/m/Y") . "\n");
        $printer->text("Time:" . $date->format("H:i A") . "\n");
        $barcode = $sale->Ref;
        $details = $sale->details;

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

        $total = 0;
        foreach ($details as $key => $detail) {
            $product = new PrintableItem($detail->product->name, $detail->total/$detail->quantity, $detail->quantity);
            $printer->text($product->getPrintatbleRow());
            $total += $product->getTotal();
        }

        $printer->text(str_repeat(".", 48) . "\n");
        $printer->setTextSize(1, 1);
        $subtotal = str_pad("Subtotal", 36, ' ') . str_pad(number_format($total), 12, ' ', STR_PAD_LEFT);
        $discount = str_pad("Discount", 36, ' ') . str_pad(number_format($sale->discount), 12, ' ', STR_PAD_LEFT);

        $printer->selectPrintMode();
        $total = str_pad("GRAND TOTAL", 36, ' ') . str_pad(number_format($total - $sale->discount), 12, ' ', STR_PAD_LEFT);

        $printer->text($subtotal);
        $printer->text($discount);

        $printer->setEmphasis(true);
        $printer->feed(1);

        foreach ($payment_methods as $payment_method) {
            $name = $payment_method->Reglement;
            $amount = $payment_method->montant;
            $method = str_pad("By $name", 36, ' ') . str_pad(number_format($amount), 12, ' ', STR_PAD_LEFT);
            $printer->text($method);
        }
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
        $user = $sale->user;
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
        $printer->close();
    }

    //------------ function show -----------\\

    public function show($id)
    {
        //

    }

    //----------- Update Payments Sale --------------\\

    public function update(Request $request, $id)
    {
        $this->authorizeForUser($request->user('api'), 'update', PaymentSale::class);

        DB::transaction(function () use ($id, $request) {
            $role = Auth::user()->roles()->first();
            $view_records = Role::findOrFail($role->id)->inRole('record_view');
            $payment = PaymentSale::findOrFail($id);

            // Check If User Has Permission view All Records
            if (!$view_records) {
                // Check If User->id === payment->id
                $this->authorizeForUser($request->user('api'), 'check_record', $payment);
            }

            $sale = Sale::find($payment->sale_id);
            $old_total_paid = $sale->paid_amount - $payment->montant;
            $new_total_paid = $old_total_paid + $request['montant'];

            $due = $sale->GrandTotal - $new_total_paid;
            if ($due === 0.0 || $due < 0.0) {
                $payment_statut = 'paid';
            } else if ($due !== $sale->GrandTotal) {
                $payment_statut = 'partial';
            } else if ($due === $sale->GrandTotal) {
                $payment_statut = 'unpaid';
            }

            try {
                $payment->update([
                    'date' => $request['date'],
                    'Reglement' => $request['Reglement'],
                    'montant' => $request['montant'],
                    'notes' => $request['notes'],
                ]);

                $sale->update([
                    'paid_amount' => $new_total_paid,
                    'payment_statut' => $payment_statut,
                ]);

            } catch (Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }

        }, 10);

        return response()->json(['success' => true, 'message' => 'Payment Update successfully'], 200);
    }

    //----------- Delete Payment Sales --------------\\

    public function destroy(Request $request, $id)
    {
        $this->authorizeForUser($request->user('api'), 'delete', PaymentSale::class);

        DB::transaction(function () use ($id, $request) {
            $role = Auth::user()->roles()->first();
            $view_records = Role::findOrFail($role->id)->inRole('record_view');
            $payment = PaymentSale::findOrFail($id);

            // Check If User Has Permission view All Records
            if (!$view_records) {
                // Check If User->id === payment->id
                $this->authorizeForUser($request->user('api'), 'check_record', $payment);
            }

            $sale = Sale::find($payment->sale_id);
            $total_paid = $sale->paid_amount - $payment->montant;
            $due = $sale->GrandTotal - $total_paid;

            if ($due === 0.0 || $due < 0.0) {
                $payment_statut = 'paid';
            } else if ($due !== $sale->GrandTotal) {
                $payment_statut = 'partial';
            } else if ($due === $sale->GrandTotal) {
                $payment_statut = 'unpaid';
            }

            PaymentSale::whereId($id)->update([
                'deleted_at' => Carbon::now(),
            ]);

            $sale->update([
                'paid_amount' => $total_paid,
                'payment_statut' => $payment_statut,
            ]);

        }, 10);

        return response()->json(['success' => true, 'message' => 'Payment Delete successfully'], 200);

    }

    //----------- Gen Ref Sales Number --------------\\

    public function getNumberOrder(): string
    {
        $latest_order_number = DB::table('order_numbers')->latest()->first();
        if ($latest_order_number != null) {
            $item = $latest_order_number->code;
            $nwMsg = explode("_", $item);
            $inMsg = $nwMsg[1] + 1;
            $code = $nwMsg[0] . '_' . $inMsg;
            $checkedOrderNumber = $this->checkAndGenerateOrderNumber($code);
            DB::table('order_numbers')->insert([
                'code' => $checkedOrderNumber,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            return $code;
        }

        $last_order = DB::table('payment_sales')->latest('id')->first();
        if ($last_order) {
            $item = $last_order->Ref;
            $nwMsg = explode("_", $item);
            $inMsg = $nwMsg[1] + 1;
            $code = $nwMsg[0] . '_' . $inMsg;
        } else {
            $code = 'INV/SL_1111';
        }
        DB::table('order_numbers')->insert([
            'code' => $code,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        return $code;
    }

    private function checkAndGenerateOrderNumber($orderNumber): string
    {
        $nwMsg = explode("_", $orderNumber);
        $inMsg = $nwMsg[1];
        $code = $nwMsg[0] . '_' . $inMsg;
        while ($this->checkIfCodeExists($code)) {
            $inMsg += 1;
            $code = $nwMsg[0] . '_' . $inMsg;
        }
        return $code;
    }

    private function checkIfCodeExists($code): bool
    {
        return DB::table('order_numbers')->where('code', $code)->exists();
    }
    //----------- Payment Sale PDF --------------\\

    public function payment_sale(Request $request, $id)
    {
        $payment = PaymentSale::with('sale', 'sale.client')->findOrFail($id);

        $payment_data['sale_Ref'] = $payment['sale']->Ref;
        $payment_data['client_name'] = $payment['sale']['client']->name;
        $payment_data['client_phone'] = $payment['sale']['client']->phone;
        $payment_data['client_adr'] = $payment['sale']['client']->adresse;
        $payment_data['client_email'] = $payment['sale']['client']->email;
        $payment_data['montant'] = $payment->montant;
        $payment_data['Ref'] = $payment->Ref;
        $payment_data['date'] = $payment->date;
        $payment_data['Reglement'] = $payment->Reglement;

        $helpers = new helpers();
        $settings = Setting::where('deleted_at', '=', null)->first();
        $symbol = $helpers->Get_Currency_Code();

        $pdf = \PDF::loadView('pdf.payment_sale', [
            'symbol' => $symbol,
            'setting' => $settings,
            'payment' => $payment_data,
        ]);

        return $pdf->download('Payment_Sale.pdf');

    }

    //------------- Send Payment Sale on Email -----------\\

    public function SendEmail(Request $request)
    {

        $this->authorizeForUser($request->user('api'), 'view', PaymentSale::class);

        $payment = $request->all();
        $pdf = $this->payment_sale($request, $payment['id']);
        $this->Set_config_mail(); // Set_config_mail => BaseController
        $mail = Mail::to($request->to)->send(new Payment_Sale($payment, $pdf));
        return $mail;
    }

    //----------- Export To Excel Payment Sales  --------------\\

    public function exportExcel(Request $request)
    {
        $this->authorizeForUser($request->user('api'), 'view', PaymentSale::class);

        return Excel::download(new Payment_Sale_Export, 'Payment_Sale.xlsx');
    }

    //-------------------Sms Notifications -----------------\\
    public function Send_SMS(Request $request)
    {
        $payment = PaymentSale::with('sale', 'sale.client')->findOrFail($request->id);
        $url = url('/payment_Sale_PDF/' . $request->id);
        $receiverNumber = $payment['sale']['client']->phone;
        $message = "Dear" . ' ' . $payment['sale']['client']->name . " \n We are contacting you in regard to a Payment #" . $payment['sale']->Ref . ' ' . $url . ' ' . "that has been created on your account. \n We look forward to conducting future business with you.";
        try {

            $account_sid = env("TWILIO_SID");
            $auth_token = env("TWILIO_TOKEN");
            $twilio_number = env("TWILIO_FROM");

            $client = new Client_Twilio($account_sid, $auth_token);
            $client->messages->create($receiverNumber, [
                'from' => $twilio_number,
                'body' => $message]);

        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

}

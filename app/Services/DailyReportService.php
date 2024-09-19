<?php

namespace App\Services;

use App\Models\Item;
use App\Models\PaymentSale;
use App\Models\Product;
use App\Models\product_warehouse;
use App\Models\Sale;
use Carbon\Carbon;
use DB;
use Illuminate\Support\Facades\Log;
use App\Custom\PrintableItem;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class DailyReportService{
    public function getData(){
        Item::truncate();
        $sales = Sale::with('details', 'facture')
            ->where('deleted_at', '=', null)
            ->whereDate("created_at",Carbon::today())
            ->get();
        $group_id = rand(1000, 100000);
        $products = Product::where('deleted_at', '=', null)->get();
        foreach ($products as $product) {
            $product_closing_stock = product_warehouse::where('product_id', $product->id)
                ->where('deleted_at', '=', null)
                ->get();
            $closing_stock = 0;
            Item::create(["product_id" => $product->id, "product_name" => $product->name, 'closing_stock' => $closing_stock, "group_id" => $group_id]);
        }
        foreach ($sales as $sale) {
            $details = $sale->details;
            foreach ($details as $detail) {
                $product_id = $detail->product_id;
                $item = Item::where(["product_id" => $product_id, "group_id" => $group_id])->first();
                $item->sales += $detail->quantity;
                $item->price += $detail->total;
                $item->save();
            }
        }

        $items = Item::where(['group_id' => $group_id])->get();
        $total_sales = 0;
        foreach ($items as $item) {
            $item->opening_stock = $item->closing_stock + $item->sales;
            $item->save();
            $total_sales += $item->price;
        }
        $tasks =  Item::where(['group_id' => $group_id])->orderBy('price', 'desc')->get();
        $data = [];
        $total_overall = 0;
        foreach ($tasks as $item) {
            if ($item->sales > 0) {
                $row['product'] = $item->product_name;
                $row['quantity'] = (empty($item->sales)) ? '0' : $item->sales;
                $row['total'] = (empty($item->price)) ? '0' : $item->price;
                $total_overall += $item->price;
                $data[] = $row;
            }
        }
        return  $data;
    }

    public function getDailyReport(){
        Item::truncate();      
        $sales = Sale::with('details', 'facture')
            ->where('deleted_at', '=', null)
            ->where("created_at", ">=", Carbon::today())
            ->get();
        $group_id = rand(1000, 100000);
        $products = Product::where('deleted_at', '=', null)->get();
        foreach ($products as $product) {
            $product_closing_stock = product_warehouse::where('product_id', $product->id)
                ->where('deleted_at', '=', null)
                ->get();
            $closing_stock = 0;
            foreach ($product_closing_stock as $product_warehouse) {
                $closing_stock += $product_warehouse->qte;
            }
            Item::create(["product_id" => $product->id, "product_name" => $product->name, 'closing_stock' => $closing_stock, "group_id" => $group_id]);
        }
        foreach ($sales as $sale) {
            $details = $sale->details;
            foreach ($details as $detail) {
                $product_id = $detail->product_id;
                $item = Item::where(["product_id" => $product_id, "group_id" => $group_id])->first();
                $item->sales += $detail->quantity;
                $item->price += $detail->total;
                $item->save();
            }
        }

        $items = Item::where(['group_id' => $group_id])->get();
        $total_sales = 0;
        foreach ($items as $item) {
            $item->opening_stock = $item->closing_stock + $item->sales;
            $item->save();
            $total_sales += $item->price;
        }
        $tasks =  Item::where(['group_id' => $group_id])->orderBy('price', 'desc')->get();
        $data = [];
        $i = 1;
        $total_overall = 0;
        foreach ($tasks as $item) {
            if ($item->sales > 0) {
                $row['#'] = $i;
                $row['Product'] = $item->product_name;
                //$row['Opening_Stock'] = $item->opening_stock;
                //$row['Closing_Stock'] = $item->closing_stock;
                $row['Quantity'] = (empty($item->sales)) ? '0' : $item->sales;
                $row['Total'] = (empty($item->price)) ? '0' : $item->price;
                $total_overall += $item->price;
                $i++;
                $data[] = $row;
            }
        }

        $grouped = PaymentSale::where('deleted_at', '=', null)
            ->where("created_at", ">=", Carbon::today())
            ->select(DB::raw('SUM(montant) As sum, Reglement'))
            ->groupBy('Reglement')
            ->get();

        $total = array("#" => "", "Product" => "", "Quantity" => "Total", "Total" => $total_overall);
        foreach ($grouped as $item) {
            $data[] = array("#" => "", "Product" => "",  "Quantity" => $item->Reglement, "Total" => $item->sum);
        }
        $data[] = $total;
        return  $data;
    }

    public function getMonthyReport($from, $to){
        Item::truncate();      
        $sales = Sale::with('details', 'facture')
            ->where('deleted_at', '=', null)
            ->where("created_at", ">=", $from)
            ->where("created_at", "<=", $to)
            ->get();
        $group_id = rand(1000, 1000000);
        $products = Product::where('deleted_at', '=', null)->get();
        foreach ($products as $product) {
            $product_closing_stock = product_warehouse::where('product_id', $product->id)
                ->where('deleted_at', '=', null)
                ->get();
            $closing_stock = 0;
            foreach ($product_closing_stock as $product_warehouse) {
                $closing_stock += $product_warehouse->qte;
            }
            Item::create(["product_id" => $product->id, "product_name" => $product->name, 'closing_stock' => $closing_stock, "group_id" => $group_id]);
        }
        foreach ($sales as $sale) {
            $details = $sale->details;
            foreach ($details as $detail) {
                $product_id = $detail->product_id;
                $item = Item::where(["product_id" => $product_id, "group_id" => $group_id])->first();
                if($item!=null){
                    $item->sales += $detail->quantity;
                    $item->price += $detail->total;
                    $item->save();
                }
            }
        }

        $items = Item::where(['group_id' => $group_id])->get();
        $total_sales = 0;
        foreach ($items as $item) {
            $item->opening_stock = $item->closing_stock + $item->sales;
            $item->save();
            $total_sales += $item->price;
        }
        $tasks =  Item::where(['group_id' => $group_id])->orderBy('price', 'desc')->get();
        $data = [];
        $i = 1;
        $total_overall = 0;
        foreach ($tasks as $item) {
            if ($item->sales > 0) {
                $row['#'] = $i;
                $row['Product'] = $item->product_name;
                //$row['Opening_Stock'] = $item->opening_stock;
                //$row['Closing_Stock'] = $item->closing_stock;
                $row['Quantity'] = (empty($item->sales)) ? '0' : $item->sales;
                $row['Total'] = (empty($item->price)) ? '0' : $item->price;
                $total_overall += $item->price;
                $i++;
                $data[] = $row;
            }
        }

        $grouped = PaymentSale::where('deleted_at', '=', null)
            ->where("created_at", ">=", $from)
            ->where("created_at", "<=", $to)
            ->select(DB::raw('SUM(montant) As sum, Reglement'))
            ->groupBy('Reglement')
            ->get();

        $total = array("#" => "", "Product" => "", "Quantity" => "Total", "Total" => $total_overall);
        foreach ($grouped as $item) {
            $data[] = array("#" => "", "Product" => "",  "Quantity" => $item->Reglement, "Total" => $item->sum);
        }
        $data[] = $total;
        return  $data;
    }

    public function getPrintConnector(){
        $connector = null; 
        $os= strtolower(php_uname('s'));
        try{
            if($os=='linux'){
                $subject=shell_exec("ls /dev/usb/ | grep lp");
                preg_match_all('/(lp\d)/', $subject, $match);
                if(!empty($subject) && !empty($match)){
                    $device_url = "/dev/usb/".$match[0][0];
                }else{
                    $device_url="/dev/usb/lp0";
                }
                Log::info($device_url);
                //$connector = new FilePrintConnector($device_url);
                //$connector = new FilePrintConnector("/dev/usb/lp0");
                $connector = new FilePrintConnector("php://stdout");
               // $connector = new FilePrintConnector("data.txt");
            }else if($os=="windows nt"){
                $connector = new WindowsPrintConnector("pos_print");
            }else{
                $connector = new FilePrintConnector("php://stdout");
            }
            //$connector = new FilePrintConnector("data.txt");
            //$connector = new FilePrintConnector("/dev/usb/lp1");
            //$connector = new NetworkPrintConnector("10.x.x.x", 9100);
            
        }catch (\Exception $e){
            $connector = new FilePrintConnector("php://stdout");
            Log::error("Could not get the printer connector. ". $e->getMessage());
        }
        return $connector;
    }


    public function print(){

        $details = $this->getDailyReport();
        $connector = $this->getPrintConnector(); 
        if($connector==null){
            Log::info("NUll printer");
            return;
        }
    
        $printer = new Printer($connector);
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $printer -> setFont(Printer::FONT_B);
        $printer -> setTextSize(2, 2);
        $printer->text("NICEFRIES GRILL & LOUNGE\n");
        $printer->selectPrintMode();
        $printer->setEmphasis(true);
        $printer->text("(Webuye's Finest)\n");
        $printer->setEmphasis(false);
    
        $printer->feed();
        $printer->text("WEBUYE, T-JUNCTION\n");
        $printer->setEmphasis(true);
        $printer->text("Tel : 0707633100\n");
        $printer->feed();
        $date = Carbon::now();
    
        $printer->text("Sales Report For ".$date->format('d/m/Y')."\n");
        $printer->text("Generated At ".$date->format('H:i A')."\n");
        $printer->feed(2);
    
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->feed();
      
        $printer->setEmphasis(false);
        //$printer->text("Date:".$date->format("d/m/Y")."\n");
        //$printer->text("Time:".$date->format("H:i A")."\n");
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
        $extras =[];
        foreach ($details as $key => $value) {
           if ($value['Product'] !=""){ 
            $product = new PrintableItem($value['Product'], $value['Total']/$value['Quantity'],  $value['Quantity']);
            $printer->text($product->getPrintatbleRowMod());
            $total += $value['Total'];
           }else{
             $extras[] = ["name"=>$value['Quantity'], "total"=>$value['Total']];
           }
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $printer->selectPrintMode();
    
    
        foreach($extras as $key => $value)
         {
            // Log::info("Method ".$value["name"]);
            $sub_total_text = str_pad($value["name"], 36, ' ') . str_pad(number_format($value["total"]), 12, ' ', STR_PAD_LEFT);
            $printer->text(strtoupper($sub_total_text)."\n");
         }
        
        // $grand_total_text = str_pad("GRAND TOTAL", 36, ' ') . str_pad(number_format($total), 12, ' ', STR_PAD_LEFT);
        // $printer->text($grand_total_text);
    
        $printer->feed();
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        
        $user = "Manager";   
        //Log::info($user);  
        $printer->feed();
    
    
        $names = "Daily Sales Report\n";
        $printer->text($names);
    
        $printer->feed();
    
    
        $printer->cut();
        $printer->close();
       }
    
      
    
    
}
<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Product;
use App\Models\product_warehouse;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Custom\PrintableItem;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class DailyReportService
{
    public function getData()
    {
        Item::truncate();
        $sales = Sale::with('details', 'facture')
            ->where('deleted_at', '=', null)
            ->whereDate("created_at", Carbon::today())
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
        $tasks = Item::where(['group_id' => $group_id])->orderBy('price', 'desc')->get();
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
        return $data;
    }

    public function getDailyReport()
    {
        $today = Carbon::today()->subDays(10)->format('Y-m-d');
        $query = "SELECT p.name AS Product, p.price AS Price,subquery.* FROM (SELECT sd.product_id as product_id,
                        SUM(sd.total) as Total,
                        SUM(sd.quantity) as Quantity FROM sale_details sd
                        JOIN sales s
                         ON sd.sale_id=s.id
                        WHERE DATE(s.created_at) = CURDATE() AND s.deleted_at is NULL
                    GROUP BY sd.product_id) as subquery
                    JOIN products p
                    ON subquery.product_id=p.id
                    ORDER BY subquery.Total DESC";

        $data = DB::select($query, [$today]);
        $summary_query = "SELECT SUM(ps.montant) as Total, ps.Reglement as Method FROM payment_sales ps
                          WHERE ps.sale_id IN (SELECT id FROM sales WHERE DATE(created_at) = CURDATE() AND deleted_at is NULL)
                          GROUP BY ps.Reglement";

        $unpaid_partial_credit = "SELECT SUM(s.GrandTotal - s.paid_amount) as Total , s.statut as Method FROM sales s
                                  WHERE DATE(s.created_at) = CURDATE()
                                  AND s.deleted_at is NULL
                                  AND s.payment_statut IN ('unpaid','partial')
                                  GROUP BY s.statut";

        $unpaid_summary = DB::select($unpaid_partial_credit);
        $summary = DB::select($summary_query);
        $all_summaries = array_merge($summary, $unpaid_summary);

        $t1=0;
        for ($i = 0; $i < sizeof($data); $i++) {
            $t1 = $t1 + $data[$i]->Total;
        }
        $t2 =0;
        for ($j = 0; $j < sizeof($all_summaries); $j++) {
            $t2 = $t2 + $all_summaries[$j]->Total;
        }
        Log::info("Total Main ", [$t1]);
        Log::info("Total Payments ", [$t2]);
        return ['data' => $data, 'summary' => $all_summaries];
    }

    public function getMonthyReport($from, $to)
    {
        $from = $from->format("Y-m-d");
        $to = $to->format("Y-m-d");
        $query = "SELECT p.name AS Product, p.price AS Price,subquery.* FROM (SELECT sd.product_id as product_id,
                        SUM(sd.total) as Total,
                        SUM(sd.quantity) as Quantity FROM sale_details sd
                        JOIN sales s
                         ON sd.sale_id=s.id
                            WHERE DATE(s.created_at) >=?
                            AND DATE(s.created_at) <=?
                            AND s.deleted_at is NULL
                    GROUP BY sd.product_id) as subquery
                    JOIN products p
                    ON subquery.product_id=p.id
                    ORDER BY subquery.Total DESC";

        $data = DB::select($query, [$from, $to]);

        $summary_query = "SELECT SUM(ps.montant) as Total, ps.Reglement as Method FROM payment_sales ps
                            WHERE ps.sale_id IN (SELECT id FROM sales WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                            AND ps.deleted_at is NULL
                            GROUP BY ps.Reglement";
        $summary = DB::select($summary_query, [$from, $to]);

        $unpaid_partial_credit = "SELECT SUM(s.GrandTotal - s.paid_amount) as Total , s.statut as Method FROM sales s
                                  WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?
                                  AND s.deleted_at is NULL
                                  AND s.payment_statut IN ('unpaid','partial')
                                  GROUP BY s.statut";
        $unpaid_summary = DB::select($unpaid_partial_credit, [$from, $to]);
        $all_summaries = array_merge($summary, $unpaid_summary);

        return ['data' => $data, 'summary' => $all_summaries];
    }

    public function getPrintConnector()
    {
        $os = strtolower(php_uname('s'));
        try {
            if ($os == 'linux') {
                $subject = shell_exec("ls /dev/usb/ | grep lp");
                preg_match_all('/(lp\d)/', $subject, $match);
                if (!empty($subject) && !empty($match)) {
                    $device_url = "/dev/usb/" . $match[0][0];
                } else {
                    $device_url = "/dev/usb/lp0";
                }
                Log::info($device_url);
                //$connector = new FilePrintConnector($device_url);
                //$connector = new FilePrintConnector("/dev/usb/lp0");
                $connector = new FilePrintConnector("php://stdout");
                // $connector = new FilePrintConnector("data.txt");
            } else if ($os == "windows nt") {
                $connector = new WindowsPrintConnector("pos_print");
            } else {
                $connector = new FilePrintConnector("php://stdout");
            }
            //$connector = new FilePrintConnector("data.txt");
            //$connector = new FilePrintConnector("/dev/usb/lp1");
            //$connector = new NetworkPrintConnector("10.x.x.x", 9100);

        } catch (\Exception $e) {
            $connector = new FilePrintConnector("php://stdout");
            Log::error("Could not get the printer connector. " . $e->getMessage());
        }
        return $connector;
    }


    public function print()
    {

        $details = $this->getDailyReport();
        $connector = $this->getPrintConnector();
        if ($connector == null) {
            Log::info("NUll printer");
            return;
        }

        $printer = new Printer($connector);
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $printer->setFont(Printer::FONT_B);
        $printer->setTextSize(2, 2);
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

        $printer->text("Sales Report For " . $date->format('d/m/Y') . "\n");
        $printer->text("Generated At " . $date->format('H:i A') . "\n");
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
        $extras = [];
        foreach ($details as $key => $value) {
            if ($value['Product'] != "") {
                $product = new PrintableItem($value['Product'], $value['Total'] / $value['Quantity'], $value['Quantity']);
                $printer->text($product->getPrintatbleRowMod());
                $total += $value['Total'];
            } else {
                $extras[] = ["name" => $value['Quantity'], "total" => $value['Total']];
            }
        }
        $printer->text(str_repeat(".", 48) . "\n");
        $printer->selectPrintMode();


        foreach ($extras as $key => $value) {
            // Log::info("Method ".$value["name"]);
            $sub_total_text = str_pad($value["name"], 36, ' ') . str_pad(number_format($value["total"]), 12, ' ', STR_PAD_LEFT);
            $printer->text(strtoupper($sub_total_text) . "\n");
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

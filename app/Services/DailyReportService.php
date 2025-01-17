<?php

namespace App\Services;

use App\Custom\PrintableItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class DailyReportService
{
    public function getSalesSummaryReport()
    {
        $today = Carbon::today()->format('Y-m-d');
        $query = "SELECT p.name AS product, p.price AS price,subquery.* FROM (SELECT sd.product_id as product_id,
                        SUM(sd.total) as total,
                        SUM(sd.quantity) as quantity FROM sale_details sd
                        JOIN sales s
                         ON sd.sale_id=s.id
                        WHERE DATE(s.created_at) = ? AND s.deleted_at is NULL
                    GROUP BY sd.product_id) as subquery
                    JOIN products p
                    ON subquery.product_id=p.id
                    ORDER BY subquery.total DESC LIMIT 10";

        return DB::select($query, [$today]);
    }

    public function getTodaysSalesPerShop()
    {
        $today = Carbon::today()->format('Y-m-d');
        $sql = "SELECT SUM(sd.total) as total , p.shop FROM sale_details sd
                JOIN products p
                ON p.id=sd.product_id
                WHERE sd.`date` =?
                GROUP BY p.shop";
        return DB::select($sql, [$today]);
    }

    //TODO show taxes
    public function getDailyReport()
    {
        $today = Carbon::today()->format('Y-m-d');
        $query = "SELECT p.name AS Product, p.price AS Price,subquery.* FROM (SELECT sd.product_id as product_id,
                        SUM(sd.total) as Total,
                        SUM(sd.quantity) as Quantity FROM sale_details sd
                        JOIN sales s
                         ON sd.sale_id=s.id
                        WHERE DATE(s.created_at) = ? AND s.deleted_at is NULL
                    GROUP BY sd.product_id) as subquery
                    JOIN products p
                    ON subquery.product_id=p.id
                    ORDER BY subquery.Total DESC";

        $data = DB::select($query, [$today]);

        $summary_query = "SELECT SUM(ps.montant) as Total, ps.Reglement as Method FROM payment_sales ps
                          WHERE ps.sale_id IN (SELECT id FROM sales WHERE DATE(created_at) = ? AND deleted_at is NULL)
                          GROUP BY ps.Reglement";

        $unpaid_partial_credit = "SELECT SUM(s.GrandTotal - s.paid_amount) as Total , s.statut as Method FROM sales s
                                  WHERE DATE(s.created_at) = ?
                                  AND s.deleted_at is NULL
                                  AND s.payment_statut IN ('unpaid','partial')
                                  GROUP BY s.statut";

        $unpaid_summary = DB::select($unpaid_partial_credit, [$today]);
        $summary = DB::select($summary_query, [$today]);
        $all_summaries = array_merge($summary, $unpaid_summary);

        $t1 = 0;
        for ($i = 0; $i < sizeof($data); $i++) {
            $t1 = $t1 + $data[$i]->Total;
        }
        $t2 = 0;
        for ($j = 0; $j < sizeof($all_summaries); $j++) {
            $t2 = $t2 + $all_summaries[$j]->Total;
        }
        Log::info("------------------------------");
        Log::info("Total Items   :", [$t1]);
        Log::info("Total Payment :", [$t2]);
        return ['data' => $data, 'summary' => $all_summaries, 'shops' => $this->getTodaysSalesPerShop()];
    }

    public function getMonthyReport($from, $to)
    {
        $from = $from->format("Y-m-d");
        $to = $to->format("Y-m-d");
        $query = "SELECT p.name AS Product, p.shop,  p.price AS Price,subquery.* FROM (SELECT sd.product_id as product_id,
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
                    ORDER BY p.shop, subquery.Total DESC";

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

        $shop_summary_sql = "SELECT SUM(sd.total) as total , p.shop FROM sale_details sd
                JOIN products p
                ON p.id=sd.product_id
                WHERE sd.sale_id IN (SELECT id FROM sales  WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                GROUP BY p.shop";

        $shops = DB::select($shop_summary_sql, [$from, $to]);


        $unpaid_summary = DB::select($unpaid_partial_credit, [$from, $to]);
        $all_summaries = array_merge($summary, $unpaid_summary);

        $t1 = 0;
        for ($i = 0; $i < sizeof($data); $i++) {
            $t1 = $t1 + $data[$i]->Total;
        }
        $t2 = 0;
        for ($j = 0; $j < sizeof($all_summaries); $j++) {
            $t2 = $t2 + $all_summaries[$j]->Total;
        }
        Log::info("------------------------------");
        Log::info("M-Total Items   :", [$t1]);
        Log::info("M-Total Payment :", [$t2]);
        return ['data' => $data, 'summary' => $all_summaries, 'shops' => $shops];
    }

    public function getSalesDataForPeriod($from, $to)
    {
        $from = Carbon::createFromFormat('Y-m-d H:i a', $from, 'Africa/Nairobi');
        $to = Carbon::createFromFormat('Y-m-d H:i a', $to, 'Africa/Nairobi');

        $query = "SELECT p.name AS product, p.shop as Shop,  p.price AS price, subquery.Quantity, subquery.Total FROM (SELECT sd.product_id as product_id,
                        SUM(sd.total) as Total,
                        SUM(sd.quantity) as Quantity FROM sale_details sd
                        JOIN sales s
                         ON sd.sale_id=s.id
                            WHERE s.created_at >=?
                            AND s.created_at <=?
                            AND s.deleted_at is NULL
                    GROUP BY sd.product_id) as subquery
                    JOIN products p
                    ON subquery.product_id=p.id
                    ORDER BY p.shop, subquery.Total DESC";
        $products_sales_info = DB::select($query, [$from, $to]);
        $products_sales_info_array = json_decode(json_encode($products_sales_info), true);

        $summary_query = "SELECT SUM(ps.montant) as Total, ps.Reglement as Method FROM payment_sales ps
                            WHERE ps.sale_id IN (SELECT id FROM sales WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                            AND ps.deleted_at is NULL
                            GROUP BY ps.Reglement";
        $summary = DB::select($summary_query, [$from, $to]);
        $summary_data = [["product" => "", "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""], ["product" => strtoupper("Payment Methods"), "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""]];
        foreach ($summary as $item) {
            $summary_data[] = ["product" => strtoupper($item->Method), "Shop" => "", "price" => "", "Quantity" => "", "Total" => $item->Total];
        }

        $unpaid_partial_credit = "SELECT SUM(s.GrandTotal - s.paid_amount) as Total , s.statut as Method FROM sales s
                                  WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?
                                  AND s.deleted_at is NULL
                                  AND s.payment_statut IN ('unpaid','partial')
                                  GROUP BY s.statut";
        $unpaid_partial_credit_results = DB::select($unpaid_partial_credit, [$from, $to]);
        $unpaid_partial_credit_data = [["product" => "", "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""], ["product" => strtoupper("Unpaid and Partial Payments"), "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""]];
        foreach ($unpaid_partial_credit_results as $item) {
            $unpaid_partial_credit_data[] = ["product" => strtoupper($item->Method), "Shop" => "", "price" => "", "Quantity" => "", "Total" => $item->Total];
        }
        //----------------------

        $shop_summary_sql = "SELECT SUM(sd.total) as total , p.shop FROM sale_details sd
                JOIN products p
                ON p.id=sd.product_id
                WHERE sd.sale_id IN (SELECT id FROM sales  WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                GROUP BY p.shop";

        $shops = DB::select($shop_summary_sql, [$from, $to]);
        $shops_data = [["product" => "", "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""], ["product" => strtoupper("Shops Data"), "Shop" => "", "price" => "", "Quantity" => "", "Total" => ""]];
        $total=0;
        foreach ($shops as $item) {
            $shops_data[] = ["product" => strtoupper($item->shop), "Shop" => "", "price" => "", "Quantity" => "", "Total" => $item->total];
            $total +=  $item->total;
        }
        $shops_data[] = ["product" => strtoupper("Overall Total Sales"), "Shop" => "", "price" => "", "Quantity" => "", "Total" => $total];

        return array_merge($products_sales_info_array, $summary_data, $unpaid_partial_credit_data, $shops_data);
    }


    public function getSalesUserReport($from, $to, $user_id)
    {
        $from = Carbon::createFromFormat('Y-m-d H:i a', $from, 'Africa/Nairobi');
        $to = Carbon::createFromFormat('Y-m-d H:i a', $to, 'Africa/Nairobi');
        //paid and unpaid
        $paid_unpaid_query = "SELECT payment_statut as title, SUM(GrandTotal) as total FROM sales
                                             WHERE created_at >= ?
                                             AND created_at <= ? AND deleted_at is NULL
                                             AND user_id = ?
                                             GROUP BY payment_statut";

        $paid_unpaid_query = DB::select($paid_unpaid_query, [$from, $to, $user_id]);
        $paid_unpaid_query_results = json_decode(json_encode($paid_unpaid_query), true);
        //paid -> in different methods
        $payments_query = "SELECT SUM(ps.montant) as total, ps.Reglement as title FROM payment_sales ps
                            WHERE ps.sale_id IN (SELECT id FROM sales WHERE created_at>= ? AND created_at <= ? AND deleted_at is NULL AND user_id=?)
                            AND ps.deleted_at is NULL
                            GROUP BY ps.Reglement";

        $payments_results = DB::select($payments_query, [$from, $to, $user_id]);
        $payments_results = json_decode(json_encode($payments_results), true);

        //Held Items Query
        $heldItems = "SELECT details FROM held_items WHERE created_at>= ? AND created_at <= ?  AND user_id=?";

        $held_results = DB::select($heldItems, [$from, $to, $user_id]);
        $total = 0;
        foreach ($held_results as $item) {
            $items = json_decode($item->details);
            foreach ($items as $held_item) {
                $total += $held_item->subtotal;
            }
        }
        $data_held_results[] = ["title"=>"Total Held Sales", "total"=>$total];
        return array_merge($paid_unpaid_query_results, $payments_results,$data_held_results );
    }
}

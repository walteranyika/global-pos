<?php

namespace App\Exports;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\RegistersEventListeners;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;


class DailySalesExport implements FromArray, WithHeadings, ShouldAutoSize, WithEvents
{
    private $fromDate;
    private $toDate;
    use  RegistersEventListeners;


    /**
     * @param $fromDate
     * @param $toDate
     */
    public function __construct($fromDate, $toDate)
    {
        $this->fromDate = $fromDate;
        $this->toDate = $toDate;
    }


    public function array(): array
    {
        $from =  Carbon::createFromFormat('Y-m-d H:i a', $this->fromDate, 'Africa/Nairobi');
        $to =  Carbon::createFromFormat('Y-m-d H:i a', $this->toDate, 'Africa/Nairobi');

        $query = "SELECT p.name AS product, p.shop,  p.price AS price, subquery.Quantity, subquery.Total FROM (SELECT sd.product_id as product_id,
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

        $summary_query = "SELECT SUM(ps.montant) as Total, ps.Reglement as Method FROM payment_sales ps
                            WHERE ps.sale_id IN (SELECT id FROM sales WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                            AND ps.deleted_at is NULL
                            GROUP BY ps.Reglement";
        $summary = DB::select($summary_query, [$from, $to]);
        $summary_data = [["product"=>"" ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""],["product"=>strtoupper("Payment Methods") ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""]];
        foreach ($summary as $item) {
            $summary_data[] = ["product"=>strtoupper($item->Method) ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>$item->Total];
        }

        $unpaid_partial_credit = "SELECT SUM(s.GrandTotal - s.paid_amount) as Total , s.statut as Method FROM sales s
                                  WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?
                                  AND s.deleted_at is NULL
                                  AND s.payment_statut IN ('unpaid','partial')
                                  GROUP BY s.statut";
        $unpaid_partial_credit_results = DB::select($unpaid_partial_credit, [$from, $to]);
        $unpaid_partial_credit_data = [["product"=>"" ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""],["product"=>strtoupper("Unpaid and Partial Payments") ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""]];
        foreach ($unpaid_partial_credit_results as $item) {
            $unpaid_partial_credit_data[] = ["product"=>strtoupper($item->Method) ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>$item->Total];
        }
        //----------------------

        $shop_summary_sql = "SELECT SUM(sd.total) as total , p.shop FROM sale_details sd
                JOIN products p
                ON p.id=sd.product_id
                WHERE sd.sale_id IN (SELECT id FROM sales  WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at is NULL)
                GROUP BY p.shop";

        $shops = DB::select($shop_summary_sql, [$from, $to]);
        $shops_data = [["product"=>"" ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""],["product"=>strtoupper("Shops Data") ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>""]];
        foreach ($shops as $item) {
            $shops_data[] = ["product"=>strtoupper($item->shop) ,"Shop"=>"","price"=>"","Quantity"=>"" ,"Total"=>$item->total];
        }
        return array_merge($products_sales_info, $summary_data, $unpaid_partial_credit_data, $shops_data);
    }

    public static function afterSheet(AfterSheet $event)
    {

    }

    public function headings(): array
    {
        return ['Product', 'Department', 'Unit Price',  'Quantity Sold', 'Total'];
    }
}

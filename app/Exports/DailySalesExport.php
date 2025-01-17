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

        return DB::select($query, [$from, $to]);
    }

    public static function afterSheet(AfterSheet $event)
    {

    }

    public function headings(): array
    {
        return [ 'Product', 'Department', 'Unit Price',  'Quantity Sold', 'Total'];
    }
}

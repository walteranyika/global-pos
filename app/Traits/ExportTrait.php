<?php
namespace App\Traits;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

trait ExportTrait{
    public function getData($start_date, $end_date){
        $period = CarbonPeriod::create(Carbon::parse($start_date), Carbon::parse($end_date));
        $all = array();
        $dates = array();
        foreach ($period as $date) {
            $date_string = $date->format('Y-m-d');
            $dates[] = $date_string;
            $sql = "SELECT P.id, P.name, coalesce(sum(S.quantity),0) as quantity, 
                     coalesce(sum(S.total),0) as total, coalesce(date,'$date_string') as date
                    FROM products P LEFT JOIN
                     (
                       SELECT product_id, quantity, total, date FROM `sale_details` WHERE sale_details.date='$date_string'
                     ) S
                     ON P.id=S.product_id 
                     GROUP BY P.id 
                     ORDER BY P.id";
            $results = DB::select($sql);
            $column = array();
            foreach ($results as $res) {
                $column[] = array(
                    'id' => $res->id,
                    'name' => $res->name,
                    'quantity' => $res->quantity,
                    'date' => $res->date,
                    'total' => $res->total
                );
            }
            $all[] = $column;
        }

        $column_totals = [];
        foreach ($all as $col) {
            $total = array_sum(array_values(array_column($col, 'total')));
            $column_totals[] = $total == 0 ? "-" : $total;
        }
        array_unshift($column_totals, "Daily Totals");
        //prepare each row
        array_unshift($dates, "Product/Dates");
        $dates[] = "Totals";
        $heading_row = array_values($dates);
        $product_names = array_column($all[0], 'name');
        array_unshift($all, $product_names);
        $size = count($product_names);
        $grid = array();
        $grand_total = 0;
        for ($i = 0; $i < $size; $i++) {
            $row = array();
            $row_total = 0;
            foreach ($all as $key => $column) {
                if (!is_array($column[$i])) {
                    $row[] = $column[$i];
                } else {
                    $quantity = $column[$i]['quantity'];
                    $row[] = $quantity == 0 ? "-" : $quantity;
                    $row_total += $column[$i]['total'];
                }
            }
            $row[] = $row_total == 0 ? "-" : $row_total;
            $grand_total += $row_total;
            $grid[] = array_values($row);
        }
        $column_totals[] = $grand_total;
        $grid[] = array_values($column_totals);
        return array($grid, $heading_row);
    }
}
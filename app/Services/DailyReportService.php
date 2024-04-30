<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Product;
use App\Models\product_warehouse;
use App\Models\Role;
use App\Models\Sale;
use Carbon\Carbon;
use DB;
use Illuminate\Support\Facades\Log;

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
}
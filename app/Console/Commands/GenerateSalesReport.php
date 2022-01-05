<?php

namespace App\Console\Commands;

use App\Mail\DailySalesMailer;
use App\Models\Item;
use App\Models\Product;
use App\Models\product_warehouse;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class GenerateSalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate daily sales report';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        Item::truncate();
        $sales = Sale::with( 'details')
                    ->where('deleted_at', '=', null)
                    ->where("created_at",">",Carbon::now()->subDay())
                    ->get();
        $group_id = rand(1000,100000);
        $products= Product::all();
        foreach ($products as $product){
            $product_closing_stock = product_warehouse::where('product_id', $product->id)
                ->where('deleted_at', '=', null)
                ->get();
            $closing_stock=0;
            foreach ($product_closing_stock as $product_warehouse) {
                $closing_stock += $product_warehouse->qte;
            }
            Item::create(["product_id"=>$product->id,"product_name"=>$product->name,'closing_stock'=>$closing_stock,"group_id"=>$group_id]);
        }
        //product name, opening stock, closing stock, sales, price
        foreach ($sales as $sale) {
            $details = $sale->details;
            foreach ($details as $detail){
                $product_id= $detail->product_id;
                $item =Item::where(["product_id"=>$product_id,"group_id"=>$group_id ])->first();
                $item->sales += $detail->quantity;
                $item->price += $detail->total;
                $item->save();
            }
        }

        $items = Item::where(['group_id'=>$group_id])->get();
        $total_sales=0;
        foreach ($items as $item){
            $item->opening_stock = $item->closing_stock + $item->sales;
            $item->save();
            $total_sales+=$item->price;
        }

        $data = Item::where(['group_id'=>$group_id])->orderBy('product_name')->get();
        if (count($data)>0){
            $date = Carbon::now()->subDay();
            $mailer = new DailySalesMailer($date->format('d-m-Y'), $data, $total_sales);
            $user = User::find(1);
            $email= $user->email;
            Mail::to($email)->send($mailer);
        }
        return 0;
    }
}

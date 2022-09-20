<?php

namespace App\Console\Commands;

use App\Mail\UserSalesReportMailer;
use App\Models\SaleDetail;
use App\Models\User;
use App\Models\UserSales;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserSalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:sales';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sales per user for the previous one day';

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
        $details = SaleDetail::with('product', 'sale.user')
             ->whereHas('sale', function ($query) {
                 //$query->where("created_at",">=",Carbon::yesterday());
                 $query->where("created_at",">", Carbon::now()->subDay());
             })->get();
        UserSales::truncate();
        foreach ($details as $sale){
            $data = [
                "user_id"=> $sale->sale->user->id,
                "names"=> $sale->sale->user->firstname." ".$sale->sale->user->lastname,
                "product_id"=> $sale->product->id,
                "product"=> $sale->product->name,
                "quantity"=> $sale->quantity,
                "unit_price"=> $sale->product->price,
                "sub_total"=> $sale->total,
            ];
            $user_sale = UserSales::where(["user_id"=>$data["user_id"], "product_id"=>$data["product_id"]])->first();
            if ($user_sale){
                //update record
                $user_sale->quantity +=$data["quantity"];
                $user_sale->sub_total +=$data["sub_total"];
                $user_sale->save();
            }else{
                //create new record
                UserSales::create($data);
            }
        }

        $user_sales = User::with('sales')->whereHas("sales")->get();

      //  Log::info("Started inserting ".count($user_sales));
        if (count($user_sales)){
            $mailer = new UserSalesReportMailer($user_sales);
            $user = User::find(1);
            $email = "walteranyika@gmail.com";//$user->email;
            Mail::to($email)->send($mailer);
           // Log::info("Done sending ");
        }else{
            Log::info("0 sales to process");
        }

        return 0;
    }
}

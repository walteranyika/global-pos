<?php

namespace App\Console\Commands;

use App\Exports\SalesReportsExport;
use App\Exports\UserSalesReportsExport;
use App\Mail\UserSalesReportMailer;
use App\Models\SaleDetail;
use App\Models\User;
use App\Models\UserSales;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
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
                $query->where("created_at", ">", Carbon::now()->subDay());
            })->get();
        UserSales::truncate();
        foreach ($details as $sale) {
            $data = [
                "user_id" => $sale->sale->user->id,
                "names" => $sale->sale->user->firstname . " " . $sale->sale->user->lastname,
                "product_id" => $sale->product->id,
                "product" => $sale->product->name,
                "quantity" => $sale->quantity,
                "unit_price" => $sale->product->price,
                "sub_total" => $sale->total,
            ];
            $user_sale = UserSales::where(["user_id" => $data["user_id"], "product_id" => $data["product_id"]])->first();
            if ($user_sale) {
                //update record
                $user_sale->quantity += $data["quantity"];
                $user_sale->sub_total += $data["sub_total"];
                $user_sale->save();
            } else {
                //create new record
                UserSales::create($data);
            }
        }

        $user_sales = User::with('sales')->whereHas("sales")->get();

        $excel_data = [];
        $bold_rows = [];
        $loop = 1;
        $grand_total =0;
        foreach ($user_sales as $user) {
            $sub_total = 0;
            foreach ($user->sales as $sale) {
                $names = $sale->names;
                foreach ($excel_data as $data) {
                    if ($data[0] == $names) {
                        $names = "";
                    }
                }
                $sub_total += $sale->sub_total;
                $excel_data[] = [
                    $names,
                    $sale->product,
                    $sale->quantity,
                    $sale->unit_price,
                    $sale->sub_total,
                ];
                $loop++;

            }
            $bold_rows[] = $loop+1;
            $grand_total += $sub_total;
            $excel_data[] = ["Total Sales for " . $sale->names, "", "", "", "$sub_total"];
        }
        $excel_data[] = ["Total", "", "", "", "$grand_total"];

//        $filename = "user_sales_report_on_" . \Carbon\Carbon::now()->format("d_m_Y-h_i") . ".xlsx";
//        Excel::store(new UserSalesReportsExport($excel_data, ["Name", "Product", "Quantity", "Price", "Total"], $bold_rows), $filename);

        $csv_data = [
            'excel_data'=>$excel_data,
            'headings'=>["Name", "Product", "Quantity", "Price", "Total"],
            'bold_rows'=>$bold_rows,
        ];
        //  Log::info("Started inserting ".count($user_sales));
        if (count($user_sales)) {
            $mailer = new UserSalesReportMailer($user_sales, $csv_data);
            $user = User::find(1);
            if (App::environment('local')) {
                $email = config('values.updates_email', null);
            } else {
                $email = $user->email;
            }

            if (!is_null($email)) {
                 Mail::to($email)->send($mailer);
            } else {
                Log::info("Empty email");
            }
            // Log::info("Done sending ");
        } else {
            Log::info("0 sales to process");
        }

        return 0;
    }
}

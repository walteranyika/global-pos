<?php

namespace App\Console\Commands;

use App\Mail\DailySalesMailer;
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
        $sales = Sale::with('facture', 'client', 'warehouse')
                    ->where('deleted_at', '=', null)
                    ->where("created_at",">",Carbon::now()->subDay())
                    ->get();
        $data=[];
        $total_sales = 0;
        foreach ($sales as $sale) {
            $data[] = [
                'reference' => $sale['Ref'],
                'status' => $sale['statut'],
                'customer' => $sale['client']['name'],
                'amount' => number_format($sale['GrandTotal']),
                'payment_method' => $sale['facture'][0]->Reglement,
            ];
            $total_sales +=$sale['GrandTotal'];
        }
        if (count($data)>0){
            $date = Carbon::now()->subDay();
            $mailer = new DailySalesMailer($date->format('d-m-Y'), $data, $total_sales);
            Mail::to(env('MAIL_TO') ?? 'walteranyika@gmail.com')
                  ->send($mailer);
        }
        return 0;
    }
}

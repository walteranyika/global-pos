<?php

namespace App\Console\Commands;

use App\Services\DailyReportPrinter;
use App\Services\DailyReportService;
use Illuminate\Console\Command;

class PrintSalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'print:report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Print daily report';

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
        $printingService = new DailyReportService();
        $printingService->print();
        return 0;
    }
}

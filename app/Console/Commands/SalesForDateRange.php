<?php

namespace App\Console\Commands;

use App\Exports\SalesReportsExport;
use App\Traits\ExportTrait;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class SalesForDateRange extends Command
{
    use ExportTrait;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate all sales within a specific date range';

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
        list($grid, $heading_row) = $this->getData('2022-02-01','2022-02-09');
        $filename = "SalesReport_On_" . Carbon::now()->format("d_m_Y-h_i") . ".xlsx";
        Excel::store(new SalesReportsExport($grid, $heading_row), $filename);
        return 0;
    }
    //https://docs.laravel-excel.com/3.1/exports/export-formats.html
}

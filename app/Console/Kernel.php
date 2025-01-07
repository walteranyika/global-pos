<?php

namespace App\Console;

use Illuminate\Support\Facades\Cookie;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Http\Controllers\BaseController;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
        'App\Console\Commands\DatabaseBackUp',
        'App\Console\Commands\GenerateSalesReport',
        'App\Console\Commands\SalesForDateRange',
        'App\Console\Commands\UserSalesReport',
        'App\Console\Commands\PrintSalesReport',
        'App\Console\Commands\EncryptPins',
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {

        $schedule->command('database:backup')->twiceDaily(8, 23);
        $schedule->command('print:report')->dailyAt('17:00'); // 5 PM
        $schedule->command('print:report')->dailyAt('23:59'); // 11:59 PM
        // $schedule->command('print:report')->everyMinute(); // 11:59 PM

    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

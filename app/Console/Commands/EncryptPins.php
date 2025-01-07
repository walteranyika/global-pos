<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Traits\ExportTrait;
use Illuminate\Console\Command;

class EncryptPins extends Command
{
    use ExportTrait;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'secure:pin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Secure all pins for users';

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
        $users = User::all();
        foreach ($users as $user) {
            if (is_numeric($user->pin)){
                $user->pin = md5($user->pin);
                $user->save();
            }
        }
        return 0;
    }
}

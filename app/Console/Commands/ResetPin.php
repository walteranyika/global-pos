<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Traits\ExportTrait;
use Illuminate\Console\Command;

class ResetPin extends Command
{
    use ExportTrait;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reset:pin {id} {pin}';

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
    public function handle(): int
    {
        $userId = $this->argument('id');
        $newPin = $this->argument('pin');

        $user = User::find($userId);
        if ($user){
            $user->pin = md5($newPin);
            $user->save();
        }
        return 0;
    }
}

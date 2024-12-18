<?php
namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Insert some stuff
        DB::table('rooms')->insert(
            array(
                'room_number' => 'A1',
                'name' => 'Simba',
                'type' => 'SINGLE',
                'price' => 10000.00,
                'description' => 'Single self contained room',
                'created_at' => Carbon::now()
            )
        );
    }
}

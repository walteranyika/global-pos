<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       // Insert some stuff
        DB::table('settings')->insert(
            array(
                'id' => 1,
                'email' => 'admin@gmail.com',
                'currency_id' => 1,
                'client_id' => 1,
                'warehouse_id' => Null,
                'CompanyName' => 'Tomida Ltd',
                'CompanyPhone' => '0723987654',
                'CompanyAdress' => 'Wonder Street',
                'footer' => 'Chui POS Systems',
                'developed_by' => 'Chui Systems',
                'logo' => 'logo-default.png',
                'till_no' => '123456',
                'display' => 'list',
            )

        );
    }
}

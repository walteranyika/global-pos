<?php

namespace Database\Seeders;

use App\Models\Shop;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Shop::create(['name' => 'Restaurant']);
        Shop::create(['name' => 'Bar']);
        Shop::create(['name' => 'Choma Zone']);
        Shop::create(['name' => 'Swimming pool']);
        Shop::create(['name' => 'Rooms']);
    }
}

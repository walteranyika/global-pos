<?php

use App\Models\Shop;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class PopulateShops extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Shop::create(['name' => 'Bar']);
        Shop::create(['name' => 'Swimming pool']);
        Shop::create(['name' => 'Rooms']);
        Shop::create(['name' => 'Choma Zone']);
        Shop::create(['name' => 'Pastry']);
        Shop::create(['name' => 'Restaurant']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}

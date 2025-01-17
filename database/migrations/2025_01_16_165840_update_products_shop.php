<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UpdateProductsShop extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("UPDATE products  SET shop = 'Bar' WHERE category_id IN(13,14,15,16,17,18,19,20,21,22,23,24,25)");
        DB::statement("UPDATE products  SET shop = 'Swimming pool' WHERE category_id IN(45,46)");
        DB::statement("UPDATE products  SET shop = 'Rooms' WHERE category_id IN (37,38,39,40,41,42,43,44)");
        DB::statement("UPDATE products  SET shop = 'Choma Zone' WHERE category_id IN (3)");
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

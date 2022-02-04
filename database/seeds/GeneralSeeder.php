<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Provider;
use App\Models\Unit;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class GeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Category::create(["code"=>"001","name"=>"General"]);
        Brand::create(['name'=>'Default', 'description'=>'Default brand']);
        Provider::create(['name'=>'General Supplies', 'code'=>'001', 'adresse'=>'30502-Kenya', 'phone'=>'0701223432', 'country'=>'Kenya', 'email'=>'info@generalsupplies.com', 'city'=>'Capital',]);
        Warehouse::create(['name'=>'General Shop', 'mobile'=>'072345678', 'country'=>'Kenya', 'city'=>'Capital', 'email'=>'info@generalshop.com', 'zip'=>'50205',]);
        Unit::create([ 'name'=>'Piece', 'ShortName'=>'PC', 'base_unit'=>1, 'operator'=>1, 'operator_value'=>1]);
    }
}

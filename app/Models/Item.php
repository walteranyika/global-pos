<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;
    protected $fillable=["product_id","product_name", "opening_stock", "closing_stock", "sales", "price","group_id"];
}

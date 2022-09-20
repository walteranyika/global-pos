<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSales extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'names', 'product_id', 'product', 'quantity', 'unit_price', 'sub_total'];
    public function user()
    {
        return $this->belongsTo('App\Models\User');
    }
}

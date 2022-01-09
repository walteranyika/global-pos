<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       // Insert some stuff
        DB::table('users')->insert(
            array(
                'id' => 1,
                'firstname' => 'Tomida',
                'lastname' => 'Yoshiro',
                'username' => 'Tomida',
                'email' => 'admin@gmail.com',
                'password' => '$2y$10$IFj6SwqC0Sxrsiv4YkCt.OJv1UV4mZrWuyLoRG7qt47mseP9mJ58u',//123456
                'avatar' => 'no_avatar.png',
                'phone' => '0723454678',
                'role_id' => 1,
                'statut' => 1,
            )
        );
    }
}

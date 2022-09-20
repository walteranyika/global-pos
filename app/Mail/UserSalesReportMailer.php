<?php

namespace App\Mail;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;

class UserSalesReportMailer extends Mailable
{
    use Queueable, SerializesModels;

    private $user_sales;

    /**
     * Create a new message instance.
     *
     * @param $user_sales
     */
    public function __construct($user_sales)
    {
        $this->user_sales = $user_sales;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $yesterday = Carbon::now()->subDay();
        return $this->subject('User Sales report for ' . $yesterday->format('d-m-Y'))
            ->view('emails.user_sales')
            ->with(['users' => $this->user_sales]);
    }
}

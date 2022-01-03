<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DailySalesMailer extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    private $date;
    private $data;
    private $total;

    public function __construct($date, $data, $total)
    {
        $this->date = $date;
        $this->data = $data;
        $this->total = $total;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Sales report for '.$this->date)
            ->view('emails.sales')
            ->with(['data'=>$this->data,'total'=>$this->total]);
    }
}

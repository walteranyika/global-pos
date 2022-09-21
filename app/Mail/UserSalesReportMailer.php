<?php

namespace App\Mail;

use App\Exports\UserSalesReportsExport;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class UserSalesReportMailer extends Mailable
{
    use Queueable, SerializesModels;

    private $user_sales;
    private $csv_data;

    /**
     * Create a new message instance.
     *
     * @param $user_sales
     * @param $csv_data
     */
    public function __construct($user_sales, $csv_data)
    {
        $this->user_sales = $user_sales;
        $this->csv_data = $csv_data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $yesterday = Carbon::now()->subDay();
        $filename = "user_sales_report_on_" . \Carbon\Carbon::now()->format("d_m_Y") . ".xlsx";
        $excel_data = $this->csv_data['excel_data'];
        $headings = $this->csv_data['headings'];
        $bold_rows = $this->csv_data['bold_rows'];
        return $this->subject('User Sales report for ' . $yesterday->format('d-m-Y'))
            ->view('emails.user_sales')
            ->attach(Excel::download(new UserSalesReportsExport($excel_data, $headings, $bold_rows), $filename)
                ->getFile(), ['as' => $filename])
            ->with(['users' => $this->user_sales]);
    }
}

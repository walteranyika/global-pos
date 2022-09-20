<?php

namespace App\Exports;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesReportsExport  implements FromArray, WithHeadings, WithStyles,ShouldAutoSize
{
    protected $data;
    protected $headings;

    /**
     * @param $data
     */
    public function __construct($data, $headings)
    {
        $this->data = $data;
        $this->headings=$headings;
    }

    public function array():array
    {
        return  $this->data;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function styles(Worksheet $sheet)
    {
        $last_row = count($this->data)+1;
        $last_column_number = count($this->headings)-1;
        $last_column_name = $this->getNameFromNumber($last_column_number);
        $sheet->getStyle($last_column_name)->getFont()->setBold(true);
        return [
            1    => ['font' => ['bold' => true,'size' => 12]],
            $last_row   => ['font' => ['bold' => true,'size' => 12]],
        ];
    }

    private function getNameFromNumber($num) {
        $numeric = $num % 26;
        $letter = chr(65 + $numeric);
        $num2 = intval($num / 26);
        if ($num2 > 0) {
            return $this->getNameFromNumber($num2 - 1) . $letter;
        } else {
            return $letter;
        }
    }

}
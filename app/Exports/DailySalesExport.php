<?php

namespace App\Exports;

use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\RegistersEventListeners;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;


class DailySalesExport implements FromArray, WithHeadings, ShouldAutoSize, WithEvents, WithStyles
{
    private $data;
    use  RegistersEventListeners;

    public function __construct($data)
    {
        $this->data = $data;
    }


    public function array(): array
    {
        return $this->data;
    }

    public static function afterSheet(AfterSheet $event)
    {

    }

    public function headings(): array
    {
        return ['Product', 'Department', 'Unit Price', 'Quantity Sold', 'Total'];
    }

    public function styles(Worksheet $sheet)
    {

        $styles = [];
        $dataRowCount = count($this->data); // Number of data rows
        $totalRowIndex = $dataRowCount + 1; // Footer row index

        // Loop through each product to apply conditional styling
        $columns = range('A', 'E');
        foreach ($this->data as $index => $product) {
            $rowIndex = $index + 2; // Adjust for Excel's 1-based indexing

            if ($product["Shop"] == "" && $product["price"] == "" && $product["Quantity"] == "" && $product["Total"] == "") {
                // Apply red background for rows with quantity < 10
//                $styles[$rowIndex] = [
//                    'font' => ['bold' => true, 'color' => ['rgb' => '3374FF']], // White text
//                ];
                foreach ($columns as $column) {
                    $cell = "{$column}{$rowIndex}";
                    $styles[$cell] = [
                        'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']],
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], // White text
                     ];
                }
            }
        }

        /*$lastRowIndex = $dataRowCount + 2; // Includes totals row
        $columns = range('A', 'J'); //
        foreach (range(1, $lastRowIndex) as $rowIndex) {
            foreach ($columns as $column) {
                $cell = "{$column}{$rowIndex}"; // Cell address (e.g., A1, B2)
                $styles[$cell] = [
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000'], // Black border color
                        ],
                    ],
                ];
            }
        }*/

        //Style the header row
        $styles[1] = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']], // Green background
        ];

        // Optional: Style the totals row
        $styles[$totalRowIndex] = [
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']], // Gold background
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], // Black text
        ];

        return $styles;
    }
}

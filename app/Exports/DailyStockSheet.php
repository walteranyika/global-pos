<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DailyStockSheet implements FromArray, WithHeadings, ShouldAutoSize, WithEvents, WithStyles
{

    protected $data;

    /**
     * @param $data
     */
    public function __construct($data)
    {
        $this->data = $data;
    }


    public function array(): array
    {
        $finalData = [];
        foreach ($this->data as $index => $item) {
            $rowIndex = $index + 2; // Adjust for Excel's 1-based indexing and headings row
            $to_show = [];
            $to_show['name'] = strtoupper($item->name);
            $to_show['cost'] = $item->cost;
            $to_show['opening_stock'] = $item->stock_level + $item->qty_sold -  $item->qty_purchased;
            $to_show['quantity_purchased'] = $item->qty_purchased;
            $to_show['price'] = $item->price;
            $to_show['inventory_value'] = "=B{$rowIndex}*G{$rowIndex}";//$item->stock_level * $item->cost;
            $to_show['units_sold'] = $item->qty_sold;
            $to_show['closing_stock'] = $item->stock_level;
            $to_show['profit_margin'] = "=F{$rowIndex}*(D{$rowIndex}-B{$rowIndex})";//$item->qty_sold * abs($item->cost - $item->price);
            $to_show['re_order_quantity'] = $item->stock_alert;
            $finalData[] = $to_show;
        }

        $totalRowIndex = count($this->data) + 1; // Adjust for headings and data rows
        $finalData[] = [
            'name'=>'TOTALS',
            'cost'=>'',
            'opening_stock'=>'',
            'quantity_purchased'=>'',
            'price'=>'',
            'inventory_value'=>"=SUM(E2:E{$totalRowIndex})",
            'units_sold'=>'',
            'closing_stock'=>'',
            'profit_margin'=>"=SUM(H2:H{$totalRowIndex})",
            're_order_quantity'=>'',
        ];
        return $finalData;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $cellRange = 'A1:I1'; // All headers
                $event->sheet->getDelegate()->getStyle($cellRange)->getFont()->setSize(12);

                $styleArray = [
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['argb' => 'FFFF0000'],
                        ],
                    ],

                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    ],
                ];

            },
        ];
    }

    public function headings(): array
    {
        return [
                'Name',
                'Unit Price',
                'Opening Stock',
                'Quantity Purchased',
                'Selling Price',
                'Inventory Value',
                'Units Sold',
                'Closing Stock',
                'Profit Margins',
                'Re-Order Quantity',
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

    public function styles(Worksheet $sheet)
    {
        /*$totalRowIndex = count($this->data) + 2; // Adjust for headings and data rows
        return [
            "I1:I{$totalRowIndex}"=> [
                'font' => ['color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '577BC1']],
            ],
            // Style the header row
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']], // Green background
            ],
            "2:{$totalRowIndex}" => [ // Dynamically apply styles to all data rows
                'font' => ['size' => 10],
            ],
            // Style the totals row
            $totalRowIndex => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']], // Orange background
            ],
        ];*/

        $styles = [];
        $dataRowCount = count($this->data); // Number of data rows
        $totalRowIndex = $dataRowCount + 2; // Footer row index

        // Loop through each product to apply conditional styling
        foreach ($this->data as $index => $product) {
            $rowIndex = $index + 2; // Adjust for Excel's 1-based indexing
            if ($product->stock_level < $product->stock_alert) {
                // Apply red background for rows with quantity < 10
                $styles[$rowIndex] = [
                    'fill' => [
                        'fillType' => 'solid',
                        'startColor' => ['rgb' => 'FFFFFF'], // Red background
                    ],
                    'font' => ['color' => ['rgb' => 'C30E59']], // White text
                ];
            }
        }

        $lastRowIndex = $dataRowCount + 2; // Includes totals row
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
        }

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

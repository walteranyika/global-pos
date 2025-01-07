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

class SalesStockSheet implements FromArray, WithHeadings, ShouldAutoSize, WithEvents, WithStyles
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
            $to_show = [];
            $to_show['name'] = strtoupper($item->name);
            $to_show['opening_stock'] = $item->stock_level + $item->qty_sold -  $item->qty_purchased;
            $to_show['units_sold'] = $item->qty_sold;
            $to_show['closing_stock'] = $item->stock_level;
            $to_show['quantity_purchased'] = $item->qty_purchased;
            $finalData[] = $to_show;
        }
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
                'Opening Stock',
                'Units Sold',
                'Closing Stock',
                'Quantity Purchased',
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
        $totalRowIndex = count($this->data) + 2;
        return [
            // Style the header row
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '344CB7']],
            ],
            "2:{$totalRowIndex}" => [ // Dynamically apply styles to all data rows
                'font' => ['size' => 10],
            ]
        ];

    }
}

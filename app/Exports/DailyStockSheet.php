<?php

namespace App\Exports;

use Illuminate\Support\Facades\Log;
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
        foreach ($this->data as $item) {
            $to_show = [];
            $to_show['name'] = strtoupper($item->name);
            $to_show['cost'] = $item->cost;
            $to_show['opening_stock'] = $item->stock_level + $item->qty_sold -  $item->qty_purchased;
            $to_show['price'] = $item->price;
            $to_show['inventory_value'] = $item->stock_level * $item->cost;
            $to_show['units_sold'] = $item->qty_sold;
            $to_show['closing_stock'] = $item->stock_level;
            $to_show['profit_margin'] = $item->qty_sold * abs($item->cost - $item->price);
            $to_show['re_order_quantity'] = 0.00;
            $finalData[] = $to_show;
        }
        return $finalData;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $cellRange = 'A1:I1'; // All headers
                $event->sheet->getDelegate()->getStyle($cellRange)->getFont()->setSize(14);

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
        $last_row = count($this->data)+1;
        $last_column_number = count($this->headings())-1;
        $last_column_name = $this->getNameFromNumber($last_column_number);
       // $sheet->getStyle($last_column_name)->getFont()->setBold(true);

        $styling =[];
        $styling[1] =  ['font' => ['bold' => true,'size' => 13]];
        for ($i = 1; $i <=$last_row ; $i++) {
            $styling[$i] = ['font' => ['size' => 10]];
        }

        //$styling[$last_row] =  ['font' => ['bold' => true,'size' => 10]];

        return $styling;
    }
}

<?php

namespace App\Exports;
use App\Models\Item;
use App\Models\Product;
use App\Models\product_warehouse;
use App\Models\Role;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;

class DailySalesExport implements FromArray, WithHeadings, ShouldAutoSize, WithEvents
{
    private $fromDate;
    private $toDate;

    /**
     * @param $fromDate
     * @param $toDate
     */
    public function __construct($fromDate, $toDate)
    {
        $this->fromDate = $fromDate;
        $this->toDate = $toDate;
    }


    public function array(): array
    {
        Item::truncate();
        if ($this->fromDate != ""){
           $from =  Carbon::createFromFormat('Y-m-d H:i a', $this->fromDate, 'Africa/Nairobi');
        }else{
            $from = Carbon::now()->subDay();
        }

        if ($this->toDate != ""){
            $to =  Carbon::createFromFormat('Y-m-d H:i a', $this->toDate, 'Africa/Nairobi');
        }else{
            $to = Carbon::now();
        }
        $sales = Sale::with( 'details')
            ->where('deleted_at', '=', null)
            ->where("created_at",">=", $from)
            ->where("created_at","<=", $to)
            ->get();
        $group_id = rand(1000,100000);
        $products= Product::where('deleted_at', '=', null)->get();
        foreach ($products as $product){
            $product_closing_stock = product_warehouse::where('product_id', $product->id)
                ->where('deleted_at', '=', null)
                ->get();
            $closing_stock=0;
            foreach ($product_closing_stock as $product_warehouse) {
                $closing_stock += $product_warehouse->qte;
            }
            Item::create(["product_id"=>$product->id,"product_name"=>$product->name,'closing_stock'=>$closing_stock,"group_id"=>$group_id]);
        }
        foreach ($sales as $sale) {
            $details = $sale->details;
            foreach ($details as $detail){
                $product_id= $detail->product_id;
                $item =Item::where(["product_id"=>$product_id,"group_id"=>$group_id ])->first();
                $item->sales += $detail->quantity;
                $item->price += $detail->total;
                $item->save();
            }
        }

        $items = Item::where(['group_id'=>$group_id])->get();
        $total_sales=0;
        foreach ($items as $item){
            $item->opening_stock = $item->closing_stock + $item->sales;
            $item->save();
            $total_sales+=$item->price;
        }
        $tasks =  Item::where(['group_id'=>$group_id])->orderBy('price','desc')->get();
        $data=[];
        $i=1;
        foreach ($tasks as $item) {
            $row['#'] = $i;
            $row['Product']  = $item->product_name;
            $row['Opening_Stock'] = $item->opening_stock;
            $row['Closing_Stock'] = $item->closing_stock;
            $row['Sales']  = (empty($item->sales)) ? '0' : $item->sales;
            $row['Price']  = (empty($item->price)) ? '0' : $item->price;
            $i++;
            $data[] = $row;
        }
        return  $data;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $cellRange = 'A1:F1'; // All headers
                $event->sheet->getDelegate()->getStyle($cellRange)->getFont()->setSize(14);

                $styleArray = [
                    'borders' => [
                        'outline' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                            'color' => ['argb' => 'FFFF0000'],
                        ],
                    ],

                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
                    ],
                ];

            },
        ];
    }

    public function headings(): array
    {
        return ['#','Product', 'Opening_Stock', 'Closing_Stock', 'Sales', 'Price'];
    }
}
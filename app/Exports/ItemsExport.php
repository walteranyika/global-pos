<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use phpDocumentor\Reflection\Types\Collection;

class ItemsExport implements FromCollection, WithHeadings
{
    protected $data;

    /**
     * Write code on Method
     *
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Write code on Method
     *
     * @return Collection
     */
    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return  ['Product', 'Opening Stock', 'Closing Stock', 'Sales', 'Price'];
    }
}

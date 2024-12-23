<?php

namespace App\Traits;

use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

trait PrinterTrait
{
    public function printHeaderDetails($printer){
        $setting = Setting::where('deleted_at', '=', null)->first();
        $printer->setJustification(Printer::JUSTIFY_CENTER);

        $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $printer -> setFont(Printer::FONT_B);
        $printer -> setTextSize(2, 2);
        // $printer->setEmphasis(true);
        $printer->text($setting->CompanyName."\n");
        $printer->selectPrintMode();
        $printer->feed();
        $printer->setEmphasis(true);
        $printer->text($setting->CompanyAdress."\n");
        $printer->text("KENYA\n");
        $printer->text("Tel : ".$setting->CompanyPhone."\n");

    }

    public function printFooterInfo($printer){
        // $setting = Setting::where('deleted_at', '=', null)->first();
        $printer->setEmphasis(true);
        $printer->feed(2);
        $printer->text("BUY GOODS TILL NUMBER 4795680\n");
        $printer->feed();
        $printer->text("Goods once sold are not re-accepted\n");
        $printer->feed();
        $printer->text("Thank You and Come Again\n");
        $printer->feed();
        //$printer->text("BUSINESS NO. 522533 ACCOUNT NO. 7594825\n");
        $printer->setEmphasis(false);
    }

    private function getPrintConnector(){
        $connector = null;
        $os= strtolower(php_uname('s'));
        try{
            if($os=='linux'){
                $subject=shell_exec("ls /dev/usb/ | grep lp");
                preg_match_all('/(lp\d)/', $subject, $match);
                if(!empty($subject) && !empty($match)){
                    $device_url = "/dev/usb/".$match[0][0];
                }else{
                    $device_url= "php://stdout";
                }
                $connector = new FilePrintConnector($device_url);
                //$connector = new FilePrintConnector("/dev/usb/lp0");
                //$connector = new FilePrintConnector("php://stdout");
                //$connector = new NetworkPrintConnector("10.x.x.x", 9100);
                //$connector = new FilePrintConnector("data.txt");
            }else if($os=="windows nt"){
                $connector = new WindowsPrintConnector("pos_print");
            }else{
                $connector = new FilePrintConnector("data.txt");
            }
        }catch (\Exception $e){
            Log::error("Could not get the printer connector. ". $e->getMessage());
        }
        return $connector;
    }

}

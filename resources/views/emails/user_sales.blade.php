<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th, .table td {
            border: 1px solid darkgray;
            padding: 0;
        }

        .inner-padding {
            padding: 5px 2px !important;
        }
    </style>
</head>
<body>
<table class="table">
    <tr>
        <th style="padding: 6px; color:#4E4F50">User</th>
        <th colspan="4" style="border-bottom: none; text-align: center; padding: 6px; color:#4E4F50">Sales Details</th>
    </tr>
    @php
        $overall_grand_total = 0;
    @endphp
    @foreach($users as $user)
        <tr>
            <td style="border-right: none">{{$user->firstname.' '.$user->lastname}}</td>
            <td colspan="4" style="border:none; ">
                <table class="table" style="width:100%">
                    @if($loop->iteration==1)
                        <th style="text-align: left; width:40%">Product</th>
                        <th style="text-align: left; width:20%">Quantity Sold</th>
                        <th style="text-align: right; width:20%">Price</th>
                        <th style="text-align: right; width:20%">Sub Total</th>
                    @endif
                    @php
                        $grand_total = 0;
                    @endphp
                    @foreach($user->sales as $sale)
                        <tr>
                            <td class="inner-padding" style="width:40%;">{{$sale->product}}</td>
                            <td class="inner-padding" style="width:20%;">{{$sale->quantity}}</td>
                            <td style="text-align: right; width:20%;"
                                class="inner-padding">{{number_format($sale->unit_price)}}</td>
                            <td style="text-align: right; width:20%;"
                                class="inner-padding">{{number_format($sale->sub_total)}}</td>
                        </tr>
                        @php
                            $grand_total += $sale->sub_total;
                            $overall_grand_total +=$sale->sub_total;
                        @endphp
                    @endforeach
                    <tr style="background: #6d6b6b">
                        <th colspan="3" style="text-align: left; color: aliceblue; width: 80%;background: #6d6b6b; border-bottom: none;"
                            class="inner-padding">Total sales for {{$user->firstname}}</th>
                        <th style="text-align: right;width: 20%; color: aliceblue; background: #6d6b6b; border-bottom: none; "
                            class="inner-padding">{{number_format($grand_total)}}</th>
                    </tr>
                </table>
            </td>
        </tr>
    @endforeach
    <tr>
        <th style="text-align: left"><h4>Total Sales</h4></th>
        <th colspan="4" style="text-align: right;"><h4>Ksh {{number_format($overall_grand_total)}}</h4></th>
    </tr>
</table>
</body>
</html>
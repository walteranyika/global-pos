<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        .table {
            width: 90%;
            margin: auto;
            border: 1px solid darkgray;
            border-collapse: collapse;
        }

        .table th, .table td {
            border: 1px solid darkgray;
            padding-top: 6px;
            padding-bottom: 6px;
            padding-left: 4px;
        }
    </style>
</head>
<body>
<table class="table">
    <tr>
        <th>User</th>
        <th colspan="4"></th>
    </tr>
    @foreach($users as $user)
        <tr>
            <td>{{$user->firstname.' '.$user->lastname}}</td>
            <td colspan="4">
                <table class="table" style="width:100%">
                    <th style="text-align: left">Product</th>
                    <th style="text-align: left">Quantity Sold</th>
                    <th style="text-align: right">Price</th>
                    <th style="text-align: right">Sub Total</th>
                    @php
                        $grand_total = 0;
                    @endphp
                    @foreach($user->sales as $sale)
                        <tr>
                            <td>{{$sale->product}}</td>
                            <td>{{$sale->quantity}}</td>
                            <td style="text-align: right">{{number_format($sale->unit_price)}}</td>
                            <td style="text-align: right">{{number_format($sale->sub_total)}}</td>
                        </tr>
                        @php
                            $grand_total += $sale->sub_total;
                        @endphp
                    @endforeach
                    <tr>
                        <th colspan="3" style="text-align: left">Total</th>
                        <th style="text-align: right">{{number_format($grand_total)}}</th>
                    </tr>
                </table>
            </td>
        </tr>
    @endforeach
</table>
</body>
</html>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        .table{
            width: 100%;
            border: 1px solid darkgray;
            border-collapse: collapse;
        }
        .table th, .table td{
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
           <th>Reference</th>
           <th>Customer</th>
           <th>Payment Method</th>
           <th>Amount</th>
       </tr>
       @foreach($data as $sale)
           <tr>
               <td>{{$sale['reference']}}</td>
               <td>{{$sale['customer']}}</td>
               <td>{{$sale['payment_method']}}</td>
               <td>{{$sale['amount']}}</td>
           </tr>
       @endforeach
       <tr>
           <td colspan="3">
               Total Sales
           </td>
           <td>{{$total}}</td>
       </tr>
   </table>
</body>
</html>
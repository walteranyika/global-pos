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
           <th>#</th>
           <th>Product</th>
           <th>Opening Stock</th>
           <th>Closing Stock</th>
           <th>Sales</th>
           <th>Price</th>
       </tr>
       @foreach($data as $item)
           <tr>
               <td>{{$loop->index}}</td>
               <td>{{$item->product_name}}</td>
               <td>{{$item->opening_stock}}</td>
               <td>{{$item->closing_stock}}</td>
               <td>{{$item->sales}}</td>
               <td>{{$item->price}}</td>
           </tr>
       @endforeach
       <tr>
           <td colspan="4">
               <strong>Total Sales</strong>
           </td>
           <td><strong>{{$total}}</strong></td>
       </tr>
   </table>
</body>
</html>
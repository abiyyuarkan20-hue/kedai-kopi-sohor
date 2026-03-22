<?php
// Sesuaikan path ini! Pastikan folder 'midtrans-php-master' ada di folder yang sama dengan file php ini
require_once dirname(__FILE__) . '/config.php';
require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

\Midtrans\Config::$serverKey = 'Mid-server-r3KjRyre0accECubfgb_bToF';
\Midtrans\Config::$isProduction = false;
\Midtrans\Config::$isSanitized = true;
\Midtrans\Config::$is3ds = true;

// Gunakan try-catch di PHP agar jika error, kita bisa melihat pesannya di Console Browser
try {
    $items = json_decode($_POST['items'], true);
    
    // Pastikan format item sesuai keinginan Midtrans
    $item_details = array();
    foreach ($items as $item) {
        $item_details[] = array(
            'id'       => $item['id'],
            'price'    => (int)$item['price'],
            'quantity' => (int)$item['quantity'],
            'name'     => $item['name']
        );
    }

    $params = array(
        'transaction_details' => array(
            'order_id'     => rand(),
            'gross_amount' => (int)$_POST['total'],
        ),
        'item_details' => $item_details,
        'customer_details' => array(
            'first_name' => $_POST['name'],
            'email'      => $_POST['email'],
            'phone'      => $_POST['phoneNumber'],
        ),
    );

    $snapToken = \Midtrans\Snap::getSnapToken($params);
    echo $snapToken;

} catch (Exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
?>
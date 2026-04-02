<?php
require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

// Konfigurasi Supabase (Sama dengan yang ada di JS kamu)
$supabase_url = "https://oedjjfbfndfvqkrdqepm.supabase.co";
$supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGpqZmJmbmRmdnFrcmRxZXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTA2NTIsImV4cCI6MjA4OTc2NjY1Mn0.iToPibvOYgJC6vvThHUQn2zYzqzIMEoXjYXwbpT6kX4";

\Midtrans\Config::$serverKey = 'Mid-server-r3KjRyre0accECubfgb_bToF';
\Midtrans\Config::$isProduction = false;

try {
    $input_items = json_decode($_POST['items'], true);
    $item_details = array();
    $calculated_total = 0;

    foreach ($input_items as $item) {
        $id = (int)$item['id'];

        // AMBIL HARGA ASLI DARI SUPABASE VIA API
        $ch = curl_init("$supabase_url/rest/v1/products?id=eq.$id&select=price");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: $supabase_key",
            "Authorization: Bearer $supabase_key"
        ]);
        $response = curl_exec($ch);
        $db_product = json_decode($response, true);
        curl_close($ch);

        if (empty($db_product)) {
            throw new Exception("Produk ID $id tidak ditemukan di database!");
        }

        $real_price = (int)$db_product[0]['price'];
        $qty = (int)$item['quantity'];

        $item_details[] = [
            'id'       => $id,
            'price'    => $real_price,
            'quantity' => $qty,
            'name'     => $item['name']
        ];

        $calculated_total += ($real_price * $qty);
    }

    // Kirim ke Midtrans
    $params = [
        'transaction_details' => [
            'order_id'     => 'KOP-' . time() . '-' . rand(100, 999),
            'gross_amount' => $calculated_total,
        ],
        'item_details' => $item_details,
        'customer_details' => [
            'first_name' => $_POST['name'],
            'email'      => $_POST['email'],
            'phone'      => $_POST['phoneNumber'],
        ],
    ];

    echo \Midtrans\Snap::getSnapToken($params);

} catch (Exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
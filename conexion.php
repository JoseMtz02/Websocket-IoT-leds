<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Configuración de la conexión a la base de datos
$host = 'localhost:3307';
$dbname = 'sm52_arduino';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    // Configura el PDO error mode a excepción
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica si se solicita el último registro
    if (isset($_GET['latest']) && $_GET['latest'] == 'true') {
        // Consulta SQL para obtener el último dato
        $sql = "SELECT mensaje, fecha, led_color FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 10";
    } else {
        // Consulta SQL para obtener los últimos 100 datos
        $sql = "SELECT mensaje, fecha, led_color FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 100";
    }

    $stmt = $pdo->query($sql);

    $data = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }

    // Enviar datos en formato JSON
    echo json_encode($data);
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}

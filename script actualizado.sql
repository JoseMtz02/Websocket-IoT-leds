CREATE DATABASE sm53_arduino;
USE sm53_arduino;

CREATE TABLE tb_puerto_serial (
    id_puerto_serial INT AUTO_INCREMENT PRIMARY KEY,
    mensaje INT,
    led_color VARCHAR(20),    
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS sm52_arduino;

-- Usar la base de datos
USE sm52_arduino;

-- Crear la tabla para los datos del puerto serial
CREATE TABLE IF NOT EXISTS tb_puerto_serial (
    id_puerto_serial INT AUTO_INCREMENT PRIMARY KEY,
    mensaje INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    led_color VARCHAR(20) NOT NULL
);

-- Crear la tabla para el estado del LED
CREATE TABLE IF NOT EXISTS estado_led (
    id_estado_led INT AUTO_INCREMENT PRIMARY KEY,
    led_status int
);

-- Insertar un registro inicial en la tabla estado_led (por ejemplo, LED apagado)
INSERT INTO estado_led (led_status) VALUES (0);
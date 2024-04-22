import asyncio
import websockets
import mysql.connector
import serial
import json

# Configuración de la base de datos
db_config = {
    'host': 'localhost',
    'port': 3306,  # Este sería el puerto si has configurado MySQL para usar el puerto 3307 en XAMPP
    'user': 'root',
    'password': '',
    'database': 'sm52_arduino'
}

# Configura el puerto serial según tu configuración de Arduino
arduino = serial.Serial('COM6', 9600, timeout=1)

async def insert_data_to_db():
    while True:
        try:
            # Leer datos del puerto serial
            data = arduino.readline().decode().strip()

            # Procesar los datos
            if data.startswith('D:'):
                distancia = int(data[2:])
                if distancia < 10:
                    led_color = 'rojo'
                    arduino.write(b'R')  # Enviar comando para LED Rojo
                elif distancia < 20:
                    led_color = 'amarillo'
                    arduino.write(b'A')  # Enviar comando para LED Amarillo
                else:
                    led_color = 'verde'
                    arduino.write(b'V')  # Enviar comando para LED Verde

                # Insertar datos en la base de datos
                conn = mysql.connector.connect(**db_config)
                cursor = conn.cursor()
                cursor.execute("INSERT INTO tb_puerto_serial (mensaje, led_color) VALUES (%s, %s)", (distancia, led_color))
                conn.commit()
                cursor.close()
                conn.close()

                print(f"Distancia: {distancia} cm, LED: {led_color}")

            await asyncio.sleep(0.1)  # Esperar un breve momento antes de la próxima lectura
        except Exception as e:
            print(f"Error al insertar datos en la base de datos: {e}")

async def send_data_to_client(websocket, path):
    try:
        while True:
            # Consulta SQL para obtener los últimos datos
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()
            cursor.execute("SELECT mensaje, fecha, led_color FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 10")
            data = cursor.fetchall()
            cursor.close()
            conn.close()

             # Convertir las fechas a cadenas antes de enviar los datos al cliente
            formatted_data = [(msg, str(fecha), color) for msg, fecha, color in data]

            # Enviar datos al cliente
            await websocket.send(json.dumps(formatted_data))

            await asyncio.sleep(0.1)  # Esperar un segundo antes de la próxima actualización
    except Exception as e:
        print(f"Error al enviar datos al cliente: {e}")

def update_led_status_in_db(status):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("UPDATE estado_led SET led_status = %s WHERE id_estado_led = 1", (status,))
        conn.commit()
        print("Estado del LED actualizado en la base de datos:", status)
    except mysql.connector.Error as e:
        print(f"Error de base de datos al actualizar el estado del LED: {e}")
    finally:
        cursor.close()
        conn.close()

def get_led_status_from_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT led_status FROM estado_led WHERE id_estado_led = 1")
        status = cursor.fetchone()[0]
        print("Estado del LED obtenido de la base de datos:", status)
        return status
    except mysql.connector.Error as e:
        print(f"Error de base de datos al obtener el estado del LED: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

async def handle_led(websocket, path):
    status = get_led_status_from_db()
    print("Estado del LED al conectarse:", status)
    await websocket.send(str(status))  # Enviar estado actual al cliente al conectarse
    async for message in websocket:
        if message in ["1", "0"]:
            update_led_status_in_db(message)
            arduino.write(message.encode())
            await websocket.send(message)



async def main():
    await asyncio.gather(
        insert_data_to_db(),
        websockets.serve(send_data_to_client, "localhost", 8767),
        websockets.serve(handle_led, "localhost", 8766)

    )

try:
    asyncio.run(main())
except KeyboardInterrupt:
    print("Programa terminado por el usuario")
finally:
    arduino.close()


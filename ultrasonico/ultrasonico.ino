#include <Ultrasonic.h>

Ultrasonic ultrasonic(12, 13); // (Trig pin, Echo pin)
int ledR = 9; // LED Rojo
int ledA = 10; // LED Amarillo
int ledV = 7; // LED Verde

int inputPin = 8;               
int pirState = LOW;             
int val = 0;
int ledPir = 6;   

int led8 = 8; // Pin del LED que quieres controlar

// Variables para almacenar el estado de los otros LEDs
bool ledRState = LOW;
bool ledAState = LOW;
bool ledVState = LOW;
bool led8State = LOW; // Estado del LED en el pin 8

unsigned long previousMillis = 0;
const long interval = 300; // Intervalo de tiempo para leer el sensor ultrasónico y actualizar los LED (en milisegundos)

void setup() {
  Serial.begin(9600);
  pinMode(ledR, OUTPUT);
  pinMode(ledA, OUTPUT);
  pinMode(ledV, OUTPUT);
  pinMode(inputPin, INPUT);
  pinMode(ledPir, OUTPUT);
  pinMode(led8, OUTPUT);
}

void loop() {
  unsigned long currentMillis = millis();

  // Verifica si ha pasado el tiempo del intervalo para realizar las acciones
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;  // Actualiza el tiempo de referencia

    // Lee el sensor PIR
    val = digitalRead(inputPin); 
    if (val == HIGH) {            
      digitalWrite(ledPir, HIGH);
      
      if (pirState == LOW) {
        Serial.println("M:true"); 
        pirState = HIGH;
      }
    } else {
      digitalWrite(ledPir, LOW); 
      
      if (pirState == HIGH){
        Serial.println("M:false"); 
        pirState = LOW;
      }
    }

    // Lee el sensor ultrasónico
    long distance = ultrasonic.distanceRead(CM);
    Serial.print("D:");
    Serial.println(distance);

    // Actualiza los LED según los comandos recibidos
    if (Serial.available() > 0) {
      char command = Serial.read();
      controlLEDs(command);                                       
    }
  }
}

void controlLEDs(char command) {
  // Apaga todos los LEDs
  digitalWrite(ledR, LOW);
  digitalWrite(ledA, LOW);
  digitalWrite(ledV, LOW);
  
  switch (command) {
    case 'R':
      digitalWrite(ledR, HIGH);
      ledRState = HIGH;
      break;
    case 'A':
      digitalWrite(ledA, HIGH);
      ledAState = HIGH;
      break;
    case 'V':
      digitalWrite(ledV, HIGH);
      ledVState = HIGH;
      break;
    case '1':
      digitalWrite(led8, HIGH);
      led8State = HIGH;
      break;
    case '0':
      digitalWrite(led8, LOW);
      led8State = LOW;
      break;
    default:
      break;
  }
}

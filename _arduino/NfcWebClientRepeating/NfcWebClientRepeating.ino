#include <SPI.h>
#include <Ethernet.h>
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>

#define IRQ   (2)
#define RESET (3)
#define SPEAKER (9)

Adafruit_NFCShield_I2C nfc(IRQ, RESET);

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
//char server[] = "google.com";
char server[] = "api.usergrid.com";

// Initialize the Ethernet client library
// with the IP address and port of the server 
// that you want to connect to (port 80 is default for HTTP):
EthernetClient client;

String nfc_card_uid = "";
String request_body = "";
char device_id[] = "1";

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  pinMode(SPEAKER, OUTPUT);
  
  // First Ethernet
  Ethernet.begin(mac);
  delay(500);
  
  Serial.print("Local IP address: ");
  Serial.println(Ethernet.localIP());
  
  // Than NFC
  nfc.begin();

  uint32_t versiondata = nfc.getFirmwareVersion();
  if (! versiondata) {
    Serial.print("Didn't find PN53x board");
    while (1); // halt
  }
  
  // Got ok data, print it out!
  Serial.print("Found chip PN5"); Serial.println((versiondata>>24) & 0xFF, HEX); 
  Serial.print("Firmware ver. "); Serial.print((versiondata>>16) & 0xFF, DEC); 
  Serial.print('.'); Serial.println((versiondata>>8) & 0xFF, DEC);
  
  // Set the max number of retry attempts to read from a card
  // This prevents us from waiting forever for a card, which is
  // the default behaviour of the PN532.
  nfc.setPassiveActivationRetries(0xFF);
  
  // configure board to read RFID tags
  nfc.SAMConfig();
    
  Serial.println("Waiting for an ISO14443A card");
}

void loop(void) { 
  // NFC logic
  boolean success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  // Buffer to store the returned UID
  uint8_t uidLength;                        // Length of the UID (4 or 7 bytes depending on ISO14443A card type)
  
  // Wait for an ISO14443A type cards (Mifare, etc.).  When one is found
  // 'uid' will be populated with the UID, and uidLength will indicate
  // if the uid is 4 bytes (Mifare Classic) or 7 bytes (Mifare Ultralight)
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, &uid[0], &uidLength);
  
  if (success) {
    Serial.println("Found a card!");
    Serial.print("UID Length: ");Serial.print(uidLength, DEC);Serial.println(" bytes");
    Serial.print("UID Value: ");
    for (uint8_t i=0; i < uidLength; i++) 
    {
      Serial.print(uid[i], DEC); 
      nfc_card_uid += uid[i];
    }
    Serial.println("");    
    // Perform actions after auth
    doubleBeep();
    httpRequest();
  }
  else
  {
    // PN532 probably timed out waiting for a card
    Serial.println("Timed out waiting for a card");
  }
}

// this method makes a HTTP connection to the server:
void httpRequest() {
  
  delay(50);

  if (client.connect(server, 80)) {
    Serial.println("HTTP request");
    // Make a HTTP request:
    //client.println("GET /search?q=arduino HTTP/1.0");
    //client.println("Connection: close");
    //client.println();
    
    request_body = "{\"carduid\":\"";
    request_body += nfc_card_uid;
    request_body += "\", \"deviceid\":\"";
    request_body += device_id;
    request_body += "\"}";
            
    // Make a HTTP request:
    client.println("POST /diderikvw/byom/swipes HTTP/1.1");
    client.println("Host: api.usergrid.com");
    client.print("Content-Length: ");
    client.println(request_body.length());
    client.println("Connection: close");
    client.println();
    
    client.print(request_body);
    
    Serial.println("HTTP request complete");
    client.stop();
    
    // Reset nfc_card_uid + request_body
    nfc_card_uid = "";
    request_body = "";
  } 
  else {
    // if you couldn't make a connection:
    Serial.println("Error with client.connect()");
    Serial.println("client.stop()");
    client.stop();
  }
}

void playTone(int tone, int duration) {
  for (long i = 0; i < duration * 1000L; i += tone * 2) {
    digitalWrite(SPEAKER, HIGH);
    delayMicroseconds(tone);
    digitalWrite(SPEAKER, LOW);
    delayMicroseconds(tone);
  }
}

void doubleBeep() {
  for (int i = 0; i < 2; i++) {
    playTone(600, 100);
    delay(50); 
  }
}

void falseBeep() {
  playTone(800, 1500);
}



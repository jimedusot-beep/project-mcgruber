// SPDX-License-Identifier: MIT
// McGruber P04/P06: OPTIONAL microcontroller experiment, never hardware-verified.
// Reference: Arduino StateChangeDetection (CC0) and thomasfredericks/Bounce2 (MIT).
// DO NOT connect any battery voltage, especially 9V, to Arduino pin 2.
//
// Requires a verified electrically isolated COM/NC microswitch, a supported
// Arduino-compatible board with LED_BUILTIN and Bounce2 installed via Library Manager.
// COM -> board GND, *measured NC* -> digital pin 2.
// A released switch closes COM/NC => LOW => LED ON (object removed).
// Pressing the switch opens COM/NC => INPUT_PULLUP HIGH => LED OFF.
#include <Bounce2.h>
const uint8_t SWITCH_INPUT = 2;
Bounce2::Button contact = Bounce2::Button();

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  contact.attach(SWITCH_INPUT, INPUT_PULLUP);
  contact.interval(20);
  contact.setPressedState(LOW);
  Serial.println(F("MCGRUBER_P04_V1; MODE=COM_NC; UNVERIFIED_HARDWARE"));
}

void loop() {
  contact.update(); // Frequent nonblocking sampling, not delay(50).
  // Always reflect stable contact state, including boot while object removed.
  digitalWrite(LED_BUILTIN, contact.isPressed() ? HIGH : LOW);
  if (contact.pressed()) {
    Serial.println(F("ALARM_ON; NC_CONTACT_CLOSED; physical_switch_released"));
  } else if (contact.released()) {
    Serial.println(F("ALARM_OFF; NC_CONTACT_OPEN; physical_switch_pressed"));
  }
}

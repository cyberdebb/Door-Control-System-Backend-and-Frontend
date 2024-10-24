#include "porta.hpp"

void Porta::openDoor() {
  Serial.printf("Abrindo porta: %s\n", _id.c_str());
  StickCP2.Display.setTextColor(TFT_GREEN);
  StickCP2.Display.drawString(_id, _x, _y);
  if (!StickCP2.Speaker.isPlaying()) {
    StickCP2.Speaker.tone(1000);
  }
  _aberta = true;
  _tempoAbertura = millis();
  Serial.printf("Porta aberta: %s (x: %d, y: %d)\n", _id.c_str(), _x, _y);
}

uint8_t Porta::updateDoor() {
  
  unsigned long tempoPercorrido = millis() - _tempoAbertura;
  if (_aberta) {
    
    if (tempoPercorrido > 2000) {
      _aberta = false;
      StickCP2.Display.setTextColor(TFT_WHITE);
      StickCP2.Display.drawString(_id.c_str(), _x, _y);
      return CLOSED;
    }

    if (tempoPercorrido > 500 && StickCP2.Speaker.isPlaying()) {
      if (StickCP2.Speaker.isPlaying()) {
        StickCP2.Speaker.stop();
      }
      Serial.printf("Som parado para a porta: %s\n", _id.c_str());
      return BEEPSTOPPED;
    }
  }
}

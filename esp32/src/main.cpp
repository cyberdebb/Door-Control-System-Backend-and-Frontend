#include "HUD_handler.hpp"
#include "wifiSetup.hpp"
#include "porta.hpp"

std::vector<Porta> Portas = 
{
  {"101A"},{"102A"},{"103A"},{"104A"},{"105A"},{"106A"}
};

std::vector<WebSocketHandler> wsDoor(6, WebSocketHandler("", 4000, "/"));

void setup() 
{
  Serial.begin(9600);
  auto cfg = M5.config();
  StickCP2.begin(cfg);
  StickCP2.Display.fillScreen(BLACK);
  StickCP2.Display.clear();
  StickCP2.Speaker.setVolume(240);
  
  HUD_handler::drawHud(&Portas); 

  acessPoint.begin();

  //Infinito até ter wifi conectado
  while(WiFi.status() != WL_CONNECTED)
  {
    acessPoint.loop();
  }
  
  for(size_t i=0; i< wsDoor.size();i++)
  {
    wsDoor.at(i).setServer(acessPoint.getIpStored());
    wsDoor.at(i).setPorta( &(Portas.at(i)) );
    wsDoor.at(i).begin();
  }
}

void loop() {
  StickCP2.update();

  if(StickCP2.BtnA.wasPressed())
  {
    acessPoint.clearNVS();
    Serial.printf("Reiniciando ESP...");
    ESP.restart();
  }

  for(WebSocketHandler &ws : wsDoor)
    ws.loop();


}



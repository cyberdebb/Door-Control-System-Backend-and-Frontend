#include "webSocketHandler.hpp"

void WebSocketHandler::begin() 
{
  Serial.println("Initializing WebSocket connection...");
  Serial.printf("Server: %s, Port: %d, Path: %s\n", _server.c_str(), _port, _path.c_str());
  
  webSocket.begin(_server.c_str(), _port, _path.c_str());
  
  Serial.println("WebSocket begin() called!");
  
  webSocket.onEvent([this](WStype_t type, uint8_t * payload, size_t length) {
    Serial.println("WebSocket event triggered!");
    this->webSocketEvent(type, payload, length);
  });

  webSocket.setReconnectInterval(5000);

}

void WebSocketHandler::loop() 
{ 
  webSocket.loop(); 
  uint8_t status = _porta->updateDoor();
}

void WebSocketHandler::webSocketEvent(WStype_t type, uint8_t * payload, size_t length) 
{
  switch (type) 
  {
    case WStype_CONNECTED:
      Serial.println("WebSocket CONNECTED!");
      ws_send();
      break;
    case WStype_TEXT:
      Serial.println("WebSocket TEXT message received:");
      ws_processPayload(payload, length);
      Serial.printf("Received: %s\n", payload);
      break;
    case WStype_DISCONNECTED:
      Serial.println("WebSocket DISCONNECTED!");
      break;
    default:
      Serial.println("WebSocket other event type triggered!");
      break;
  }
}

void WebSocketHandler::ws_send()
{
  JsonDocument doc;

  doc["id"] = _porta->getID();
  doc["status"] = _porta->getisAberta() ? "Aberta" : "Fechada";

  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.sendTXT(jsonString.c_str());
}

void WebSocketHandler::ws_processPayload(uint8_t *payload, size_t length)
{
  String payloadStr = String((char*)payload).substring(0, length);
  Serial.printf("String recebida pelo WS: %s \n", payloadStr.c_str());
  if(payloadStr == "abre")
  {
    _porta->openDoor();
    ws_send();
  }

}

#ifndef WEBSOCKETHANDLER_HPP
#define WEBSOCKETHANDLER_HPP

#include <Arduino.h>
#include <WebSocketsClient.h>
#include "porta.hpp"
#include <ArduinoJson.h>

class WebSocketHandler
{
  private:
    Porta *_porta;
    WebSocketsClient webSocket;
    String _server;
    int _port;
    String _path;

    

  public:
    WebSocketHandler(String server, int port, String path) : 
    _server(server), _port(port), _path(path){};
    ~WebSocketHandler(){};   

    void begin();
    void loop();
     // Função de evento para receber dados do WebSocket
    void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
    void configAll(std::vector<WebSocketHandler> *ws);
    

    //WS Communication
    //Send
    void ws_send();
    //Get
    void ws_processPayload(uint8_t *payload, size_t length);

    //Getters
    bool isConnected() { return webSocket.isConnected(); };

    //Setters
    void setPorta(Porta *porta)   {_porta = porta; }
    void setServer(String server) { _server = server; }

};

#endif
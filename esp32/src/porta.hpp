/*
  

*/
#ifndef PORTA_HPP
#define PORTA_HPP

#include <M5StickCPlus2.h> 

class Porta
{  
  private:
  String _id;
  bool _aberta;
  uint8_t _x;
  uint8_t _y;
  unsigned long _tempoAbertura;

  public:
  Porta(String id) : _id(id), _aberta(false){};
  ~Porta(){};

  void openDoor();
  
  enum DoorUpdates{
    CLOSED,
    BEEPSTOPPED
  };
  uint8_t updateDoor();

  //Setters
  void setXY(uint8_t x, uint8_t y) { _x = x; _y = y; }
  
  //Getters
  String getID() { return _id; }
  bool getisAberta() { return _aberta; };
};

#endif
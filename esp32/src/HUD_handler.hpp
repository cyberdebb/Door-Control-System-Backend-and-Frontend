#include <M5StickCPlus2.h>
#include "porta.hpp"

namespace HUD_handler
{

  /// @brief Draw HUD and set XY axis for all portas elements
  void drawHud(std::vector<Porta> *portas)
  {
    uint8_t columns = 2;
    uint8_t rows = 3;

    uint8_t width = StickCP2.Display.width();
    uint8_t height = StickCP2.Display.height();

    uint8_t rect_w = width / 2;
    uint8_t rect_h = height / 3;

    size_t portaIndex = 0;

    //Desenhar HUD
    for (size_t i = 0; i < rows; i++) 
    {
      for (size_t j = 0; j < columns; j++) 
      {
        uint8_t rect_x = j * rect_w;
        uint8_t rect_y = i * rect_h;
        
        StickCP2.Display.drawRoundRect(rect_x, rect_y, rect_w, rect_h, 10, TFT_WHITE);
        
        uint16_t centerX = rect_x + rect_w / 2;
        uint16_t centerY = rect_y + rect_h / 2;
        
        // Guardar a posicao da porta no HUD no objeto da class Porta
        portas->at(portaIndex).setXY(centerX, centerY);
        String id = portas->at(portaIndex).getID();

        StickCP2.Display.setTextColor(TFT_WHITE);
        StickCP2.Display.setTextDatum(middle_center); // Centralizar o texto
        StickCP2.Display.drawString(id, centerX, centerY);
        
        portaIndex++;
      }
    }
  }

  
}


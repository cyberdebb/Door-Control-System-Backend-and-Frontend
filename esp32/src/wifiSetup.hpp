#ifndef _WIFI_SETUP_H_
#define _WIFI_SETUP_H_

#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <vector>

#include "webSocketHandler.hpp"

class wifiSetup
{
  private:

    //Captive Portal
    const char* ssidCapPortal = "Configura_ESP32";
    const char* passwordCapPortal = "12345678";
    DNSServer dnsServer;
    AsyncWebServer server;
    bool isAcessPointEnabled = false;
    
    
    bool isWebSocketIPSet;//!ACho que não é usado
    //NVS Memory
    Preferences wifiDataNVS;
    //Stored Wifi Data
    String ssidStored;
    String passwdStored;
    String ipStored;
    


    String htmlPage(); //HTML page for the Captive Portal
    bool isWifiDataStored(); //Check if there is any stored SSID and Password in NVS 
    void logoutCaptivePortal(); //Logout the Captive Portal
    bool connectWifi(); //Connect to the stored SSID and Password
    String wifiSearch();//Search and insert in html the first 10 wifi SSID options

  public:

    bool isIPSet = false;

    wifiSetup(): server(80) {};
    ~wifiSetup(){};

    void startCaptivePortal(); //Start the Captive Portal
    void begin(); //Start the basics
    void loop(); //Loop for the Captive Portal
    void clearNVS();

    bool getIsAcessPointEnabled() { return isAcessPointEnabled; }
    String getIpStored() {return ipStored; }
};

extern wifiSetup acessPoint;

#endif
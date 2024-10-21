#include <wifiSetup.hpp>

wifiSetup acessPoint;

void wifiSetup::begin()
{
  wifiDataNVS.begin("wifiDataNVS",true);//Acess Read Only NVS memory

  // Tenta conectar ao WiFi se os dados estiverem armazenados, caso contrário inicia o Captive Portal
  if (!isWifiDataStored() || !connectWifi()) {
      startCaptivePortal();
  }

  wifiDataNVS.end();
}

bool wifiSetup::isWifiDataStored()
{
  String isDataStored = wifiDataNVS.getString("ssid");

  if(isDataStored != 0) 
  {
    ssidStored = wifiDataNVS.getString("ssid").c_str();
    passwdStored = wifiDataNVS.getString("password").c_str();
    ipStored = wifiDataNVS.getString("IP").c_str();

    wifiDataNVS.end();

    Serial.printf("SSID Encontrado: %s\n",ssidStored.c_str());
    Serial.printf("IP Encontrado: %s\n", ipStored.c_str());  // Verifica o IP recuperado

    return true;
  }

  Serial.printf("Nenhum SSID encontrado no NVS\n");
  return false; 
}

void wifiSetup::startCaptivePortal()
{
  // if(isAcessPointEnabled == true)
  // {
  //   Serial.print("Acess Point ja esta ativado");
  //   return;
  // }

  while(WiFi.status() == WL_CONNECTED)
  {
    WiFi.disconnect();
    delay(100);
  }
  
  WiFi.softAP(ssidCapPortal, passwordCapPortal);
  IPAddress apIP(192, 168, 4, 1);
  dnsServer.start(53, "*", apIP);
  
 server.onNotFound([this](AsyncWebServerRequest *request) {
  request->send(200, "text/html", htmlPage());  // Redireciona para a página de configuração para todas as rotas
});


 //Save credentials to String variables, shut down the server and connect to the wifi
  server.on("/save", HTTP_POST, [this](AsyncWebServerRequest *request)
  {
    ssidStored = request->arg("ssid");
    passwdStored = request->arg("password");
    ipStored = request->arg("local_ip");

    request->send(200, "text/html", "Configuracoes salvas! Tentando conectar ao Wifi...");
    
    logoutCaptivePortal();
    connectWifi();
  });

  server.begin();
  isAcessPointEnabled = true;
  Serial.printf("%s server started",ssidCapPortal);
}

void wifiSetup::logoutCaptivePortal()
{
  isAcessPointEnabled = false;
  dnsServer.stop();
  server.end();
  WiFi.softAPdisconnect(true);
  delay(100);
}

bool wifiSetup::connectWifi()
{
  WiFi.begin(ssidStored.c_str(), passwdStored.c_str());
  
  Serial.printf("Tentando conectar ao Wifi %s \n", ssidStored.c_str());
  delay(1000);
  
  // Timeout para evitar loops infinitos
  unsigned long startAttemptTime = millis();
  
  // Loop até conectar ou atingir o tempo limite
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
    Serial.print(".");
    delay(1000); // Espera entre tentativas
  }

  // Verifica se conectou após o loop
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Conectado ao Wifi %s\n", ssidStored.c_str());
    
    // Salva as informações no NVS
    wifiDataNVS.begin("wifiDataNVS", false);
    wifiDataNVS.putString("ssid", ssidStored);
    wifiDataNVS.putString("password", passwdStored);
    wifiDataNVS.putString("IP", ipStored);
    wifiDataNVS.end();
    
    Serial.printf("SSID: %s salvo no NVS\n", ssidStored.c_str());
  // e mintira vai me largar no aeroporto me deixar sem uber e depois me jogar na vala pros bandidos do rock doido
    return true;
  } else {
    // Se falhou, exibe mensagem e inicia o captive portal
    Serial.printf("Falha ao conectar ao Wifi %s, erro: %d\n", ssidStored.c_str(), WiFi.status());
    isAcessPointEnabled = false;
    startCaptivePortal();
    return false;
  }
}


void wifiSetup::loop()
{
  if(isAcessPointEnabled)
    dnsServer.processNextRequest();
}

void wifiSetup::clearNVS() {
    wifiDataNVS.begin("wifiDataNVS", false);
    wifiDataNVS.clear();
    wifiDataNVS.end();
    Serial.println("NVS limpo");
}

String wifiSearch()
{
  WiFi.scanNetworks();
}

String wifiSetup::htmlPage()
{
  // HTML básico para a página de configuração
 String index_html = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <title>Configuracao do Wi-Fi</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h2>Configurar Wi-Fi</h2>
  <form action="/save" method="post">
    <label for="ssid">Nome da Rede (SSID):</label><br>
    <input type="text" id="ssid" name="ssid"><br><br>
    <label for="password">Senha:</label><br>
    <input type="text" id="password" name="password"><br><br>
    <label for="local_ip">Endereco IP local:</label><br>
    <input type="text" id="local_ip" name="local_ip" placeholder="Digite o IP aqui"><br><br>
    <input type="submit" value="Salvar">
  </form>
</body>
</html>)rawliteral";

return index_html;
}


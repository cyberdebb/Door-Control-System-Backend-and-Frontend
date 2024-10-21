var express = require('express');
const webSocket = require('ws');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const os = require('os');

const { conecta, getTokensCollection, salasDisponiveis, hashSenha, login } = require('./src/models/database');
const { getClient, verificarToken } = require('./src/models/tokens');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

dotenv.config();

const wss = new webSocket.Server({ port:8080 });
var clients = new Map();

const SECRET_KEY = process.env.SECRET_KEY;

//APP
iniciaServidor();

// Obter o IP local da máquina
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;  // Retorna o IP da interface
      }
    }
  }
  return 'IP não encontrado';
}

app.get('/', function(req, res) {
});


app.post('/login', async function(req, res) {
  const idUFSC = req.body.idUFSC;
  const senha = req.body.senha;

  const client = getClient();
  const tokensCollection = getTokensCollection();
  const hash = hashSenha(senha);

  try {
    let professor = await login({idUFSC:idUFSC, senha:hash});

    if (professor) {
      // Gera um novo token de acesso
      const token = jwt.sign({ idUFSC: professor._id }, SECRET_KEY, { expiresIn: '1h' });

      await client.set(`token:${professor._id}`, token, {
        EX: 3600 // Expira em 1 hora
      });

      const timeNow = new Date();
      
      await tokensCollection.insertOne({
        idUFSC: professor._id,
        token: token,
        createdAt: timeNow
      });

      res.json({ message: "Login bem sucedido", token: token });
    } 
    else {
      res.status(401).send("Login inválido");
    }
  } 
  catch (error) {
    console.log("Erro ao fazer o login", error);
    res.status(500).json({error: error.message});
  }
});


app.get('/lista', async function(req,res) {
  const idUFSC = req.params.idUFSC;  // Email do professor passado na URL

  try{
    const portas = await salasDisponiveis(idUFSC);
    //for each portas?
  } catch(error){
    res.status(500).json({error: error.message});
  }
});


app.get('/abre', function(req, res) {
  let idPorta = req.body.idPorta;
  let wsFound = null;
  
  for (let [ws, id] of clients) {
    if (id === idPorta) {
      wsFound=ws;
      break;
    }
  }

  //!Ver como o front quer que res.json seja enviado, esse é só template
  if (wsFound) {
    wsFound.send("abre");  
    //?Template response
    res.json({ status: 'success', idPorta: idPorta, message: 'Comando enviado' });
  } else {
    res.status(404).json({ status: 'error', message: `Porta com ID ${idPorta} não encontrada` });
  }
  
  // Recebe id da porta que é pra abrir
  // Conectar ao websocket esp e enviar comando abrir porta
  // Retornar pro front IDporta, simbolizando que foi aberta
  
});

app.get('/api/salas', verificarToken, async (req, res) => {
  try {
      const idUFSC = req.idUFSC;
      const salas = await salasDisponiveis(idUFSC);

      if (salas) {
          res.json(salas); // Retorna as salas como JSON
      } else {
          res.status(404).send('Nenhuma sala disponível para esse usuário');
      }
  } catch (error) {
      console.error('Erro ao buscar as salas:', error);
      res.status(500).json({ error: 'Erro ao buscar as salas' });
  }
});

app.get(/^(.+)$/, function(req, res) {
  try {
      res.write("A pagina que vc busca nao existe")
      res.end();
  } catch (e) {
      res.end();
  }
});


async function iniciaServidor() {
  try {
    await conecta();

    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
      const ipAdress = getLocalIPAddress();
      console.log(`Acesse servidor no ip ${ipAdress}`);
    });
  } 
  catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

//END APP


// WEBSOCKET
wss.on('connection', (ws) => {
  console.log("Client connected");

  ws.send("Bem vindo ao websocket");
  clients.set(ws, -1);

  ws.on('message', (message) => {
    try{
      const porta = JSON.parse(message);
     
      //Recebe sempre id para garantir que o ws está correto  
      if(porta.id){
        clients.set(ws,porta.id);
        console.log(`ID ${porta.id} associado ao WebSocket.`);
      }
      if(porta.status){
        console.log(`Porta ${porta.id}: ${porta.status}`);
      }
    }
    catch (error){
        console.error("Erro ao processar a mensagem:", error);
    }
});

  ws.on('close', () => {
    clients.delete(ws)
    console.log("Cliente desconectado");
  });
});
// END WEBSOCKET
var express = require('express');
const webSocket = require('ws');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { zonedTimeToUtc } = require('date-fns-tz');

const { conecta, getTokensCollection, salasDisponiveis, hashSenha, login } = require('./src/models/database');
const { getClient, verificarToken } = require('./src/models/tokens');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

dotenv.config();

const wss = new webSocket.Server({ port:8080 });

const SECRET_KEY = process.env.SECRET_KEY;

//APP
iniciaServidor();

app.get('/', function(req, res) {
  res.redirect('/login.html');
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

      const timeZone = 'America/Sao_Paulo';
      const timeNow = zonedTimeToUtc(new Date(), timeZone);
      
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


app.get('/abre',function(req,res) {
  //Recebe id da porta que é pra abrir
  //
  let idPorta;

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
    });
  } 
  catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

//END APP



//WEBSOCKET
wss.on('connection',(ws)=>{
  console.log("Client connected");

  ws.send("Bem vindo ao websocket");

  ws.on('message',(message)=>{
    console.log("Mensagem recebida: ${message}");

  });

  ws.on('close',()=>{
    console.log("Cliente desconectado");
  });
});
//END WEBSOCKET


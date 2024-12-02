var express = require('express');
const webSocket = require('ws');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const os = require('os');
const cookieParser = require('cookie-parser');

const { conecta, getTokensCollection, 
        salasDisponiveis, hashSenha, 
        login, getProfessoresCollection,
        getSalasCollection, cadastrarProfessor  } = require('./src/models/database');
const { getClient, verificarToken } = require('./src/models/tokens');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(cookieParser()); 

dotenv.config();

const client = getClient();

const wss = new webSocket.Server({ port:4000 });
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

  
  const tokensCollection = getTokensCollection();
  const hash = hashSenha(senha);

  try {

    let professor = await login({idUFSC:idUFSC, senha:hash});

    if (professor) {
      // Gera um novo token de acesso
      const isAdmin = idUFSC === 'admin';  
      const token = jwt.sign({ idUFSC: professor._id, isAdmin: isAdmin }, SECRET_KEY, { expiresIn: '1h' });

      await client.set(`token:${professor._id}`, token, {
        EX: 3600 // Expira em 1 hora
      });

      const timeNow = new Date();
      
      await tokensCollection.insertOne({
        idUFSC: professor._id,
        token: token,
        createdAt: timeNow
      });

      // Define o token como um cookie httpOnly e secure
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Usa secure apenas em produção
        sameSite: 'Strict', 
        maxAge: 3600000 // 1 hora
      });
    
      res.json({ 
        message: "Login bem sucedido", 
        token:token,
        isAdmin: isAdmin
      });
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


app.post('/abre', function(req, res) {
  let idPorta = req.body.idPorta;

  let wsFound = null;
  
  console.log("ID recebido no body da  rota /abre: ", idPorta);

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
    return res.json({ status: 'success', idPorta: idPorta, message: 'Comando enviado' });
  }

    // Retorna a lista de WebSockets e portas associadas, e mensagem de erro
    return res.status(404).json({ 
      status: 'error', 
      message: `Porta com ID ${idPorta} não encontrada`, 
    });
});

app.get('/lista', verificarToken, async (req, res) => {
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

app.get('/admin', verificarToken, async (req,res) =>{
  if (req.isAdmin) {
    res.status(200).json({ message: "Usuário autorizado", isAdmin: true });
  } else {
    res.status(403).json({ message: "Acesso negado. Você não é administrador." });
  }
});


app.post('/admin/cadastrar-professor', verificarToken, async (req, res) => {
 
  // Verifica se o usuário é admin
  if (!req.isAdmin) {
    return res.status(403).send("Acesso negado. Apenas administradores podem cadastrar professores.");
  }

  const { idUFSC, nome, senha, salasDisponiveis } = req.body;

  if (!idUFSC || !nome || !senha) {
    return res.status(400).send("Dados incompletos. Certifique-se de enviar idUFSC, nome e senha.");
  }

  try {
    // Hasheia a senha do professor antes de salvar no banco de dados
    const hashedSenha = hashSenha(senha);

    // Reutiliza a função cadastrarProfessor
    await cadastrarProfessor(idUFSC, nome, salasDisponiveis || [], hashedSenha);

    res.status(200).send("Professor cadastrado com sucesso.");
  } 
  catch (error) {
    console.error('Erro ao cadastrar professor: ', error);
    res.status(500).send("Erro ao cadastrar professor.");
  }
});



app.get('/admin/listar-professores', verificarToken, async (req, res) => {
  // Verifica se o usuário é admin
  if (!req.isAdmin) {
    return res.status(403).send("Acesso negado. Apenas administradores podem listar professores.");
  }

  try {
    const professores = getProfessoresCollection(); // Obtém a coleção de professores
    const listaProfessores = await professores.find({}).toArray();
    const salas = getSalasCollection();
    const listaSalas = await salas.find({}).toArray(); // ou use outra lógica para as salas

    res.status(200).json({
      professores: listaProfessores,
      salas: listaSalas
    });
  } 
  catch (error) {
    console.error('Erro ao listar professores: ', error);
    res.status(500).send("Erro ao listar professores.");
  }
});



app.post('/verificar-token', verificarToken, (req, res) => {
  res.status(200).json({ message: 'Token válido', idUFSC: req.idUFSC });
});


app.post('/logout', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).send('Nenhum token encontrado.');
  }

  const decoded = jwt.decode(token, SECRET_KEY);

  if (!decoded || !decoded.idUFSC) {
    return res.status(400).send('Token inválido.');
  }

  // Remove o token do Redis (se estiver usando Redis)
  await client.del(`token:${decoded.idUFSC}`);

  // Limpa o cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });

  res.status(200).send('Logout realizado com sucesso');
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

    app.listen(2000, '0.0.0.0', () => {
      console.log('Servidor rodando na porta 2000');
      const ipAdress = getLocalIPAddress();
      console.log(`Acesse o servidor no IP ${ipAdress}`);
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
var express = require('express');
const webSocket = require('ws');
const { conecta, salasDisponiveis, hashSenha, populaProfessores, populaSalas, login } = require('models/database');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

var app = express();
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const wss = new webSocket.Server({ port:8080 });

const SECRET_KEY = process.env.SECRET_KEY;

//APP
app.get('/', function(req, res) {
  res.redirect('/login.html');
});


app.post('/login', async function(req, res) {
  const idUFSC = req.body.idUFSC;
  const senha = req.body.senha;

  const hash = hashSenha(senha);

  try {
    let professor = await login({id:idUFSC, senha:hash});

    if (professor) {
      // Gera um novo token de acesso
      const token = jwt.sign({ id: professor.id }, SECRET_KEY, { expiresIn: '1h' });

      await tokensCollection.insertOne({
        userId: professor.id,
        token: token,
        createdAt: new Date()
      });

      res.json({ message: "Login bem-sucedido", token: token });
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

// Middleware para verificar o token em rotas protegidas
async function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(403).send("Token não fornecido!");
  }

  try {
      // Verifica se o token é válido
      const decoded = jwt.verify(token, SECRET_KEY);

      // Verifica se o token existe na coleção
      const storedToken = await tokensCollection.findOne({ token: token });

      if (!storedToken) {
          return res.status(401).send("Token inválido ou expirado!");
      }

      req.userId = decoded.id; // Armazena o ID do usuário decodificado
      next();
  } catch (error) {
      console.error("Erro ao verificar o token:", error);
      return res.status(401).send("Token inválido!");
  }
}


// Exemplo de rota protegida
app.get('/protegido', verificarToken, (req, res) => {
  res.send(`Acesso concedido para o usuário com ID: ${req.userId}`);
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


app.get(/^(.+)$/, function(req, res) {
  try {
      res.write("A página que vc busca não existe")
      res.end();
  } catch (e) {
      res.end();
  }
});


async function iniciaServidor() {
  try {
    await conecta();
    await populaProfessores();
    await populaSalas();

    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  } 
  catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

iniciaServidor();
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


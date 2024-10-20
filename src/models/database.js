const {MongoClient} = require('mongodb');
const { createHmac } = require('crypto');
const fs = require('fs').promises;  // Usando a versão assíncrona do fs

const client = new MongoClient('mongodb://127.0.0.1:27017');
const dbName = "DOOR-CONTROL";
var db, professores, salas, tokensCollection;

async function conecta() {
  await client.connect();
  db = await client.db(dbName);

  // await db.dropDatabase();
  
  professores = await db.collection("professores");
  salas = await db.collection("salas");
  tokensCollection = await db.collection("tokens");

  try {
    await populaProfessores();
    await populaSalas();
  }
  catch (error) {
    console.log('Erro ao popular os dados: ', error);
    throw error;
  }
}


async function salasDisponiveis(idUFSC) {
  try {
    const professor = await professores.findOne({_id:idUFSC});

    if (professor) {
      return professor.salasDisponiveis;
    } 
    else {
      throw new Error(`Professor com email ${idUFSC} não encontrado!`);
    }
  } 
  catch (error) {
    console.error('Erro ao buscar salas disponíveis: ', error.message);
    throw error;
  }
}

function hashSenha(senha) {
  return createHmac('sha256', 'crypt')
            .update(senha)
            .digest('hex');
}


async function populaProfessores() {
  try {
    // Lê o arquivo JSON contendo os professores
    const data = await fs.readFile(`${__dirname}/professores.json`, 'utf8');
    let professores_dados = JSON.parse(data);

    // Hasheia as senhas dos professores antes de inserir no banco
    professores_dados = professores_dados.map(p => {
      return {
        _id: p.idUFSC,
        nome: p.nome,
        salasDisponiveis: p.salasDisponiveis,
        senha: hashSenha(p.senha)  // Aplica o hash na senha
      };
    });

    for (let professor of professores_dados) {
      // Usa upsert: se o professor existir, atualiza; se não, insere
      await professores.updateOne(
          { _id: professor._id }, 
          { $set: professor }, 
          { upsert: true }
      );
    }
    console.log('Professores inseridos com sucesso!');

  } 
  catch (error) {
    console.error('Erro ao popular o banco de dados: ', error);
    throw error;
  }
}


async function populaSalas() {
  try {
    // Lê o arquivo JSON contendo as portas
    const data = await fs.readFile(`${__dirname}/salas.json`, 'utf8');
    let salas_dados = JSON.parse(data);

    salas_dados = salas_dados.map(s => {
      return { _id: s.sala };
    });

    for (let sala of salas_dados) {
      await salas.updateOne(
          { _id: sala._id }, 
          { $set: sala }, 
          { upsert: true }
      );
    }
    console.log('Salas inseridas com sucesso!');
  } 
  catch (error) {
    console.error('Erro ao popular o banco de dados: ', error);
    throw error;
  }
}


async function login(dados) {
  try {
    let professor = await professores.findOne({_id:dados.idUFSC, senha:dados.senha});

    if (professor) {
      return professor;
    } 
    else {
      return null;
    }
  }
  catch (error) {
    console.error('Erro ao fazer o login: ', error);
    throw error;
  }
}


module.exports = {
  conecta,
  getTokensCollection: () => tokensCollection,
  salasDisponiveis,
  hashSenha,
  populaProfessores,
  populaSalas,
  login
};
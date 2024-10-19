const {MongoClient} = require('mongodb');
const { createHmac } = require('crypto');
const fs = require('fs').promises;  // Usando a versão assíncrona do fs

var db, professores, salas;


async function conecta() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  db = await client.db("DOOR-CONTROL");
  
  professores = await db.collection("professores");
  salas = await db.collection("salas");

  try {
    await populaProfessores();
    await populaSalas();
  }
  catch (error) {
    console.log('Erro ao popular os dados: ', error);
    throw error;
  }

  return {db, professores, salas};
}


async function salasDisponiveis(idUFSC) {
  try {
    const professor = await professores.findOne({id:idUFSC});

    if (professor) {
      return professor.salasDisponiveis;
    } 
    else {
      throw new Error(`Professor com ID ${idUFSC} não encontrado!`);
    }
  } 
  catch (error) {
    console.error('Erro ao buscar portas disponíveis: ', error.message);
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
    const data = await fs.readFile('professores.json', 'utf8');
    let professores_dados = JSON.parse(data);

    // Hasheia as senhas dos professores antes de inserir no banco
    professores_dados = professores_dados.map(prof => {
      return {
        nome: prof.nome,
        idUFSC: prof.idUFSC,
        salasDisponiveis: prof.salasDisponiveis,
        senha: hashSenha(prof.senha)  // Aplica o hash na senha
      };
    });

    // Insere os professores no banco de dados com as senhas hasheadas
    await professores.insertMany(professores_dados);
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
    const data = await fs.readFile('salas.json', 'utf8');
    const salas_dados = JSON.parse(data);

    // Insere as salas no banco de dados
    await salas.insertMany(salas_dados);
    console.log('Salas inseridas com sucesso!');
  } 
  catch (error) {
    console.error('Erro ao popular o banco de dados: ', error);
    throw error;
  }
}


async function login(dados) {
  try {
    let professor = await professores.findOne({id:dados.id, senha:dados.senha});

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
  salasDisponiveis,
  hashSenha,
  populaProfessores,
  populaSalas,
  login
};
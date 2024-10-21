const cron = require('node-cron');
const redis = require('redis');
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');

const { getTokensCollection } = require('./database');

dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY;

// Cria um cliente Redis
const client = redis.createClient({
    url: 'redis://localhost:6379' // URL padrão do Redis
});

client.connect();

client.on('error', (err) => {
    console.error('Erro ao conectar ao Redis:', err);
});

async function verificarToken(req, res, next) {
    const tokensCollection = getTokensCollection();
    const token = req.headers['authorization']?.split(' ')[1];

    if (!tokensCollection) {
        return res.status(500).send("Internal server error");
    }

    if (!token) {
        return res.status(403).send("Token não fornecido!");
    }

    try {
        // Verifica o token JWT
        const decoded = jwt.verify(token, SECRET_KEY);
        req.idUFSC = decoded.idUFSC;

        // Checa o token no Redis
        const storedToken = await client.get(`token:${req.idUFSC}`);

        if (!storedToken || storedToken !== token) {
            return res.status(401).send("Token inválido ou expirado!");
        }

        // Se o token for válido, prossegue
        next();
    } catch (error) {
        return res.status(401).send("Token inválido ou expirado!");
    }
}

cron.schedule('0 * * * *', async () => {
    const tokensCollection = getTokensCollection();

    const timeNow = new Date();

    // Calcule o limite de tempo (1 hora atrás)
    const expirationThreshold = new Date(timeNow.getTime() - 3600 * 1000);

    // Apague tokens com createdAt menor que o limite de expiração
    const result = await tokensCollection.deleteMany({
        createdAt: { $lt: expirationThreshold }
    });

    console.log(`Tokens expirados removidos: ${result.deletedCount}`);
});


module.exports = {
    getClient: () => client,
    verificarToken,
  };
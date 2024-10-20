const cron = require('node-cron');
const redis = require('redis');
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

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
        console.error("tokensCollection is not initialized.");
        return res.status(500).send("Internal server error");
    }

    if (!token) {
        return res.status(403).send("Token não fornecido!");
    }

    try {
        // Verifica e decodifica o token JWT
        const decoded = jwt.verify(token, SECRET_KEY); // SECRET_KEY deve estar corretamente definido
        
        // Agora temos o idUFSC decodificado (e-mail do usuário)
        req.idUFSC = decoded.idUFSC;

        // Tenta buscar o token no Redis usando o idUFSC
        const storedToken = await client.get(`token:${req.idUFSC}`);

        if (!storedToken) {
            // Se não encontrar no Redis, buscar no MongoDB
            const tokenDoc = await tokensCollection.findOne({ token: token });

            if (!tokenDoc) {
                return res.status(401).send("Token inválido ou expirado!");
            }
        } else if (storedToken !== token) {
            return res.status(401).send("Token inválido ou expirado!");
        }

        // Se passar por todas as verificações, prossegue
        next();
    } catch (error) {
        console.error("Erro ao verificar o token:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send("Token expirado!");
        } else {
            return res.status(401).send("Token inválido!");
        }
    }
}


cron.schedule('0 * * * *', async () => {
    const tokensCollection = getTokensCollection();
    const timeZone = 'America/Sao_Paulo';

    const now = new Date();
    const timeNow = zonedTimeToUtc(now, timeZone);

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
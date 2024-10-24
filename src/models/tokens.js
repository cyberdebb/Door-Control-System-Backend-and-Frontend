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
    const token = req.cookies.token; // Obtém o token do cookie

    if (!tokensCollection) {
        console.error("Coleção de tokens não encontrada no banco de dados");
        return res.status(500).send("Internal server error");
    }

    if (!token) {
        console.warn("Token não fornecido no cookie");
        return res.status(403).send("Token não fornecido!");
    }

    try {
        // Verifica o token JWT
        const decoded = jwt.verify(token, SECRET_KEY);
        req.idUFSC = decoded.idUFSC;
        req.isAdmin = decoded.isAdmin;

        // Checa se o token existe no Redis para esse usuário
        const storedToken = await client.get(`token:${req.idUFSC}`);
        if (!storedToken) {
            console.warn(`Token não encontrado no Redis para o ID ${req.idUFSC}`);
            return res.status(401).send("Token inválido ou expirado!");
        }

        // Verifica se o token no Redis é o mesmo que foi enviado
        if (storedToken !== token) {
            console.warn("Token enviado não corresponde ao token armazenado no Redis");
            return res.status(401).send("Token inválido ou expirado!");
        }

        // Se for uma rota de admin e o usuário não for admin, retorna erro
        if (req.originalUrl.includes('/admin') && !req.isAdmin) {
            return res.status(403).send("Acesso negado. Apenas administradores podem acessar esta rota.");
        }

        // Se o token for válido e o usuário for admin (ou não for rota de admin), prossegue
        next();
    } catch (error) {
        console.error("Erro ao verificar o token:", error.message);
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
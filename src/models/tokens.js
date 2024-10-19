const cron = require('node-cron');
const redis = require('redis');
const { getTokensCollection } = require('./database');

const tokens = getTokensCollection();

// Cria um cliente Redis
const client = redis.createClient({
    url: 'redis://localhost:6379' // URL padrão do Redis
});

client.connect();

client.on('error', (err) => {
    console.error('Erro ao conectar ao Redis:', err);
});


async function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).send("Token não fornecido!");
    }

    // Primeiro, tenta buscar o token no Redis
    const storedToken = await client.get(`token:${req.userId}`);

    if (!storedToken) {
        // Se não encontrar no Redis, buscar no banco de dados
        try {
            const tokenDoc = await tokens.findOne({ token: token });
            if (!tokenDoc) {
                return res.status(401).send("Token inválido ou expirado!");
            }
        } catch (error) {
            console.error("Erro ao acessar o banco de dados:", error);
            return res.status(500).send("Erro ao verificar o token.");
        }
    } else if (storedToken !== token) {
        return res.status(401).send("Token inválido ou expirado!");
    }

    // Se o token for válido, decodifica
    jwt.verify(token, SECRET_KEY, (error, decoded) => {
        if (error) {
            console.error("Token inválido:", error);
            return res.status(401).send("Token inválido!");
        }
        req.userId = decoded.id; // Armazena o ID do usuário decodificado
        next(); // Prossegue para a próxima rota
    });
}

cron.schedule('0 * * * *', async () => {
    const result = await tokens.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 3600 * 1000 * 10) } // Remove tokens mais antigos que 10 horas
    });
    console.log(`Tokens expirados removidos: ${result.deletedCount}`);
});


module.exports = {
    verificarToken,
  };
const passport = require('passport'); // Importa a biblioteca principal do Passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Importa a estratégia Google OAuth 2.0
const db = require('../database/connection'); // Conexão com o banco de dados
require('dotenv').config(); // Para carregar variáveis de ambiente (GOOGLE_CLIENT_ID, etc.)

/**
 * @description Configura a estratégia de autenticação Google OAuth 2.0 para o Passport.js.
 * Esta estratégia lida com o fluxo de autenticação com o Google.
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // ID do Cliente OAuth do Google Cloud Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Chave Secreta do Cliente OAuth do Google Cloud Console
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // URL de redirecionamento autorizada no Google Cloud
    scope: ['profile', 'email'] // Escopos de dados que solicitamos do usuário no Google
},
async (accessToken, refreshToken, profile, done) => {
    // Esta função de callback é executada quando o Google autentica o usuário
    // e o redireciona de volta para a nossa callbackURL.
    try {
        // Tentar encontrar um usuário existente pelo 'google_id' no nosso banco de dados
        let user = await db('users').where({ google_id: profile.id }).first();

        if (user) {
            // Se o usuário já existe, retorne-o. Podemos atualizar o perfil se necessário.
            // Por exemplo, user.name = profile.displayName; user.avatar = profile.photos[0].value;
            console.log(`Usuário Google existente logado: ${user.email}`);
            return done(null, user); // Retorna o usuário autenticado
        } else {
            // Se o usuário Google não existe, crie um novo registro no banco de dados.
            // Extrai o e-mail principal do perfil do Google, se disponível.
            const email = profile.emails && profile.emails.length > 0
                          ? profile.emails[0].value
                          : null;

            // Insere o novo usuário. Para usuários OAuth, 'password_hash' será nulo.
            const [userId] = await db('users').insert({
                google_id: profile.id, // Armazena o ID único do Google
                email: email, // Armazena o e-mail do Google
            });

            // Busca o usuário recém-criado para retornar o objeto completo
            user = await db('users').where({ id: userId }).first();
            console.log(`Novo usuário Google registrado: ${user.email}`);
            return done(null, user); // Retorna o novo usuário
        }
    } catch (error) {
        // Lida com erros que ocorrem durante a interação com o banco de dados.
        console.error('Erro na estratégia Google Passport:', error);
        return done(error, false); // Retorna erro
    }
}));

/**
 * @description Serializa o usuário: Decide quais dados do usuário devem ser armazenados na sessão.
 * Para uso com JWT, isso é menos crítico, mas o Passport.js ainda espera essa função.
 * Geralmente, apenas o ID do usuário é armazenado.
 * @param {Object} user - O objeto de usuário autenticado.
 * @param {Function} done - Callback para indicar que a serialização foi concluída.
 */
passport.serializeUser((user, done) => {
    done(null, user.id); // Armazena apenas o ID do usuário na sessão (se sessões estivessem ativas)
});

/**
 * @description Desserializa o usuário: Recupera o objeto de usuário completo a partir do ID armazenado na sessão.
 * Também menos crítico para JWT.
 * @param {number} id - O ID do usuário armazenado na sessão.
 * @param {Function} done - Callback para retornar o objeto de usuário completo.
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await db('users').where({ id }).first();
        done(null, user); // Retorna o objeto de usuário
    } catch (error) {
        console.error('Erro ao desserializar usuário:', error);
        done(error, null);
    }
});

// Exporta a instância do Passport.js configurada.
// Esta instância será usada no src/app.js para inicializar o middleware do Passport.
module.exports = passport;
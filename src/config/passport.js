const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../database/connection'); // Nossa conexão com o DB
require('dotenv').config(); // Para acessar as variáveis de ambiente

// Configuração da estratégia Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'] // Escopos para solicitar informações de perfil e e-mail
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Encontrar ou criar o usuário no banco de dados
        let user = await db('users').where({ google_id: profile.id }).first();

        if (user) {
            // Se o usuário já existe, atualiza as informações se necessário (opcional)
            // e retorna o usuário
            return done(null, user);
        } else {
            // Se o usuário não existe, cria um novo registro
            const email = profile.emails && profile.emails.length > 0
                          ? profile.emails[0].value
                          : null;

            // Insere o novo usuário
            const [userId] = await db('users').insert({
                google_id: profile.id,
                email: email, // O e-mail pode vir do Google Profile
                // password_hash será nulo para usuários OAuth, ou posso gerar um hash de um UUID
            });

            user = await db('users').where({ id: userId }).first();
            return done(null, user);
        }
    } catch (error) {
        console.error('Erro na estratégia Google Passport:', error);
        return done(error, false);
    }
}));

// Serialização e desserialização do usuário
// Necessário para manter sessões, embora para JWT seja menos comum usar sessões
// Aqui, apenas para compatibilidade com Passport.js, passei o ID do usuário.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db('users').where({ id }).first();
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
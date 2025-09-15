// backend/src/server.js

require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Importa o bcrypt
const jwt = require('jsonwebtoken'); // Importe o JWT

const app = express();
app.use(express.json());
const prisma = new PrismaClient();
const PORT = 3333;

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Levitt!' });
});

// Rota para testar a conexão com o banco de dados
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: '🎉 Conexão com o banco de dados bem-sucedida!' });
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    res.status(500).json({ message: '❌ Erro ao conectar ao banco de dados.' });
  } finally {
    await prisma.$disconnect();
  }
});

// ROTA PARA CADASTRO DE USUÁRIOS (VERSÃO MELHORADA)
app.post('/users', async (req, res) => {
  const { fullName, email, password, username } = req.body;

  if (!fullName || !email || !password || !username) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    // Verifica se o e-mail OU o username já existem
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ],
      },
    });

    if (existingUser) {
      // Descobre qual campo causou o conflito para dar uma resposta melhor
      const conflictField = existingUser.email === email ? 'e-mail' : 'nome de usuário';
      return res.status(409).json({ error: `Este ${conflictField} já está em uso.` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullName: fullName,
        email: email,
        username: username, // Adiciona o username
        passwordHash: passwordHash,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(201).json({ user: userWithoutPassword, token: token });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Não foi possível completar o cadastro.' });
  }
});

// ROTA PARA LOGIN (CRIAR UMA SESSÃO)
app.post('/sessions', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Por favor, forneça e-mail/usuário e senha.' });
  }

  try {
    // 1. Encontra o usuário pelo e-mail OU pelo nome de usuário
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    // 2. Se o usuário não existe, retorna um erro genérico
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // 3. Compara a senha enviada com a senha criptografada no banco
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // 4. Se tudo estiver correto, gera o "crachá digital" (JWT)
    const token = jwt.sign(
      { id: user.id },      // O que o crachá contém (a identidade do usuário)
      process.env.JWT_SECRET, // A chave secreta para assinar
      { expiresIn: '7d' }  // Validade do crachá (7 dias)
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    // 5. Retorna os dados do usuário e o crachá (token)
    return res.status(200).json({
      user: userWithoutPassword,
      token: token,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
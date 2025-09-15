// backend/src/server.js

require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Importa o bcrypt

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

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Não foi possível completar o cadastro.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
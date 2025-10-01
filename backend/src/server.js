// backend/src/server.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client();

require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Importa o bcrypt
const crypto = require('crypto');     // Módulo nativo do Node.js para criptografia
const nodemailer = require('nodemailer'); // Importamos o Nodemailer

const app = express();
app.use(express.json());
const prisma = new PrismaClient();
const PORT = 3333;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Adiciona o ID do usuário à requisição
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};

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

    // --- INÍCIO DA NOVA LÓGICA ---
    // Busca também o versículo do dia
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    let verse = await prisma.dailyVerse.findUnique({
      where: { month_day: { month, day } },
    });
    if (!verse) { /* ... sua lógica de fallback para o versículo ... */ }
    // --- FIM DA NOVA LÓGICA ---

    return res.status(201).json({ user: userWithoutPassword, token: token, dailyVerse: verse });

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

    // --- INÍCIO DA NOVA LÓGICA ---
    // Busca também o versículo do dia
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    let verse = await prisma.dailyVerse.findUnique({
      where: { month_day: { month, day } },
    });
    if (!verse) { /* ... sua lógica de fallback para o versículo ... */ }
    // --- FIM DA NOVA LÓGICA ---

    // 5. Retorna os dados do usuário e o crachá (token)
    return res.status(200).json({
      user: userWithoutPassword,
      token: token,
      dailyVerse: verse, // <-- Adiciona o versículo à resposta
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ROTA PARA SOLICITAÇÃO DE REDEFINIÇÃO DE SENHA
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Medida de segurança: NUNCA diga ao usuário se o e-mail foi encontrado ou não.
    // Isso evita que hackers descubram quais e-mails estão cadastrados.
    if (!user) {
      return res.status(200).json({ message: 'Se um e-mail correspondente for encontrado, um link de recuperação será enviado.' });
    }

    // 1. Gera um token aleatório e seguro
    const resetToken = crypto.randomBytes(20).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 2. Define um tempo de expiração para o token (ex: 1 hora)
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora a partir de agora

    // 3. Salva o token (hashed) e a data de expiração no banco
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // 4. Configura o Nodemailer (transporter)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 5. Envia o e-mail com o link de redefinição
    // (Em um app real, a URL seria do seu site/app)
    const resetURL = `http://localhost:8081/reset-password?token=${resetToken}`; // Apenas exemplo
    
    await transporter.sendMail({
      from: '"Levitt App" <noreply@levitt.app>',
      to: user.email,
      subject: 'Redefinição de Senha - Levitt App',
      html: `<p>Você solicitou uma redefinição de senha. Clique no link a seguir para criar uma nova senha:</p><a href="${resetURL}">${resetURL}</a>`,
    });

    return res.status(200).json({ message: 'Se um e-mail correspondente for encontrado, um link de recuperação será enviado.' });

  } catch (error) {
    console.error('Erro no forgot-password:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ROTA PARA EFETIVAMENTE REDEFINIR A SENHA
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
  }

  try {
    // 1. Criptografa o token recebido para comparar com o que está no banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Procura um usuário que tenha esse token E que o token não tenha expirado
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // 'gt' = greater than (maior que a data/hora atual)
        },
      },
    });

    // 3. Se não encontrar, o token é inválido ou expirou
    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    // 4. Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    // 5. Atualiza a senha do usuário e LIMPA os campos de redefinição
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro no reset-password:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ROTA PARA AUTENTICAÇÃO COM GOOGLE
app.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Verifica se o idToken recebido é válido, usando a chave do seu app
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: [ // Ele vai checar contra todas as suas chaves
          process.env.GOOGLE_WEB_CLIENT_ID,
          process.env.GOOGLE_IOS_CLIENT_ID,
          process.env.GOOGLE_ANDROID_CLIENT_ID,
        ],
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Token do Google inválido.' });
    }

    const { name, email, picture } = payload;

    // 2. Procura se um usuário com este e-mail já existe no seu banco de dados
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Se o usuário NÃO existe, ele o CRIA.
    if (!user) {
      // Gera um nome de usuário único a partir do e-mail
      const username = email.split('@')[0] + Date.now();

      user = await prisma.user.create({
        data: {
          email: email,
          fullName: name || 'Usuário',
          username: username,
          avatarUrl: picture,
          // O passwordHash fica nulo, pois este usuário não tem senha manual
        },
      });
    }

    // 4. Gera o seu próprio token JWT do Levitt para criar a sessão
    const levittToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    // --- INÍCIO DA NOVA LÓGICA ---
    // Busca também o versículo do dia
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    let verse = await prisma.dailyVerse.findUnique({
      where: { month_day: { month, day } },
    });
    if (!verse) { /* ... sua lógica de fallback para o versículo ... */ }
    // --- FIM DA NOVA LÓGICA ---

    // 5. Retorna os dados do usuário e o token de sessão do Levitt para o app
    res.status(200).json({
      user: userWithoutPassword,
      token: levittToken,
      dailyVerse: verse
    });

  } catch (error) {
    console.error("Erro na autenticação com Google no backend:", error);
    res.status(401).json({ error: 'Falha na autenticação com Google.' });
  }
});

// ROTA PARA BUSCAR DADOS DO USUÁRIO LOGADO
app.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA PARA BUSCAR O VERSÍCULO DO DIA (DEDICADA)
app.get('/verse-of-the-day', async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    let verse = await prisma.dailyVerse.findUnique({
      where: { month_day: { month, day } },
    });

    if (!verse) {
      verse = { 
        verseText: "O Senhor é o meu pastor; nada me faltará.",
        verseReference: "Salmos 23:1",
        version: "NVI"
      };
    }

    return res.status(200).json(verse);
  } catch (error) {
    console.error("Erro ao buscar versículo do dia:", error);
    return res.status(500).json({ error: 'Não foi possível buscar o versículo do dia.' });
  }
});

// ROTA PARA BUSCAR AS ESTATÍSTICAS DA DASHBOARD
app.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Contar Ministérios
    const ministryCount = await prisma.ministryMember.count({
      where: { userId: userId },
    });

    // 2. Contar Escalas futuras
    const scaleCount = await prisma.event.count({
      where: {
        type: 'scale',
        eventDate: {
          gte: new Date(), // 'gte' = greater than or equal to (hoje ou no futuro)
        },
        participants: {
          some: { userId: userId },
        },
      },
    });

    // 3. Contar Ensaios futuros
    const rehearsalCount = await prisma.event.count({
      where: {
        type: 'rehearsal',
        eventDate: {
          gte: new Date(),
        },
        participants: {
          some: { userId: userId },
        },
      },
    });

    // 4. Contar Músicas (de todos os ministérios do usuário)
    const ministries = await prisma.ministryMember.findMany({
        where: { userId: userId },
        select: { ministryId: true }
    });
    const ministryIds = ministries.map(m => m.ministryId);

    const songCount = await prisma.song.count({
        where: {
            ministryId: {
                in: ministryIds
            }
        }
    });

    // 5. Retorna o objeto com todas as contagens
    return res.status(200).json({
      ministries: ministryCount,
      scales: scaleCount,
      rehearsals: rehearsalCount,
      songs: songCount,
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas da dashboard:", error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA PARA BUSCAR OS MINISTÉRIOS DO USUÁRIO LOGADO (VERSÃO APRIMORADA)
app.get('/ministries', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const memberships = await prisma.ministryMember.findMany({
      where: { userId: userId },
      include: {
        ministry: {
          include: {
            _count: {
              select: {
                songs: true,
                events: { where: { type: 'scale', eventDate: { gte: new Date() } } }
              }
            },
            // Busca os primeiros 4 membros do ministério para os avatares
            members: {
              take: 4,
              include: {
                user: {
                  select: { avatarUrl: true, fullName: true }
                }
              }
            }
          }
        }
      }
    });

    // Formata os dados para o frontend
    const formattedMinistries = memberships.map(({ ministry }) => ({
      id: ministry.id,
      name: ministry.name,
      imageUrl: ministry.imageUrl, // Supondo que você adicionará um campo imageUrl ao modelo Ministry
      songCount: ministry._count.songs,
      scaleCount: ministry._count.events,
      members: ministry.members.map(member => ({
        uri: member.user.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.fullName}`
      }))
    }));

    return res.status(200).json(formattedMinistries);

  } catch (error) {
    console.error("Erro ao buscar ministérios:", error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA PARA CRIAR UM NOVO MINISTÉRIO
app.post('/ministries', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!name) {
    return res.status(400).json({ error: 'O nome do ministério é obrigatório.' });
  }

  try {
    // Usamos uma transação para garantir que as duas operações ocorram com sucesso
    const newMinistry = await prisma.$transaction(async (prisma) => {
      // 1. Cria o ministério e define o usuário logado como o líder
      const ministry = await prisma.ministry.create({
        data: {
          name: name,
          leaderId: userId,
        },
      });

      // 2. Adiciona o usuário como um membro do ministério que acabou de criar
      await prisma.ministryMember.create({
        data: {
          ministryId: ministry.id,
          userId: userId,
          role: 'admin', // O líder também é um administrador
        },
      });

      return ministry;
    });

    return res.status(201).json(newMinistry);
  } catch (error) {
    console.error("Erro ao criar ministério:", error);
    return res.status(500).json({ error: 'Não foi possível criar o ministério.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
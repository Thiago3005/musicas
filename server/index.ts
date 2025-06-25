// Importa as configurações primeiro para garantir que as variáveis de ambiente sejam carregadas
import "./config";

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import config from "./config";
import { seedDatabase } from "./seedDatabase";

const app = express();

// Executa o seed do banco de dados para criar o usuário admin se não existir
(async () => {
  try {
    await seedDatabase();
    console.log('✅ Seed do banco de dados concluído com sucesso');
  } catch (error) {
    console.error('❌ Erro ao executar o seed do banco de dados:', error);
  }
})();

// Configuração CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://thiago3005.github.io'] // Domínio do frontend em produção
  : [
      'http://localhost:5173', 
      'http://127.0.0.1:5173', // Frontend Vite
      'http://localhost:5000',  // Backend local
      'http://127.0.0.1:5000'   // Backend local
    ];

console.log('Origins permitidos pelo CORS:', allowedOrigins);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Solicitação recebida de origem:', origin);
    
    // Permitir requisições sem origem (como aplicativos móveis, Postman, etc.)
    if (!origin) {
      console.log('Origem não definida, permitindo requisição');
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      console.log('Origem permitida:', origin);
      return callback(null, true);
    }
    
    console.warn('Origem não permitida:', origin);
    return callback(new Error('Acesso não permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Aplicar CORS a todas as rotas
console.log('Aplicando middleware CORS...');
app.use(cors(corsOptions));

// Log de todas as requisições para depuração
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Middleware para parsear JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração para lidar com requisições OPTIONS (pré-voo)
console.log('Configurando tratamento para requisições OPTIONS...');
app.options('*', cors(corsOptions)); // Ativar requisições de todos os métodos e origens

// Middleware para adicionar cabeçalhos CORS manualmente
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Resposta para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || '127.0.0.1';
  
  server.listen({
    port,
    host,
    reuseAddress: true,
  }, () => {
    log(`Servidor rodando em http://${host}:${port}`);
  }).on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      log(`Erro: A porta ${port} já está em uso.`);
      log('Por favor, feche outros servidores ou especifique outra porta.');
    } else if (error.code === 'EACCES') {
      log(`Erro: Permissão negada para acessar a porta ${port}.`);
      log('Tente usar uma porta acima de 1024 ou execute como administrador.');
    } else {
      log(`Erro ao iniciar o servidor: ${error.message}`);
    }
    process.exit(1);
  });
})();

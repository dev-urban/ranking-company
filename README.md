# Sistema de Ranking de Diretores

Sistema para ranking de diretores baseado em métricas de performance com frontend em React e backend em Node.js.

## Funcionalidades

- **Ranking Público** (`/ranking`): Visualização do ranking atualizado automaticamente a cada 30 segundos
- **Login de Diretores** (`/login`): Acesso restrito para diretores (role_id = 3)
- **Dashboard de Métricas** (`/dashboard`): Interface para diretores atualizarem suas métricas

## Sistema de Pontuação

- **Agendamentos**: 5 pontos cada
- **Visitas Realizadas**: 20 pontos cada
- **Contratos Assinados**: 50 pontos cada

## Estrutura do Projeto

```
├── config/            # Configuração do banco de dados
├── models/            # Models (User, Metrics)
├── routes/            # Rotas da API
├── middleware/        # Middleware de autenticação
├── data/              # Armazenamento JSON das métricas
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── pages/     # Páginas (Login, Dashboard, Ranking)
│   │   └── services/  # Serviços da API
├── server.js          # Servidor Express
├── package.json       # Configurações do projeto
└── README.md
```

## Requisitos

- Node.js 20+
- NPM 10+
- MySQL

## Configuração Local

### Instalação Completa

1. Clone o repositório e instale todas as dependências:
```bash
npm run install-all
```

2. Configure o arquivo `.env` na raiz:

**Para Railway (produção):**
```env
DATABASE_URL=mysql://username:password@host:port/database_name
JWT_SECRET=sua_chave_secreta
PORT=5000
DATA_PATH=./data
```

**Para desenvolvimento local:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ranking_db
DB_PORT=3306
JWT_SECRET=sua_chave_secreta
PORT=5000
DATA_PATH=./data
```

3. Configure o arquivo `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Executar o Projeto

**Modo Desenvolvimento (Backend + Frontend):**
```bash
npm run dev:all
```

**Apenas Backend:**
```bash
npm run dev
```

**Apenas Frontend:**
```bash
npm run client
```

**Produção:**
```bash
npm run build
NODE_ENV=production npm start
```

## Deploy no Railway

O projeto está configurado para deploy automático no Railway:

- **Volume persistente**: Montado em `/app/data` para armazenar `metrics.json`
- **Build automático**: Instala dependências e builda o frontend
- **Servidor unificado**: Serve tanto API quanto frontend estático

### Variáveis de Ambiente Necessárias no Railway:

```env
DATABASE_URL=mysql://username:password@host:port/database_name
JWT_SECRET=sua_chave_secreta_aleatoria
PORT=5000
DATA_PATH=/app/data
NODE_ENV=production
```

**Nota**: A `DATABASE_URL` será fornecida automaticamente pelo Railway quando você conectar um banco MySQL.

### Frontend

Em produção, o frontend é servido pelo mesmo servidor Express.

## Estrutura do Banco de Dados

A aplicação utiliza a tabela `users` existente:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NULL,
    role_id INT NULL,
    manager_id INT NULL,
    id_bitrix INT NULL
);
```

**Importante**: Apenas usuários com `role_id = 3` (diretores) podem fazer login no sistema.

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do diretor

### Métricas
- `GET /api/metrics` - Buscar métricas do diretor logado
- `PUT /api/metrics` - Atualizar métricas do diretor logado

### Ranking
- `GET /api/ranking` - Buscar ranking público de todos os diretores

## Segurança

- Autenticação via JWT
- Middleware de autenticação nas rotas protegidas
- Acesso restrito apenas a diretores (role_id = 3)
- Senhas hasheadas com bcrypt

## Dados

As métricas são armazenadas em arquivo JSON (`metrics.json`) com estrutura:

```json
{
  "user_id": {
    "agendamentos": 10,
    "visitasRealizadas": 5,
    "contratosAssinados": 2,
    "lastUpdate": "2024-01-01T10:00:00.000Z"
  }
}
```
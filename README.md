# 🗂️ Task Manager — Sistema de Gerenciamento de Tarefas

Sistema fullstack para gerenciamento de projetos e tarefas, construído com **Laravel** (backend) e **React + TypeScript** (frontend).

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação e Execução](#-instalação-e-execução)
- [Autenticação](#-autenticação)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)
- [Decisões Técnicas](#-decisões-técnicas)
- [Funcionalidades](#-funcionalidades)

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| PHP | 8.2+ | Linguagem |
| Laravel | 11.x | Framework |
| PostgreSQL | 15 | Banco de dados |
| PHPUnit | 11.x | Testes |

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 19.x | UI Library |
| TypeScript | 5.x | Tipagem estática |
| Vite | 6.x | Build tool |
| Material UI | 7.x | Design system (Dark Mode) |
| SWR | 2.x | Data fetching declarativo |
| Chart.js | 4.x | Gráficos do dashboard |
| @hello-pangea/dnd | 17.x | Drag & drop (Kanban) |
| notistack | 3.x | Notificações (snackbar) |

---

## 🏗️ Arquitetura

```
task-manager/
├── backend/                    # Laravel API REST
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # ProjetoController, TarefaController, ComentarioController
│   │   │   ├── Middleware/     # TokenAuthMiddleware (Bearer token fixo)
│   │   │   └── Requests/      # FormRequest para validação (StoreProjeto, StoreTarefa, StoreComentario)
│   │   ├── Models/             # Projeto, Tarefa, Comentario (extends BaseModel)
│   │   └── Services/          # ProjetoService, TarefaService (lógica de negócio)
│   ├── database/
│   │   ├── factories/          # ProjetoFactory, TarefaFactory, ComentarioFactory
│   │   └── migrations/
│   ├── routes/api.php          # Rotas agrupadas com middleware token.auth
│   └── tests/
│       ├── Unit/               # ProjetoServiceTest, TarefaServiceTest
│       └── Feature/            # ApiEndpointsTest
│
├── frontend/                   # React + TypeScript + Vite
│   └── src/
│       ├── types/              # Interfaces TypeScript (IProjeto, ITarefa, IComentario)
│       ├── services/           # api.ts (Axios interceptors), ProjetoService, TarefaService, ComentarioService
│       ├── contexts/           # JWTContext (auth), ConfigContext (tema dark/light)
│       ├── components/         # Layout, KanbanBoard, DialogConfirmacao, ComentarioSection
│       └── pages/              # Projetos, CadastroProjeto, DetalheProjeto, CadastroTarefa, DetalheTarefa
│
└── docker-compose.yml          # PostgreSQL + API + Web
```

### Padrão de Camadas (Backend)

```
Request → Middleware (TokenAuth) → Controller → Service → Model → DB
                                      ↑
                                  FormRequest (validação)
```

- **Controllers**: Recebem requests e delegam para Services. Sem lógica de negócio.
- **Services**: Contêm toda a lógica de negócio (ex: campo `atrasada`, sugestão de inativação).
- **Models**: Representam entidades do banco com relacionamentos Eloquent.
- **FormRequests**: Validação separada (ex: impedir criação de tarefa em projeto inativo).

---

## 🚀 Instalação e Execução

### Com Docker (Recomendado)

Você pode usar os scripts automáticos ou rodar os comandos manualmente.

#### Opção 1: Setup Automático (Script)
Criei os scripts para subir os containers, instalam as dependências e rodam as migrations sozinhos!

**No Mac ou Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**No Windows:**
Dê dois cliques no arquivo `setup.bat` ou rode no CMD:
```cmd
setup.bat
```

#### Opção 2: Setup Manual
Se preferir rodar passo a passo no terminal:

```bash
# 1. Configurar o arquivo de ambiente do Backend
cp backend/.env.example backend/.env

# 2. Subir os containers e forçar o build das imagens
docker compose up -d --build

# 3. Instalar dependências e preparar o banco
docker exec task-manager-api composer install
docker exec task-manager-api php artisan key:generate
docker exec task-manager-api php artisan migrate

# Acessar
# Backend: http://localhost:8000/api
# Frontend: http://localhost:5173
```

### Sem Docker

#### Backend
```bash
cd backend
composer install
cp .env.example .env
# Configurar banco PostgreSQL no .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## 🔐 Autenticação

O sistema utiliza um **token fixo** via Bearer token conforme escopo do projeto:

```
Authorization: Bearer PSWCLOUD-TOKEN-2026
```

O middleware `TokenAuthMiddleware` valida o token em todas as rotas da API. Requisições sem token ou com token inválido recebem **HTTP 401**.

---

## 📡 Endpoints da API

### Projetos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/projetos` | Listar todos os projetos |
| POST | `/api/projetos` | Criar projeto |
| GET | `/api/projetos/{id}` | Detalhes do projeto (com tarefas) |
| PUT | `/api/projetos/{id}` | Atualizar projeto |
| DELETE | `/api/projetos/{id}` | Excluir projeto |
| GET | `/api/projetos/{id}/resumo` | Contagem de tarefas por status |

### Tarefas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/projetos/{id}/tarefas` | Listar tarefas do projeto |
| POST | `/api/tarefas` | Criar tarefa |
| GET | `/api/tarefas/{id}` | Detalhes da tarefa (com comentários) |
| PUT | `/api/tarefas/{id}` | Atualizar tarefa |
| DELETE | `/api/tarefas/{id}` | Excluir tarefa |
| PATCH | `/api/tarefas/{id}/status` | Atualizar status (Kanban) |

### Comentários
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/comentarios` | Criar comentário |

---

## 🧪 Testes

### Executar testes
```bash
cd backend
php artisan test
```

### Testes Unitários (Services)
- `ProjetoServiceTest` — Criação de projeto, resumo por status, exclusão
- `TarefaServiceTest` — Campo `atrasada` em tarefas vencidas, flag `sugerir_inativacao`

### Testes Feature (Endpoints)
- Listagem de projetos com token válido (200)
- Rejeição sem token (401)
- Bloqueio de criação de tarefa em projeto inativo (422)
- Endpoint de resumo com contagem agrupada (200)

---

## 💡 Decisões Técnicas

### Backend

1. **Service Layer**: Toda lógica de negócio reside nos Services, mantendo Controllers "magros" e focados em I/O HTTP. Facilita testes unitários.

2. **FormRequest para validação**: Regras como "não criar tarefa em projeto inativo" ficam no `StoreTarefaRequest` com closure personalizada, separando validação do controller.

3. **Autenticação**: Implementação via Bearer token simplificado (`PSWCLOUD-TOKEN-2026`) focada no escopo do desafio.

4. **Regras de Negócio Virtuais**: Campos como `atrasada` são calculados dinamicamente no Service em tempo de execução, evitando dados obsoletos no banco.

### Frontend

1. **SWR vs Context API**: SWR para dados do servidor (cache, revalidação, deduplicação); Context API para estado global de UI (tema, auth).

2. **useMemo/useCallback**: Memoização de dados ordenados/filtrados (`sortedProjetos`, `filteredProjetos`) e callbacks estabilizados para evitar re-renders desnecessários em componentes filhos.

3. **React.lazy + Suspense**: Code-splitting automático por página — cada rota gera um chunk separado no build.

4. **Axios Interceptors**: Injeção automática do Bearer token em todas as requests e tratamento global de 401 (logout automático).

5. **Design System**: Utilização do Material UI (MUI) com Dark Mode padrão, paleta customizada e componentes estilizados para uma UI/UX mais limpa.

---

## ✨ Funcionalidades

- **Gestão de Projetos e Tarefas**: CRUD completo com validações isoladas em FormRequests.
- **Kanban Board**: Interface drag & drop para mudança rápida de status das tarefas.
- **Dashboard Analítico**: Gráficos integrados com Chart.js.
- **Comentários**: Sistema de comentários atrelados às tarefas.
- **Listagem Avançada**: Tabelas com ordenação, paginação e filtros dinâmicos de status.
- **UX e Feedback Visual**: Indicadores visuais para tarefas atrasadas, dialogs de confirmação e sistema de temas (Dark/Light mode).

---

## 📝 Padrão de Commits

```
PSWCLOUD-{N} ({tipo}): {descrição}
```

Exemplos:
- `PSWCLOUD-1 (feat): Setup ambiente Docker`
- `PSWCLOUD-4 (feat): Páginas completas com Dashboard e Kanban`

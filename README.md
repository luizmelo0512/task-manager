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

### Com Docker (recomendado)

```bash
# Clonar o repositório
git clone https://github.com/luizmelo0512/task-manager.git
cd task-manager

# Subir os containers
docker-compose up -d

# Executar migrations
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

3. **Token fixo**: Conforme escopo, autenticação simplificada com middleware customizado. Em produção, usaríamos JWT com refresh token.

4. **Campo `atrasada` calculado**: O campo é virtual, calculado no Service (não persiste no banco). Tarefas com prioridade `alta` e `data_limite` vencida recebem `atrasada: true`.

### Frontend

1. **SWR vs Context API**: SWR para dados do servidor (cache, revalidação, deduplicação); Context API para estado global de UI (tema, auth).

2. **useMemo/useCallback**: Memoização de dados ordenados/filtrados (`sortedProjetos`, `filteredProjetos`) e callbacks estabilizados para evitar re-renders desnecessários em componentes filhos.

3. **React.lazy + Suspense**: Code-splitting automático por página — cada rota gera um chunk separado no build.

4. **Axios Interceptors**: Injeção automática do Bearer token em todas as requests e tratamento global de 401 (logout automático).

5. **Design System MUI**: Dark Mode padrão com paleta customizada (violeta `#6C63FF` + verde neon `#00D9A5`), glassmorphism no AppBar, micro-animações em cards.

---

## ✨ Funcionalidades

### Obrigatórias ✅
- [x] CRUD completo de Projetos
- [x] CRUD completo de Tarefas com validações
- [x] Comentários inline nas tarefas
- [x] Filtro por status na listagem
- [x] Tabela com ordenação e paginação
- [x] Chips coloridos para status e prioridade
- [x] Dialog de confirmação para exclusão
- [x] Indicador visual de tarefas atrasadas
- [x] Layout responsivo
- [x] Lazy loading de rotas

### Diferenciais ✅
- [x] Kanban Board com drag & drop (mudança de status)
- [x] Dashboard com gráfico Chart.js (distribuição de tarefas)
- [x] Dark Mode toggle via Context API

---

## 📝 Padrão de Commits

```
PSWCLOUD-{N} ({tipo}): {descrição}
```

Exemplos:
- `PSWCLOUD-1 (feat): Setup ambiente Docker`
- `PSWCLOUD-4 (feat): Páginas completas com Dashboard e Kanban`

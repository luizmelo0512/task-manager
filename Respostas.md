# Respostas - Prova Teórica (Nível Pleno)

### Questão 1 — Arquitetura e Service Layer

**Resposta:**
No padrão de arquitetura em camadas (MVC + Services):
- **Models:** São responsáveis por mapear a estrutura de dados (banco de dados) e definir relacionamentos. Elas não devem conter regras de negócio complexas.
- **Controllers:** Devem atuar apenas como a "porta de entrada" da requisição. A Sua responsabilidade é receber o Request HTTP, chamar a validação (neste caso através de Form Requests), delegar o processamento para a Service Layer e retornar a Response padronizada (JSON).
- **Services (Service Layer):** É o coração da aplicação, onde reside toda a lógica de negócio pesada, integrações e orquestrações. 

**Por que evitamos lógica no Controller?** 
Para garantir a reusabilidade (um Service pode ser chamado pelo Controller Web, por um Job em background ou um comando Artisan CLI sem duplicar código) e a testabilidade (é muito mais simples testar um Service de forma unitária do que simular todo o ciclo de vida de uma requisição HTTP no Controller).

**Exemplo Prático (Pseudocódigo):**
```php
// --- CONTROLLER ---
class ContaController extends Controller {
    public function cancelar(Request $request, int $id, ContaService $service) {
        // O Controller apenas vai delegar e responder
        $conta = $service->cancelarConta($id, $request->user());
        return response()->json(['message' => 'Conta cancelada', 'data' => $conta]);
    }
}

// --- SERVICE ---
class ContaService {
    public function cancelarConta(int $id, User $usuarioAcao) {
        $conta = Conta::findOrFail($id);
        
        // 1. Valida se a conta pode ser cancelada
        if ($conta->status === 'cancelada') {
            throw new \Exception("Esta conta já encontra-se cancelada.");
        }
        
        // 2. Atualiza o status
        $conta->status = 'cancelada';
        $conta->save();
        
        // 3. Enviar notificação por e-mail
        Mail::to($usuarioAcao->email)->send(new ContaCanceladaMail($conta));
        
        return $conta;
    }
}
```

---

### Questão 2 — TypeScript 

**Resposta:**
O uso de Tipos Genéricos (`<T>`) no TypeScript permite criar funções reutilizáveis e *type-safe*, garantindo que o retorno da API seja conhecido em tempo de desenvolvimento.

**Exemplo Prático:**
```typescript
import axios from 'axios';

// 1. Interface genérica para envelopar a resposta da API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// 2. Função genérica encapsulada
export async function fetchEntity<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await axios.get<ApiResponse<T>>(url);
    return response.data;
  } catch (error) {
    // Tratamento de erro detalhado
    if (axios.isAxiosError(error)) {
      console.error('Erro da API:', error.response?.data?.message || error.message);
      throw new Error(`Falha ao buscar dados (Status: ${error.response?.status})`);
    }
    console.error('Erro de rede ou inesperado:', error);
    throw new Error('Erro inesperado na aplicação');
  }
}

// --- USO NA PRÁTICA ---
interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
}

// O TypeScript agora sabe que "resultado" é do tipo ApiResponse<Empresa>
// e "resultado.data" é do tipo Empresa.
const resultado = await fetchEntity<Empresa>('/api/empresas/1');
console.log(resultado.data.nome);
```

---

### Questão 3 — React: Gerenciamento de Estado e Performance

**Resposta:**

**1. Quando usar Context API vs. SWR?**
- **Context API:** Ideal para estados globais do cliente (Client-State) que mudam com pouca frequência, como o Tema da UI (Dark/Light), Dados do Usuário Autenticado (JWT) ou idioma.
- **SWR (State While Revalidate):** Desenhado para estado vindo do servidor (Server-State). Ele lida automaticamente com cache, revalidação em background, deduplicação de requisições e loading states.

**2. O problema de um Contexto único para tudo:**
Se você colocar todo o estado da aplicação num único `AppContext`, sempre que um campo for alterado (ex: abrir um modal), **todos os componentes que consomem esse contexto sofrerão re-render**, mesmo que não usem o estado do modal. Isso destrói a performance. A solução é fatiar os contextos por domínio ou usar libs atômicas (Zustand, Jotai).

**3. React.memo, useMemo e useCallback:**
Essas ferramentas servem para "Memorizar" valores e funções.
- `React.memo`: Evita o re-render de um componente se suas *Props* não sofreram alteração.
- `useMemo`: Memoriza o resultado de um cálculo pesado.
- `useCallback`: Memoriza a **referência** de uma função. Essencial para passar funções como *prop* para componentes filhos blindados com `React.memo`.

**Exemplo Prático:**
```tsx
import React, { useState, useCallback } from 'react';

// O filho só vai renderizar de novo se a prop "onAction" mudar sua referência
const BotaoAcao = React.memo(({ onAction }: { onAction: () => void }) => {
  console.log("Renderizou BotaoAcao");
  return <button onClick={onAction}>Executar Ação</button>;
});

export default function Pai() {
  const [contador, setContador] = useState(0);

  // Sem useCallback, esta função nasceria de novo (nova referência na RAM)
  // toda vez que o 'contador' mudasse, forçando o BotaoAcao a re-renderizar.
  const handleAcao = useCallback(() => {
    alert('Ação executada!');
  }, []); // Sem dependências = referência travada!

  return (
    <div>
      <h1>{contador}</h1>
      <button onClick={() => setContador(c => c + 1)}>Somar</button>
      <BotaoAcao onAction={handleAcao} />
    </div>
  );
}
```

---

### Questão 4 — Segurança e Autenticação

**Resposta:**

**1. Mitigações para redução de impacto (Token roubado):**
- **Short-lived Tokens:** Tokens de acesso com vida muito curta (ex: 15 minutos), exigindo um `Refresh Token` rotativo.
- **Vinculação de Contexto:** Assinar o token contendo o IP ou impressão digital (User-Agent) do navegador. Se o token for usado em um IP de outro país de repente, bloqueá-lo.
- **Blocklists:** Possuir uma tabela em cache (Redis) de tokens ativamente revogados antes da expiração.

**2. Axios Interceptor lidando com o 401:**
O interceptor deve capturar o erro 401, limpar o estado local de autenticação e redirecionar o usuário à página de login forçadamente. (Pode-se também tentar bater em uma rota `/refresh` silenciosamente antes de deslogar o usuário).
**Exemplo Prático:**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      // Redireciona via window.location ou despacha evento pro Context
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
```

**3. CSRF e APIs Stateless:**
CSRF (Cross-Site Request Forgery) ocorre quando um site malicioso força o browser a enviar uma requisição forjada para seu sistema, e o browser injeta os *Cookies* de sessão automaticamente. 
APIs Stateless baseadas em **Bearer Tokens** salvos no localStorage **não sofrem CSRF** tradicionalmente, pois o token de autenticação não é um Cookie e o browser não o anexa sozinho. O Frontend precisa injetá-lo explicitamente via header (`Authorization: Bearer <token>`).

---

### Questão 5 — Testes e Qualidade de Código

**Resposta:**

**1. Teste Unitário Mockando a Model**
No teste unitário, não queremos bater no banco de dados, então injetamos um dublê (Mock) do `MotivoInativacaoModel`.
```php
namespace Tests\Unit;

use Tests\TestCase;
use Mockery;
use App\Services\MotivoInativacaoService;
use App\Models\MotivoInativacaoModel;

class MotivoInativacaoServiceTest extends TestCase
{
    public function test_deve_criar_motivo_com_sucesso()
    {
        // 1. Criar o Mock da Model
        $mockModel = Mockery::mock(MotivoInativacaoModel::class);
        
        // 2. Definir a expectativa: O método 'insert' será chamado 1 vez com os dados passados, e retornará um array simulado
        $mockModel->shouldReceive('insert')
                  ->once()
                  ->with(['descricao' => 'Falência'])
                  ->andReturn(['id' => 1, 'descricao' => 'Falência']);

        // 3. Injetar o mock no Service
        $service = new MotivoInativacaoService($mockModel);
        
        // 4. Executar
        $resultado = $service->criar(['descricao' => 'Falência']);
        
        // 5. Assert (Validação)
        $this->assertEquals(1, $resultado['id']);
        $this->assertEquals('Falência', $resultado['descricao']);
    }

    public function test_deve_lancar_excecao_se_descricao_vazia()
    {
        $mockModel = Mockery::mock(MotivoInativacaoModel::class);
        $service = new MotivoInativacaoService($mockModel);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Descrição é obrigatória');

        $service->criar(['descricao' => '']); // Vai disparar a Exception
    }
}
```

**2. Teste Feature (Integração)**
O teste feature verifica a rota ponta-a-ponta, batendo no banco de dados real de testes (em memória ou sqlite).
```php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MotivoInativacaoEndpointTest extends TestCase
{
    use RefreshDatabase; // Reseta o BD após o teste

    public function test_endpoint_cria_motivo_inativacao_com_sucesso()
    {
        $payload = [
            'descricao' => 'Fechamento de ciclo'
        ];

        // Partindo do pressuposto de que existe uma rota HTTP definida
        $response = $this->postJson('/api/motivos-inativacao', $payload);

        // Validar Retorno HTTP
        $response->assertStatus(201)
                 ->assertJsonFragment(['descricao' => 'Fechamento de ciclo']);

        // Validar Estado do Banco de Dados
        $this->assertDatabaseHas('motivos_inativacao', [
            'descricao' => 'Fechamento de ciclo'
        ]);
    }
}
```

<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Projeto;
use App\Models\Tarefa;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Testes feature (integração) dos endpoints da API.
 * Testam as rotas HTTP com autenticação via Bearer token.
 */
class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Token fixo conforme definido no TokenAuthMiddleware.
     */
    private const BEARER_TOKEN = 'PSWCLOUD-TOKEN-2026';

    /**
     * Helper: Headers de autenticação padrão.
     */
    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer ' . self::BEARER_TOKEN];
    }

    // ====================================================================
    // TESTE 1: Listagem de projetos com autenticação
    // ====================================================================

    /**
     * Testa GET /api/projetos retorna lista de projetos com token válido.
     */
    public function test_listar_projetos_com_token_valido(): void
    {
        Projeto::factory()->count(3)->create();

        $response = $this->getJson('/api/projetos', $this->authHeaders());

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /**
     * Testa que requisição sem token retorna 401.
     */
    public function test_listar_projetos_sem_token_retorna_401(): void
    {
        $response = $this->getJson('/api/projetos');

        $response->assertStatus(401)
                 ->assertJson(['erro' => 'Token não fornecido']);
    }

    // ====================================================================
    // TESTE 2: Não permitir criar tarefa em projeto inativo
    // ====================================================================

    /**
     * Regra: Não permitir criar tarefa em projeto inativo.
     * O FormRequest deve barrar a criação com status 422.
     */
    public function test_nao_criar_tarefa_em_projeto_inativo(): void
    {
        $projeto = Projeto::factory()->inativo()->create();

        $response = $this->postJson('/api/tarefas', [
            'projeto_id' => $projeto->id,
            'titulo' => 'Tarefa Teste',
            'descricao' => 'Descrição',
            'prioridade' => 'alta',
            'data_limite' => now()->addDays(5)->toDateString(),
        ], $this->authHeaders());

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('projeto_id');
    }

    // ====================================================================
    // TESTE 3: Endpoint de resumo retorna contagem por status
    // ====================================================================

    /**
     * Testa GET /api/projetos/{id}/resumo retorna contagem agrupada.
     */
    public function test_resumo_projeto_retorna_contagem_por_status(): void
    {
        $projeto = Projeto::factory()->create();

        Tarefa::factory()->count(2)->create([
            'projeto_id' => $projeto->id,
            'status' => 'pendente',
        ]);
        Tarefa::factory()->count(1)->concluida()->create([
            'projeto_id' => $projeto->id,
        ]);

        $response = $this->getJson(
            "/api/projetos/{$projeto->id}/resumo",
            $this->authHeaders()
        );

        $response->assertStatus(200)
                 ->assertJsonCount(2) // 2 status distintos
                 ->assertJsonFragment(['status' => 'pendente', 'total' => 2])
                 ->assertJsonFragment(['status' => 'concluida', 'total' => 1]);
    }
}

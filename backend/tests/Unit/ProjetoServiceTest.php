<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Projeto;
use App\Models\Tarefa;
use App\Services\ProjetoService;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Testes unitários do ProjetoService.
 * Testam a lógica de negócio isoladamente.
 */
class ProjetoServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProjetoService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProjetoService();
    }

    /**
     * Testa se o serviço cria um projeto corretamente.
     */
    public function test_criar_projeto_com_dados_validos(): void
    {
        $dados = [
            'nome' => 'Projeto Teste',
            'descricao' => 'Descrição do projeto',
            'status' => 'ativo',
            'data_criacao' => now()->toDateString(),
        ];

        $projeto = $this->service->criar($dados);

        $this->assertInstanceOf(Projeto::class, $projeto);
        $this->assertEquals('Projeto Teste', $projeto->nome);
        $this->assertEquals('ativo', $projeto->status);
        $this->assertDatabaseHas('projetos', ['nome' => 'Projeto Teste']);
    }

    /**
     * Testa se o resumo de tarefas agrupa corretamente por status.
     * Regra: GET /projetos/{id}/resumo retorna contagem por status.
     */
    public function test_obter_resumo_tarefas_agrupa_por_status(): void
    {
        $projeto = Projeto::factory()->create();

        // Cria tarefas com status variados
        Tarefa::factory()->count(3)->create([
            'projeto_id' => $projeto->id,
            'status' => 'pendente',
        ]);
        Tarefa::factory()->count(2)->create([
            'projeto_id' => $projeto->id,
            'status' => 'em_andamento',
        ]);
        Tarefa::factory()->count(1)->concluida()->create([
            'projeto_id' => $projeto->id,
        ]);

        $resumo = $this->service->obterResumoTarefas($projeto->id);

        $this->assertCount(3, $resumo); // 3 status distintos
        $this->assertEquals(3, $resumo->where('status', 'pendente')->first()->total);
        $this->assertEquals(2, $resumo->where('status', 'em_andamento')->first()->total);
        $this->assertEquals(1, $resumo->where('status', 'concluida')->first()->total);
    }

    /**
     * Testa exclusão de projeto.
     */
    public function test_excluir_projeto_remove_do_banco(): void
    {
        $projeto = Projeto::factory()->create();

        $this->service->excluir($projeto->id);

        $this->assertDatabaseMissing('projetos', ['id' => $projeto->id]);
    }
}

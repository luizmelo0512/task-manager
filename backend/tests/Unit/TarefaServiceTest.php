<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Projeto;
use App\Models\Tarefa;
use App\Services\TarefaService;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Testes unitários do TarefaService.
 * Testam as regras de negócio: campo atrasada e sugestão de inativação.
 */
class TarefaServiceTest extends TestCase
{
    use RefreshDatabase;

    private TarefaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TarefaService();
    }

    /**
     * Regra: Tarefa com prioridade alta e data_limite vencida
     * deve retornar campo atrasada: true na listagem.
     */
    public function test_tarefa_atrasada_retorna_campo_atrasada_true(): void
    {
        $projeto = Projeto::factory()->create();

        // Tarefa com prioridade alta e data vencida
        Tarefa::factory()->atrasada()->create([
            'projeto_id' => $projeto->id,
        ]);

        // Tarefa normal (não atrasada)
        Tarefa::factory()->create([
            'projeto_id' => $projeto->id,
            'prioridade' => 'baixa',
            'data_limite' => now()->addDays(10)->toDateString(),
        ]);

        $tarefas = $this->service->listarPorProjeto($projeto->id);

        $atrasada = $tarefas->first(fn ($t) => $t->prioridade === 'alta');
        $normal = $tarefas->first(fn ($t) => $t->prioridade === 'baixa');

        $this->assertTrue($atrasada->atrasada);
        $this->assertFalse($normal->atrasada);
    }

    /**
     * Regra: Ao concluir todas as tarefas de um projeto,
     * sugerir inativação (retornar flag sugerir_inativacao = true).
     */
    public function test_sugerir_inativacao_quando_todas_tarefas_concluidas(): void
    {
        $projeto = Projeto::factory()->create();

        $tarefa1 = Tarefa::factory()->concluida()->create(['projeto_id' => $projeto->id]);
        $tarefa2 = Tarefa::factory()->create(['projeto_id' => $projeto->id, 'status' => 'pendente']);

        // Concluir a última tarefa pendente
        $resultado = $this->service->atualizarStatus($tarefa2->id, 'concluida');

        $this->assertTrue($resultado['sugerir_inativacao']);
    }

    /**
     * Regra: Se ainda há tarefas pendentes, não sugerir inativação.
     */
    public function test_nao_sugerir_inativacao_com_tarefas_pendentes(): void
    {
        $projeto = Projeto::factory()->create();

        Tarefa::factory()->create(['projeto_id' => $projeto->id, 'status' => 'pendente']);
        $tarefa2 = Tarefa::factory()->create(['projeto_id' => $projeto->id, 'status' => 'pendente']);

        // Concluir apenas uma tarefa
        $resultado = $this->service->atualizarStatus($tarefa2->id, 'concluida');

        $this->assertFalse($resultado['sugerir_inativacao']);
    }
}

<?php

namespace Database\Factories;

use App\Models\Tarefa;
use App\Models\Projeto;
use Illuminate\Database\Eloquent\Factories\Factory;

class TarefaFactory extends Factory
{
    protected $model = Tarefa::class;

    public function definition(): array
    {
        return [
            'projeto_id' => Projeto::factory(),
            'titulo' => fake()->sentence(4),
            'descricao' => fake()->paragraph(),
            'status' => 'pendente',
            'prioridade' => fake()->randomElement(['baixa', 'media', 'alta']),
            'responsavel' => fake()->name(),
            'data_limite' => now()->addDays(7)->toDateString(),
        ];
    }

    /**
     * Estado: tarefa concluída.
     */
    public function concluida(): static
    {
        return $this->state(fn () => ['status' => 'concluida']);
    }

    /**
     * Estado: tarefa atrasada (prioridade alta + data passada).
     */
    public function atrasada(): static
    {
        return $this->state(fn () => [
            'prioridade' => 'alta',
            'data_limite' => now()->subDays(3)->toDateString(),
            'status' => 'pendente',
        ]);
    }
}

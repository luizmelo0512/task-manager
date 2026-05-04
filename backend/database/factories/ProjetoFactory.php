<?php

namespace Database\Factories;

use App\Models\Projeto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjetoFactory extends Factory
{
    protected $model = Projeto::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->sentence(3),
            'descricao' => fake()->paragraph(),
            'status' => 'ativo',
            'data_criacao' => now()->toDateString(),
        ];
    }

    /**
     * Estado: projeto inativo.
     */
    public function inativo(): static
    {
        return $this->state(fn () => ['status' => 'inativo']);
    }
}

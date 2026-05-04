<?php

namespace Database\Factories;

use App\Models\Comentario;
use App\Models\Tarefa;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComentarioFactory extends Factory
{
    protected $model = Comentario::class;

    public function definition(): array
    {
        return [
            'tarefa_id' => Tarefa::factory(),
            'autor' => fake()->name(),
            'texto' => fake()->paragraph(),
            'data_criacao' => now()->toDateTimeString(),
        ];
    }
}

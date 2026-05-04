<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjetoController;
use App\Http\Controllers\TarefaController;
use App\Http\Controllers\ComentarioController;

Route::middleware('token.auth')->group(function () {

    // --- Rotas de Projetos ---
    Route::apiResource('projetos', ProjetoController::class);
    Route::get('projetos/{projeto}/resumo', [ProjetoController::class, 'resumo']);

    // --- Rotas de Tarefas ---
    Route::get('projetos/{projeto}/tarefas', [TarefaController::class, 'index']);
    Route::post('tarefas', [TarefaController::class, 'store']);
    Route::get('tarefas/{tarefa}', [TarefaController::class, 'show']);
    Route::put('tarefas/{tarefa}', [TarefaController::class, 'update']);
    Route::delete('tarefas/{tarefa}', [TarefaController::class, 'destroy']);
    Route::patch('tarefas/{tarefa}/status', [TarefaController::class, 'atualizarStatus']);

    // --- Rotas de Comentários ---
    Route::post('comentarios', [ComentarioController::class, 'store']);
});

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTarefaRequest;
use App\Services\TarefaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class TarefaController extends Controller
{
    public function __construct(private TarefaService $tarefaService) {}

    public function index(int $projetoId): JsonResponse
    {
        $tarefas = $this->tarefaService->listarPorProjeto($projetoId);
        return response()->json($tarefas, 200);
    }

    public function store(StoreTarefaRequest $request): JsonResponse
    {
        $tarefa = $this->tarefaService->criar($request->validated());
        return response()->json($tarefa, 201);
    }

    public function atualizarStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:pendente,em_andamento,concluida']);

        $resultado = $this->tarefaService->atualizarStatus($id, $request->status);

        return response()->json($resultado, 200);
    }

    public function show(int $id): JsonResponse
    {
        $tarefa = $this->tarefaService->obterPorId($id);
        return response()->json($tarefa, 200);
    }

    public function update(StoreTarefaRequest $request, int $id): JsonResponse
    {
        $tarefa = $this->tarefaService->atualizar($id, $request->validated());
        return response()->json($tarefa, 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->tarefaService->excluir($id);
        return response()->json(null, 204);
    }
}

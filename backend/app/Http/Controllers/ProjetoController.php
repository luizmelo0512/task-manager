<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjetoRequest;
use App\Services\ProjetoService;
use Illuminate\Http\JsonResponse;

class ProjetoController extends Controller
{
    public function __construct(private ProjetoService $projetoService) {}

    public function index(): JsonResponse
    {
        $projetos = $this->projetoService->listar();
        return response()->json($projetos, 200);
    }

    public function store(StoreProjetoRequest $request): JsonResponse
    {
        $projeto = $this->projetoService->criar($request->validated());
        return response()->json($projeto, 201);
    }

    public function resumo(int $id): JsonResponse
    {
        $resumo = $this->projetoService->obterResumoTarefas($id);
        return response()->json($resumo, 200);
    }

    public function show(int $id): JsonResponse
    {
        $projeto = $this->projetoService->obterPorId($id);
        return response()->json($projeto, 200);
    }

    public function update(StoreProjetoRequest $request, int $id): JsonResponse
    {
        $projeto = $this->projetoService->atualizar($id, $request->validated());
        return response()->json($projeto, 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->projetoService->excluir($id);
        return response()->json(null, 204);
    }
}

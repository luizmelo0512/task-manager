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

    /**
     * @OA\Post(
     *     path="/tarefas",
     *     summary="Criar uma nova tarefa",
     *     description="Cria uma tarefa vinculada a um projeto. Não permite criação em projetos inativos.",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"projeto_id","titulo","data_limite"},
     *             @OA\Property(property="projeto_id", type="integer", example=1),
     *             @OA\Property(property="titulo", type="string", example="Implementar autenticação"),
     *             @OA\Property(property="descricao", type="string", example="Criar middleware de token"),
     *             @OA\Property(property="prioridade", type="string", enum={"baixa","media","alta"}, example="alta"),
     *             @OA\Property(property="data_limite", type="string", format="date", example="2026-05-10")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tarefa criada com sucesso"),
     *     @OA\Response(response=422, description="Validação falhou (ex: projeto inativo)")
     * )
     */
    public function store(StoreTarefaRequest $request): JsonResponse
    {
        $tarefa = $this->tarefaService->criar($request->validated());
        return response()->json($tarefa, 201);
    }

    /**
     * @OA\Patch(
     *     path="/tarefas/{id}/status",
     *     summary="Atualizar status de uma tarefa",
     *     description="Atualiza o status e retorna flag sugerir_inativacao se todas as tarefas do projeto forem concluídas.",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"pendente","em_andamento","concluida"}, example="concluida")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Status atualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="tarefa", type="object"),
     *             @OA\Property(property="sugerir_inativacao", type="boolean", example=false)
     *         )
     *     )
     * )
     */
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

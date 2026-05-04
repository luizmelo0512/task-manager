<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjetoRequest;
use App\Services\ProjetoService;
use Illuminate\Http\JsonResponse;

class ProjetoController extends Controller
{
    public function __construct(private ProjetoService $projetoService) {}

    /**
     * @OA\Get(
     *     path="/projetos",
     *     summary="Listar todos os projetos",
     *     tags={"Projetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de projetos retornada com sucesso",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nome", type="string", example="Projeto Alpha"),
     *                 @OA\Property(property="descricao", type="string", example="Descrição do projeto"),
     *                 @OA\Property(property="status", type="string", enum={"ativo","inativo"}, example="ativo"),
     *                 @OA\Property(property="data_criacao", type="string", format="date", example="2026-05-01")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Token não fornecido ou inválido")
     * )
     */
    public function index(): JsonResponse
    {
        $projetos = $this->projetoService->listar();
        return response()->json($projetos, 200);
    }

    /**
     * @OA\Post(
     *     path="/projetos",
     *     summary="Criar um novo projeto",
     *     tags={"Projetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nome"},
     *             @OA\Property(property="nome", type="string", example="Novo Projeto"),
     *             @OA\Property(property="descricao", type="string", example="Descrição detalhada"),
     *             @OA\Property(property="status", type="string", enum={"ativo","inativo"}, example="ativo"),
     *             @OA\Property(property="data_criacao", type="string", format="date", example="2026-05-01")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Projeto criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="nome", type="string", example="Novo Projeto"),
     *             @OA\Property(property="status", type="string", example="ativo")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(StoreProjetoRequest $request): JsonResponse
    {
        $projeto = $this->projetoService->criar($request->validated());
        return response()->json($projeto, 201);
    }

    /**
     * @OA\Get(
     *     path="/projetos/{id}/resumo",
     *     summary="Obter resumo de tarefas do projeto agrupado por status",
     *     tags={"Projetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID do projeto",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resumo das tarefas por status",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="status", type="string", example="pendente"),
     *                 @OA\Property(property="total", type="integer", example=5)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Projeto não encontrado")
     * )
     */
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

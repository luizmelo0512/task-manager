<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComentarioRequest;
use App\Services\ComentarioService;
use Illuminate\Http\JsonResponse;

class ComentarioController extends Controller
{
    public function __construct(private ComentarioService $comentarioService) {}

    public function store(StoreComentarioRequest $request): JsonResponse
    {
        $comentario = $this->comentarioService->criar($request->validated());
        return response()->json($comentario, 201);
    }
}

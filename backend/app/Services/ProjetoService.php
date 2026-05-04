<?php

namespace App\Services;

use App\Models\Projeto;
use Illuminate\Support\Facades\DB;

class ProjetoService
{
    public function listar()
    {
        return Projeto::all();
    }

    public function criar(array $dados)
    {
        return Projeto::create($dados);
    }

    public function obterResumoTarefas(int $projetoId)
    {
        $projeto = Projeto::findOrFail($projetoId);

        $resumo = $projeto->tarefas()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        return $resumo;
    }

    public function obterPorId(int $id)
    {
        return Projeto::with('tarefas')->findOrFail($id);
    }

    public function atualizar(int $id, array $dados)
    {
        $projeto = Projeto::findOrFail($id);
        $projeto->update($dados);
        return $projeto;
    }

    public function excluir(int $id)
    {
        $projeto = Projeto::findOrFail($id);
        $projeto->delete();
    }
}

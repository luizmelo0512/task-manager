<?php

namespace App\Services;

use App\Models\Tarefa;
use App\Models\Projeto;
use Carbon\Carbon;
use Exception;

class TarefaService
{
    public function listarPorProjeto(int $projetoId)
    {
        $tarefas = Tarefa::where('projeto_id', $projetoId)->get();

        $tarefas->map(function ($tarefa) {
            $tarefa->atrasada = false;

            $dataLimite = Carbon::parse($tarefa->data_limite);

            if ($tarefa->prioridade === 'alta' && $dataLimite->isPast() && $tarefa->status !== 'concluida') {
                $tarefa->atrasada = true;
            }

            return $tarefa;
        });

        return $tarefas;
    }

    public function criar(array $dados)
    {
        return Tarefa::create($dados);
    }

    public function atualizarStatus(int $tarefaId, string $novoStatus)
    {
        $tarefa = Tarefa::findOrFail($tarefaId);
        $tarefa->status = $novoStatus;
        $tarefa->save();

        $sugerirInativacao = false;

        if ($novoStatus === 'concluida') {
            $tarefasPendentes = Tarefa::where('projeto_id', $tarefa->projeto_id)
                ->where('status', '!=', 'concluida')
                ->count();

            if ($tarefasPendentes === 0) {
                $sugerirInativacao = true;
            }
        }

        return [
            'tarefa' => $tarefa,
            'sugerir_inativacao' => $sugerirInativacao
        ];
    }

    public function obterPorId(int $id)
    {
        return Tarefa::with('comentarios')->findOrFail($id);
    }

    public function atualizar(int $id, array $dados)
    {
        $tarefa = Tarefa::findOrFail($id);
        $tarefa->update($dados);

        return $tarefa;
    }

    public function excluir(int $id)
    {
        $tarefa = Tarefa::findOrFail($id);
        $tarefa->delete();
    }
}

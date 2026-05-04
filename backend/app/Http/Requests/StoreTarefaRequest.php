<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Projeto;

class StoreTarefaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'projeto_id' => [
                'required',
                'exists:projetos,id',
                function ($attribute, $value, $fail) {
                    $projeto = Projeto::find($value);
                    if ($projeto && $projeto->status === 'inativo') {
                        $fail('Não é possível criar tarefas em um projeto inativo.');
                    }
                },
            ],
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'in:baixa,media,alta',
            'data_limite' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'projeto_id.exists' => 'O projeto informado não existe.',
            'titulo.required' => 'O título da tarefa é obrigatório.',
        ];
    }
}

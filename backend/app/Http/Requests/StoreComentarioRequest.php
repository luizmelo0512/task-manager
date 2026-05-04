<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tarefa_id' => 'required|exists:tarefas,id',
            'autor' => 'required|string|max:100',
            'texto' => 'required|string',
        ];
    }
}

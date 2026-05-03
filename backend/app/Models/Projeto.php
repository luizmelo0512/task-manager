<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Projeto extends BaseModel
{
    protected $table = 'projetos';
    protected $fillable = [
        'nome',
        'descricao',
        'status',
        'data_criacao'
    ];

    public function tarefas()
    {
        return $this->hasMany(Tarefa::class, 'projeto_id');
    }
}

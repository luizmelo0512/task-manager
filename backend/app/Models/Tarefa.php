<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarefa extends Model
{
    protected $table = 'tarefas';
    protected $fillable = [
        'projeto_id',
        'titulo',
        'descricao',
        'status',
        'prioridade',
        'responsavel',
        'data_limite'
    ];

    public function projeto()
    {
        return $this->belongsTo(Projeto::class, 'projeto_id');
    }

    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'tarefa_id');
    }
}

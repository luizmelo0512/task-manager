<?php

namespace App\Models;

class Comentario extends BaseModel
{
    protected $table = 'comentarios';

    protected $fillable = [
        'tarefa_id',
        'autor',
        'texto',
        'data_criacao'
    ];

    public function tarefa()
    {
        return $this->belongsTo(Tarefa::class, 'tarefa_id');
    }
}

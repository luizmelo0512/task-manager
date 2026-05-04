<?php

namespace App\Services;

use App\Models\Comentario;

class ComentarioService
{
    public function criar(array $dados)
    {
        return Comentario::create($dados);
    }
}

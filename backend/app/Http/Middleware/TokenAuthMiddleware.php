<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenAuthMiddleware
{
    // TOKEN FIXO PARA VALIDAÇÃO (CONFORME INSERIDO NO ESCOPO DO PROJETO)
    private const TOKEN_FIXO = 'PSWCLOUD-TOKEN-2026';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['erro' => 'Token não fornecido'], 401);
        }

        if ($token !== self::TOKEN_FIXO) {
            return response()->json(['erro' => 'Token inválido ou expirado'], 401);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Task Manager API",
 *     description="API REST para o Sistema de Gerenciamento de Tarefas",
 *     @OA\Contact(
 *         email="luiz@taskmanager.com"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Servidor de Desenvolvimento"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="token",
 *     description="Token fixo: PSWCLOUD-TOKEN-2026"
 * )
 */
abstract class Controller
{
    //
}

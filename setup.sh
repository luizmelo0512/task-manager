#!/bin/bash

echo "🚀 Iniciando setup automático do Task Manager (Mac/Linux)..."

echo "📦 Configurando arquivos de ambiente..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ backend/.env criado."
else
    echo "ℹ️ backend/.env já existe, pulando."
fi

echo "🐳 Subindo os containers Docker..."
docker compose up -d --build

echo "⏳ Aguardando banco de dados iniciar (5s)..."
sleep 5

echo "🐘 Instalando dependências do backend..."
docker exec task-manager-api composer install

echo "🔑 Gerando Application Key..."
docker exec task-manager-api php artisan key:generate

echo "🗄️ Rodando migrations e inserindo dados de teste..."
docker exec task-manager-api php artisan migrate --force --seed

echo "✅ Setup automático finalizado com sucesso!"
echo "🌐 Acesse o Frontend em: http://localhost:5173"
echo "🌐 Acesse a API em: http://localhost:8000/api"

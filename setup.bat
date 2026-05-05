@echo off
echo 🚀 Iniciando setup automatico do Task Manager (Windows)...

echo 📦 Configurando arquivos de ambiente...
if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo ✅ backend\.env criado.
) else (
    echo ℹ️ backend\.env ja existe, pulando.
)

echo 🐳 Subindo os containers Docker...
docker compose up -d --build

echo ⏳ Aguardando banco de dados iniciar (5s)...
timeout /t 5 /nobreak > NUL

echo 🐘 Instalando dependencias do backend...
docker exec task-manager-api composer install

echo 🔑 Gerando Application Key...
docker exec task-manager-api php artisan key:generate

echo 🗄️ Rodando migrations e inserindo dados de teste...
docker exec task-manager-api php artisan migrate --force --seed

echo ✅ Setup automatico finalizado com sucesso!
echo 🌐 Acesse o Frontend em: http://localhost:5173
echo 🌐 Acesse a API em: http://localhost:8000/api
pause

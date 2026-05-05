<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Projeto;
use App\Models\Tarefa;
use App\Models\Comentario;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criação de Projetos Realistas
        $projeto1 = Projeto::create([
            'nome' => 'App de Gestão Financeira', 
            'descricao' => 'Desenvolvimento do novo aplicativo mobile em React Native para controle de gastos corporativos.'
        ]);
        
        $projeto2 = Projeto::create([
            'nome' => 'E-commerce Black Friday 2026', 
            'descricao' => 'Preparação da infraestrutura e landing pages para a campanha de vendas anual.'
        ]);
        
        $projeto3 = Projeto::create([
            'nome' => 'Migração Cloud AWS', 
            'descricao' => 'Movimentação dos servidores locais para a arquitetura escalável da Amazon Web Services.'
        ]);

        // Tarefas - Projeto 1
        $t1 = Tarefa::create([
            'projeto_id' => $projeto1->id, 
            'titulo' => 'Prototipação UI/UX no Figma', 
            'descricao' => 'Criar protótipos de alta fidelidade para as telas de login e dashboard.', 
            'status' => 'concluida',
            'data_limite' => now()->addDays(2)
        ]);
        $t2 = Tarefa::create([
            'projeto_id' => $projeto1->id, 
            'titulo' => 'Integração com Gateway de Pagamento', 
            'descricao' => 'Implementar endpoints da API da Stripe e tratar webhooks.', 
            'status' => 'em_andamento',
            'data_limite' => now()->addDays(5)
        ]);
        $t3 = Tarefa::create([
            'projeto_id' => $projeto1->id, 
            'titulo' => 'Testes End-to-End (E2E)', 
            'descricao' => 'Escrever a suíte de testes automatizados utilizando Cypress e Jest.', 
            'status' => 'pendente',
            'data_limite' => now()->addDays(10)
        ]);

        // Comentários - Tarefa 2
        Comentario::create([
            'tarefa_id' => $t2->id, 
            'autor' => 'Luiz Melo',
            'texto' => 'O webhook da Stripe está falhando no ambiente de homologação. O log indica "Invalid Signature".'
        ]);
        Comentario::create([
            'tarefa_id' => $t2->id, 
            'autor' => 'Sistema',
            'texto' => 'Atualizei a variável STRIPE_SECRET_KEY no .env, agora está retornando 200 OK. Vou seguir com os testes unitários.'
        ]);

        // Tarefas - Projeto 2
        Tarefa::create([
            'projeto_id' => $projeto2->id, 
            'titulo' => 'Otimização de Imagens', 
            'descricao' => 'Converter todos os banners antigos para WebP para melhorar o LCP e SEO.', 
            'status' => 'concluida',
            'data_limite' => now()->subDays(1)
        ]);
        Tarefa::create([
            'projeto_id' => $projeto2->id, 
            'titulo' => 'Configurar Cache no Redis', 
            'descricao' => 'Implementar cache de 15 minutos para a vitrine de produtos e reduzir carga no banco de dados.', 
            'status' => 'pendente',
            'data_limite' => now()->addDays(4)
        ]);
        Tarefa::create([
            'projeto_id' => $projeto2->id, 
            'titulo' => 'Disparo de E-mail Marketing', 
            'descricao' => 'Segmentar base de clientes inativos e criar funil de recuperação de carrinho.', 
            'status' => 'em_andamento',
            'data_limite' => now()->addDays(2)
        ]);

        // Tarefas - Projeto 3
        Tarefa::create([
            'projeto_id' => $projeto3->id, 
            'titulo' => 'Setup do Kubernetes', 
            'descricao' => 'Criar os manifestos YAML para os deployments da API e do Worker.', 
            'status' => 'em_andamento',
            'data_limite' => now()->addDays(7)
        ]);
        Tarefa::create([
            'projeto_id' => $projeto3->id, 
            'titulo' => 'Dump do Banco de Dados', 
            'descricao' => 'Exportar a base de produção (PostgreSQL) usando o pg_dump para migração noturna.', 
            'status' => 'pendente',
            'data_limite' => now()->addDays(1)
        ]);
    }
}

# Respostas - Prova Teórica

### Questão 1 — Arquitetura e Service Layer
**Pergunta:** No Sistema, o backend utiliza um padrão com Controllers, Services e Models. Explique o papel de cada camada e por que evitamos colocar lógica de negócio diretamente no Controller. Mostre com pseudocódigo como ficaria.

**Resposta:**
No padrão em camadas utilizado:
- **Models:** Responsáveis por representar a estrutura de dados (tabelas do banco) e seus relacionamentos. Não devem conter regras de negócio complexas, apenas definições de escopo e relacionamentos.
- **Controllers:** Devem atuar apenas como o "ponto de entrada" (interface) da requisição HTTP. Sua única responsabilidade é receber o Request, validá-lo (geralmente via FormRequest), repassar os dados validados para o Service Layer, e retornar uma Response (JSON) padronizada para o cliente.
- **Services (Service Layer):** Aqui reside toda a lógica de negócio pesada, regras de validação complexas, integrações e orquestrações de múltiplas models.

Evitamos colocar lógica de negócio no Controller para garantir a **reusabilidade** (um Service pode ser chamado por um Controller Web, por uma rotina CLI/Job ou outro Service) e manter a **testabilidade** (é muito mais fácil testar um Service de forma unitária do que um Controller que depende do ciclo de vida HTTP).

*Pseudocódigo:*
```php
// Ruim: Lógica no Controller
public function store(Request $request) {
    if ($projeto->status === 'inativo') return error();
    // envia email, salva no banco...
}

// Bom: Controller limpo
public function store(StoreTarefaRequest $request, TarefaService $service) {
    $tarefa = $service->criarTarefa($request->validated());
    return response()->json($tarefa);
}
```

### Questão 2 — [Título da Questão Omitida no Enunciado]
**Resposta:**
*(Insira a resposta da questão 2 aqui)*

### Questão 3 — [Título da Questão Omitida no Enunciado]
**Resposta:**
*(Insira a resposta da questão 3 aqui)*

### Questão 4 — [Título da Questão Omitida no Enunciado]
**Resposta:**
*(Insira a resposta da questão 4 aqui)*

### Questão 5 — [Título da Questão Omitida no Enunciado]
**Resposta:**
*(Insira a resposta da questão 5 aqui)*

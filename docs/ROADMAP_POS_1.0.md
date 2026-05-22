# Ideias para evolução do OmniWS (não vinculadas a nenhum vídeo)

> **Nota de correção:** Esta lista é **independente** de qualquer vídeo, curso ou palestra externa. Itens aqui são **sugestões técnicas genéricas** para evolução do produto após a v1.0.0 — não promessas nem conteúdo inferido de mídia de terceiros.

**Versão atual:** 1.0.0 (fases 1–9 concluídas)  
**Regra:** Nenhum item abaixo entra em produção sem autorização explícita do usuário (R1).

---

## Priorização sugerida

| # | Item | Esforço | Impacto | Dependência |
|---|------|---------|--------|-------------|
| 1 | Limite WIP (ex.: máx. 3 tarefas ativas) | Baixo | Alto | UI + contador no GTD |
| 2 | Campo obrigatório "próxima ação física" | Baixo | Alto | Validação SQLite + form |
| 3 | Relatório semanal JSON/PDF | Baixo | Médio | Export tarefas + audit_log |
| 4 | Notificações nativas do SO | Baixo | Médio | `Notification` API + permissões |
| 5 | Atalho global (app minimizado) | Médio | Alto | `globalShortcut` no main |
| 6 | Tela triagem: Fazer hoje / Delegar / Arquivar | Médio | Alto | Schema `status` + view |
| 7 | Tags @contexto / energia | Médio | Médio | Tabela tags + filtros |

---

## Detalhe por item

### 1. Limite WIP

- Bloquear ou avisar ao tentar 4ª tarefa "ativa"
- Barra visual "2/3 em progresso"
- Respeitar FOCO: não notificar proativamente (R3)

### 2. Próxima ação física

- Campo obrigatório ao criar/editar tarefa
- Ex.: "Abrir arquivo X e revisar parágrafo 2" em vez de "Projeto Y"

### 3. Relatório semanal

- Botão "Exportar semana"
- Inclui: tarefas concluídas, pomodoros, propostas autorizadas/recusadas
- Formato: JSON + PDF opcional

### 4. Notificações nativas

- Pomodoro terminou → notificação SO (fora do FOCO)
- Nova proposta → opcional, configurável (R5 desligável)

### 5. Atalho global

- Ex.: `Ctrl+Shift+O` abre mini-captura mesmo com app minimizado
- Registrar/remover no `app.on('will-quit')`

### 6. Triagem GTD

- Estados: `inbox` | `hoje` | `delegar` | `arquivar`
- Vista kanban ou lista filtrada

### 7. Tags

- `@computer`, `@casa`, energia `alta|baixa`
- Filtro no GTD e sugestão na sondagem

---

## Fora de escopo imediato

- Login multiusuário / nuvem obrigatória
- Instalação automática via winget sem Caixa de Propostas
- IA proativa durante FOCO (viola R3)

---

## Como solicitar implementação

Mensagem sugerida ao agente/desenvolvedor:

> Autorizo Fase 10: implementar itens **1 e 2** deste roadmap.

Ou:

> Autorizo Fase 10 conforme itens listados acima.

---

## Referência cruzada

- Palestra (sem vídeo): `docs/PALESTRA.md`
- Primeiros passos: `docs/PRIMEIROS_10_MINUTOS.md`
- Métricas: `docs/METRICAS_10_10.md`

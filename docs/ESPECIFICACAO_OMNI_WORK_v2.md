# Especificação de Produto — Omni Work Station

**Versão do documento:** 2.0  
**Baseline de código:** 1.0.0  
**Status:** v1.0.0 entregue; v1.5 em definição para fechar visão de estação  
**Substitui como base oficial:** `Omni-Analyst .md.txt` (mantido só como histórico)  
**Última revisão:** 2026-05-22  

---

## Consenso de escopo

| Camada | Definição |
|--------|-----------|
| **v1.0.0 (entregue)** | MVP técnico operacional — uso diário possível hoje |
| **v1.5 (próximo MVP de produto)** | Login local, shell fullscreen, launcher como entrada, notas como módulo, políticas de automação, executor pós-autorização |
| **v2+** | Memória avançada, sync, UX assistente ampliada — **sem agente irrestrito** |

**winget:** adaptador de ambiente (inventário, sugestão, execução só após política + R1). **Não** é agente conversacional.

---

## 1. Visão do produto

A **Omni Work Station** é uma estação de trabalho **desktop local** (Windows-first) que unifica **organização do trabalho** (GTD), **execução com foco** (Pomodoro), **acesso rápido** a apps/sites (launcher) e **governança do ambiente** (descoberta via winget), com **automações e IA sempre subordinadas a políticas e autorização humana**.

Não é um chatbot genérico. Não é um clone do winget com interface. Não é, no MVP, um agente autônomo irrestrito no estilo “Claude Desktop sem limites”.

---

## 2. Problema que resolve

Profissionais que trabalham no PC dispersam atividade entre: tarefas, timer, terminal/instaladores, navegador, editores e IA em janelas separadas. Isso gera:

- Troca de contexto e fadiga de decisão
- Ferramentas ausentes interrompendo o fluxo
- Risco de automação/IA agir sem consentimento
- Perda de registro do que foi feito e do que foi recusado

---

## 3. Usuário principal

**Operador de conhecimento no Windows** — desenvolvedor, analista, gestor técnico ou criador solo — que:

- Trabalha longas sessões no mesmo PC
- Quer controle explícito sobre instalações e mudanças no ambiente
- Aceita IA local **opcional**, não obrigatória
- Prioriza foco protegido durante blocos de trabalho

Usuário secundário (fase futura): equipe pequena com sync — **fora do MVP**.

---

## 4. Objetivos do sistema

| ID | Objetivo | Medição |
|----|----------|---------|
| O1 | Reduzir troca de contexto entre tarefa, timer e ferramentas | Tempo até iniciar Pomodoro com tarefa < 2 min após abrir estação |
| O2 | Garantir que ações sensíveis exijam autorização | 100% instalações via fluxo de proposta + audit_log |
| O3 | Proteger foco durante Pomodoro | Zero sondagem/inventário proativo em estado Foco |
| O4 | Tornar ambiente legível | Inventário winget consultável; ausências geram proposta, não install silencioso |
| O5 | Manter operação local e auditável | Dados em SQLite; logs locais rotativos |

---

## 5. Escopo do MVP

### 5.1 MVP v1.0.0 (entregue — baseline oficial)

| Capacidade | Descrição |
|------------|-----------|
| Dashboard operacional | Pomodoro, GTD (lista), launcher, OmniScript, ambiente, header de modos |
| Modos | FOCO, FLEX, APRENDIZADO |
| GTD mínimo | CRUD tarefas, associar Pomodoro, concluir/remover |
| Pomodoro | 25 min, pausa, reset, vínculo com tarefa |
| OmniScript | Chat IA (Ollama opcional); buffer em FOCO |
| Motor de ambiente | Inventário winget; sugerir instalação → proposta |
| Centro de autorização | Caixa de Propostas; autorizar/recusar/agendar/recusar sempre |
| IA operacional limitada | Resposta reativa; sondagem RSS em fontes curadas; stream observável; pausável (R5) |
| Multitela | Segunda janela sincronizada (R6) |
| Segurança R1–R6 | Implementadas conforme regras do projeto |
| Polimento | Tray, tema, atalhos, verificador, build NSIS, docs de uso |

### 5.2 MVP v1.5 (próximo — fecha a visão “estação”)

| Capacidade | Descrição |
|------------|-----------|
| Tela de login local | Usuário/sessão local (sem nuvem obrigatória) |
| Shell fullscreen | Modo estação como padrão (saída explícita) |
| Launcher central | Primeira superfície após login |
| Widget de notas inteligentes | Entidade `Nota` persistente; vínculo opcional a tarefa/Pomodoro |
| Workspace | Perfil de contexto (apps, tema, regras) |
| Políticas de automação | Whitelist; níveis sugerir / confirmar / proibido |
| Executor local | Único módulo que dispara `exec`/`winget` após política + autorização |

**v1.5 não inclui:** agente irrestrito, sync multiusuário, instalação silenciosa em massa.

---

## 6. Fora do MVP

- Login SSO / nuvem obrigatória
- Agente com acesso irrestrito a arquivos, shell e rede
- winget como “IA” ou interface conversacional de pacotes
- Instalação automática sem confirmação (exceto política futura opt-in para pacotes pré-aprovados)
- GTD completo (projetos, delegação, revisão semanal automatizada)
- Atalho global sistema (app minimizado)
- Memória de decisões com ML/decaimento
- Sync entre máquinas
- macOS/Linux como alvo primário

**Inspiração Claude Desktop:** referência de UX (painel lateral, continuidade) — **fase 3+**, sempre com executor limitado e Caixa de Propostas.

---

## 7. Arquitetura lógica do sistema

```
┌──────────────────────────────────────────────────────────────────┐
│              Interface da estação (React / Electron Renderer)     │
│  Login* | Launcher* | Dashboard | Notas* | GTD | Pomodoro | ...   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ IPC
┌────────────────────────────▼─────────────────────────────────────┐
│                    Orquestrador da aplicação (Main)               │
│  Estados globais | Sessão* | Modos FOCO/FLEX/APRENDIZADO | Timer  │
└─┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┘
  │          │          │          │          │          │
  ▼          ▼          ▼          ▼          ▼          ▼
Motor de   Motor de    Motor de    Motor de    Assistente  Executor
contexto*  produtiv.   organização ambiente    operacional local
           (Pomodoro)  (GTD)      + Adaptador (IA+sonda)  (winget/exec)
           │          │          │  winget    │          │
           └──────────┴──────────┴────────────┴──────────┘
                             │
                    Persistência local (SQLite)
                    Logs (electron-log, audit_log)
                             │
                    Sincronização opcional* (futuro)
```

\* Login, Launcher central, Notas, Workspace, Sync = v1.5+

### 7.1 Responsabilidades por camada

| Camada | Responsabilidade | Não faz |
|--------|------------------|---------|
| Interface | Renderizar, capturar intenção do usuário | Executar winget diretamente |
| Orquestrador | Estado, transições, IPC, janelas, tray | Decidir instalar sozinho |
| Motor de contexto | Workspace ativo, modo, tarefa corrente | Buscar RSS |
| Motor de produtividade | Pomodoro, pausas, eventos de ciclo | Editar tarefas GTD |
| Motor de organização | Tarefas, inbox, status | Chamar IA |
| Motor de ambiente | Inventário, comparar esperado vs instalado | Instalar sem autorização |
| Adaptador winget | `winget list`, parse, timeout | Interpretar linguagem natural |
| Assistente operacional | Ollama, buffer FOCO, sondagem→proposta | Executar ações no SO |
| Executor local | Rodar comando aprovado, registrar resultado | Criar propostas |
| Persistência | SQLite, config (electron-store) | — |

---

## 8. Módulos principais

| ID | Módulo | v1.0 | v1.5 | Função |
|----|--------|------|------|--------|
| M1 | Interface / Shell | Parcial | Completo | UI, fullscreen*, login* |
| M2 | Orquestrador | Implícito em `index.ts` | Explícito | Estado, IPC, janelas |
| M3 | Motor de contexto | Modo+tarefa | +Workspace | Contexto ativo |
| M4 | Motor de produtividade | Sim | Sim | Pomodoro |
| M5 | Motor de organização | Sim (GTD simples) | Sim | Tarefas/inbox |
| M6 | Motor de ambiente | Sim | Sim + políticas | Inventário |
| M7 | Adaptador winget | Sim | Sim | CLI winget isolado |
| M8 | Assistente operacional | Sim | Sim | IA reativa + sondagem |
| M9 | OmniScript / Notas | OmniScript | +Widget Notas | Captura e chat |
| M10 | Centro de autorização | Sim | Sim | Propostas + audit |
| M11 | Executor local | Manual (alert comando) | Policy-based | Exec pós-OK |
| M12 | Multitela | Sim | Sim | Segunda janela |
| M13 | Memória de decisões | Mínima | Avançada | Filtrar sugestões |

---

## 9. Fluxo principal

```
[Entrada na estação]
        │
        ▼
   (v1.5) Login ──► Launcher / Dashboard
        │
        ▼
 Captura ──► Inbox (nova tarefa ou nota vinculada*)
        │
        ▼
 Escolha ──► Usuário seleciona próxima ação
        │
        ▼
 Pomodoro ► ▶ na tarefa → estado FOCO + timer 25:00
        │
        ├──► Execução: trabalho no PC (apps via launcher)
        ├──► Anotações OmniScript (buffer, sem interrupção)
        └──► Inventário/sondagem PAUSADOS (R3)
        │
        ▼
 Término Pomodoro ──► processar buffer IA (se houver)
        │
        ▼
 Registro ──► conversas salvas; tarefa pode ser concluída
        │
        ▼
 Revisão ──► Caixa de Propostas (autorizar/recusar/agendar)
        └──► audit_log consultável
```

---

## 10. Tela de login (v1.5)

| Requisito | Detalhe |
|-----------|---------|
| Autenticação | Local: PIN ou perfil simples |
| Sessão | Entidade `Sessão` com início/fim, workspace padrão |
| Falha | 3 tentativas → estado Bloqueada temporário |
| Offline | Funciona sem rede |

**v1.0.0:** login ausente — limitação conhecida.

---

## 11. Launcher central

| v1.0 | v1.5 |
|------|------|
| Grid fixo no dashboard | Tela/rota principal pós-login |
| Paths hardcoded | Configurável por workspace |

---

## 12. Widget de notas inteligentes

| v1.0 (substituto) | v1.5 (alvo) |
|-------------------|-------------|
| OmniScript + `anotacoes_buffer` | Entidade `Nota` com corpo, tags, `tarefa_id` |
| Buffer só em FOCO | Widget visível; regras por modo |

Em FOCO: notas em fila. Em FLEX: pode sugerir tarefa via **proposta**, não ação automática.

---

## 13. Motor de ambiente e winget

### 13.1 Motor de ambiente

1. Catálogo **esperado** de ferramentas
2. Consulta **Adaptador winget**
3. Classifica: instalada / ausente / desconhecida
4. Ausente → **proposta** — nunca install direto (v1.0)

### 13.2 Adaptador winget (não é agente)

| Operação | MVP | Quem decide |
|----------|-----|-------------|
| `winget list` | Sim | Motor de ambiente |
| `winget install` | Só pós-R1 | Usuário + Executor |
| NL → winget | Não | — |

**Timeout:** 60s; falha → Erro recuperável + UI.

---

## 14. Assistente operacional — limites

| Capacidade | Limite |
|------------|--------|
| Conversa (Ollama) | Local; offline = mensagem clara |
| Sondagem RSS | Lista branca (R2); ~4h; gera propostas |
| Durante FOCO | Sem resposta imediata; sem proposta proativa (R3) |
| Stream | Observabilidade; pausável (R5) |
| Ações no SO | Proibido no MVP |
| Claude Desktop | Inspiração UX futura; não permissões irrestritas |

---

## 15. Políticas de automação e segurança (R1–R6)

| Regra | v1.0 |
|-------|------|
| R1 | Propostas antes de install/comando |
| R2 | Fontes curadas em sondagem |
| R3 | FOCO pausa inventário e IA reativa |
| R4 | `audit_log` |
| R5 | Toggle sondagem |
| R6 | Segunda tela só por botão |

### Política v1.5 (formalizada)

| Nível | Comportamento |
|-------|---------------|
| P0 Proibido | Fora da whitelist |
| P1 Sugerir | Proposta (padrão v1.0) |
| P2 Confirmar | Caixa + diálogo |
| P3 Pré-aprovado | Opt-in futuro |

---

## 16. Estados do sistema

| Estado | Significado |
|--------|-------------|
| Bloqueada | Sem sessão / login falhou |
| Pronta | Logado, sem Pomodoro |
| Planejamento | Organizando tarefas/notas |
| Foco | Pomodoro + modo FOCO |
| Execução | Trabalho no PC (subestado de Foco) |
| Manutenção | Inventário, propostas (não em Foco) |
| Erro | winget/IA/DB falhou |
| Recuperação | Retry / fallback manual |

**Modos:** FLEX, FOCO, APRENDIZADO — comportamento da IA.

---

## 17. Entidades de dados

| Entidade | v1.0 |
|----------|------|
| Usuário, Sessão, Workspace | Futuro |
| Tarefa | Sim |
| Bloco de foco | Implícito no timer |
| Nota | Buffer parcial |
| Ferramenta | Inventário em memória |
| Proposta | Sim |
| Regra (R1–R6) | Código + docs |
| Evento (audit_log) | Sim |
| Política automação | v1.5 |
| Conversa IA | Sim |

---

## 18. Fluxos de erro

| Falha | Resposta |
|-------|----------|
| winget ausente | Verificador amarelo; sem propostas install |
| winget timeout | Log + retry manual |
| Ollama offline | Banner + instrução |
| DB erro | Erro + reiniciar |
| Multitela desync | Reabrir 2ª tela |
| Exec proposta falha | audit_log + alert manual |

---

## 19. Requisitos não funcionais

Segurança (R1–R6), confiabilidade (meta 8h), performance (UI + winget < 60s), usabilidade (`PRIMEIROS_10_MINUTOS.md`), observabilidade (logs + audit), manutenibilidade (módulos main separados), recuperação sem crash total, clareza de modo FOCO/FLEX.

---

## 20. Critérios de aceitação (estilo Dado/Quando/Então)

### GTD

- **Dado** inbox **Quando** Enter em nova tarefa **Então** persiste após reinício
- **Dado** tarefa pendente **Quando** ✅ **Então** `concluida = 1`

### Pomodoro

- **Dado** tarefa **Quando** ▶ **Então** 25:00, FOCO, título visível
- **Dado** FOCO ativo **Quando** timer = 0 **Então** notificação + buffer processado

### Ambiente + winget

- **Dado** winget OK **Quando** Atualizar fora de FOCO **Então** listas em < 60s
- **Dado** ausente **Quando** Sugerir Instalação **Então** proposta pendente; sem install auto

### Autorização

- **Dado** proposta install **Quando** autorizar **Então** comando exibido (v1.0) ou executor (v1.5) + audit_log

### IA

- **Dado** FLEX + Ollama **Quando** pergunta **Então** resposta ou erro claro
- **Dado** FOCO **Quando** texto **Então** buffer; sem resposta imediata
- **Dado** sondagem pausada **Quando** 4h **Então** sem ciclo RSS

### Multitela

- **Dado** Pomodoro ativo **Quando** Segunda Tela **Então** sync em < 1s

### Login (v1.5)

- **Dado** app fechado **Quando** abrir **Então** login antes do dashboard

---

## 21. Roadmap por fases

| Fase | Status | Entrega |
|------|--------|---------|
| 1–9 | ✅ | v1.0.0 atual |
| 10 | Planejada | v1.5: login, fullscreen, notas, executor, políticas |
| 11 | Planejada | GTD ampliado (`ROADMAP_POS_1.0.md`) |
| 12 | Planejada | Ambiente + whitelist |
| 13 | Planejada | Memória de decisões |
| 14 | Planejada | UX assistente com limites |
| 15 | Futura | Sync opcional |

---

## 22. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Escopo v1.5 inflar | Gate: login + fullscreen + notas + executor |
| winget inconsistente | Timeout, manual, verificador |
| Confusão IA = agente | Copy: “assistente operacional” |
| Docs desatualizados | Este arquivo + `DIARIO.md` |

---

## 23. Métricas de sucesso

| Métrica | Alvo |
|---------|------|
| Abertura → Pomodoro | < 2 min |
| Conclusão Pomodoros iniciados | > 85% |
| Propostas autorizadas / total | > 60% |
| winget sem crash | 100% |
| Sessão estável | 8h |
| Satisfação 1–5 | > 4.2 |

---

## 24. Stack

Electron + TypeScript, React, Tailwind, better-sqlite3, Ollama (opcional), node-schedule, RSS, electron-builder, electron-log, electron-store.

---

## 25. Documentos relacionados

| Arquivo | Uso |
|---------|-----|
| `DIARIO.md` | Progresso de fases |
| `docs/GUIA_DE_USO.md` | Operação v1.0 |
| `docs/ROADMAP_POS_1.0.md` | Ideias pós-1.0 |
| `docs/DIAGNOSTICO_SPEC_v2.md` | Diagnóstico da spec anterior |
| `.cursor/rules/omniws-project.mdc` | R1–R6 para agentes |

---

*Especificação oficial v2.0 — Omni Work Station*

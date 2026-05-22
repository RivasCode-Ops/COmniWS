# Palestra — Omni Work Station: Um Sistema de Produtividade que Pede Permissão

> **Nota de correção:** Este roteiro **não** descreve nem atribui conteúdo a nenhum vídeo ou curso externo. O material do vídeo original **não foi analisado** aqui. A palestra foca apenas no que o **OmniWS v1.0.0** já entrega hoje.

**Duração:** 30 min (25 min apresentação + 5 min perguntas)  
**Versão do app:** 1.0.0  
**Comando demo:** `npm run dev` em `C:\_PROJETOS\COmniWS`

---

## Mensagem central

> O Omni Work Station não decide por você. Ele coleta, propõe e executa foco — sempre com sua autorização.

**Transição para o slide 6:**

> Isso é o que o OmniWS já faz hoje. O que pode vir depois são **ideias de evolução do produto** — não prometidas, não ligadas a nenhum vídeo — e só com sua autorização explícita (R1).

---

## Slide 1 — O problema (2 min)

**Fala sugerida:**

Hoje a produtividade está espalhada: um app de tarefas, outro de timer, planilha, assistente de IA em outra aba. Nada pergunta antes de instalar, notificar ou interromper. O resultado é troca de contexto e fadiga de decisão.

**Demo:** Não.

---

## Slide 2 — A solução em três passos (3 min)

**Fala sugerida:**

O OmniWS 1.0 organiza o fluxo em três passos:

1. **Coletar** — inbox GTD + OmniScript (captura sem sair da estação)
2. **Revisar** — Caixa de Propostas (autorizar, recusar, agendar, recusar para sempre)
3. **Executar** — Pomodoro com modo FOCO (IA silenciosa, zero notificação proativa)

**Demo:** Não.

---

## Slide 3 — Demo 1: Coleta rápida (3 min)

**Fala sugerida:**

A captura precisa ser mais rápida que abrir cinco apps. No OmniWS, você adiciona tarefa no GTD ou escreve no OmniScript.

**Gatilhos ao vivo:**

| Ação | Como |
|------|------|
| Nova tarefa GTD | Coluna 📋 → digite → Enter ou **+** |
| Foco no OmniScript | **Ctrl+Shift+F** |
| Abrir propostas | **Ctrl+Shift+P** |

**Fala durante demo:**

*Neste momento, adiciono "Preparar apresentação OmniWS" na inbox e uso Ctrl+Shift+F para ir direto ao campo de conversa.*

**Demo:** Sim.

---

## Slide 4 — Demo 2: Revisão e autorização (4 min)

**Fala sugerida:**

Nada instala sozinho. Quando o ambiente detecta ferramenta ausente, cria uma **proposta** — não executa. Você autoriza, recusa ou agenda.

**Gatilhos ao vivo:**

1. Clique **📦 Propostas** no header
2. Mostre proposta de instalação (se houver) ou explique o fluxo
3. **Autorizar** → mostra comando `winget install...` (você executa no terminal)
4. **Recusar** ou **Recusar sempre**
5. **📋 Ver Log** — audit_log imutável (R4)

**Fala durante demo:**

*A IA pode sugerir; o humano autoriza. Isso é a regra R1 do projeto.*

**Demo:** Sim.

---

## Slide 5 — Demo 3: Execução sem distração (4 min)

**Fala sugerida:**

Modo FOCO: Pomodoro ativo, IA em silêncio. Perguntas no OmniScript vão para **buffer** e são processadas depois.

**Gatilhos ao vivo:**

1. Na tarefa, clique **▶** (Pomodoro com tarefa associada)
2. Indicador **🎯 FOCO** no header
3. Digite anotação no OmniScript → mensagem de buffer
4. (Opcional) **🖥️ Segunda Tela** — timer sincronizado
5. (Opcional) **🧠 Acompanhar IA** — stream só se quiser ver sondagem (R5: pode pausar)

**Fala durante demo:**

*Durante FOCO, inventário winget pausa e notificações proativas não aparecem — regra R3.*

**Demo:** Sim.

---

## Slide 6 — O que o OmniWS já faz vs. ideias futuras (3 min)

**Fala sugerida:**

Esta palestra **não** resume um vídeo. Mostro o app real e, se quiser, menciono evoluções possíveis — são sugestões técnicas genéricas, **não** compromissos de roadmap.

**O que já está no OmniWS 1.0.0:**

| Capacidade | Status |
|------------|--------|
| Coleta (GTD inbox + OmniScript) | ✅ |
| Revisão com autorização (Caixa de Propostas) | ✅ |
| Foco (Pomodoro + modo FOCO + buffer IA) | ✅ |
| Inventário local (winget) | ✅ |
| IA local opcional (Ollama) | ✅ |
| Multitela sincronizada | ✅ |
| Logs e regras R1–R6 | ✅ |

**Ideias para evolução futura** (ver `ROADMAP_POS_1.0.md` — **não** vêm de vídeo):

- Atalho global, limite WIP, relatório semanal, triagem GTD ampliada, tags — só se **você** autorizar implementação.

**Demo:** Não.

---

## Slide 7 — Tecnologia (2 min)

**Fala sugerida:**

- **Electron + React + TypeScript** — desktop Windows-first
- **SQLite** — tarefas, conversas, propostas, audit_log local
- **Ollama** — IA local (opcional, Llama 3.2 3B)
- **winget** — inventário e propostas de instalação
- **Build:** `npm run dist:win` → instalador NSIS

**Demo:** Não (ou mostrar pasta `release/` se instalador já gerado).

---

## Slide 8 — Próximos passos (2 min)

**Fala sugerida:**

Ideias pós-1.0 (documento separado, sem vínculo com vídeo) só entram no produto com sua autorização explícita.

Ver `docs/ROADMAP_POS_1.0.md` no repositório.

**Demo:** Não.

---

## Slide 9 — Perguntas + repositório (5 min)

**Fala sugerida:**

- Repo: https://github.com/RivasCode-Ops/COmniWS
- Guia rápido: `docs/PRIMEIROS_10_MINUTOS.md`
- Métricas 10/10: `docs/METRICAS_10_10.md`

---

## Perguntas frequentes (respostas prontas)

| Pergunta | Resposta |
|----------|----------|
| Precisa de internet? | Não para o core. Sondagem RSS e Ollama usam rede/local configurado. |
| A IA instala programas? | Não. Só propõe; você autoriza na Caixa. |
| Funciona sem Ollama? | Sim. GTD, Pomodoro, propostas e inventário funcionam. |
| Dados na nuvem? | Não por padrão. SQLite em `%APPDATA%`. |
| Open source? | MIT — ver repositório. |

---

## Checklist pré-palestra

- [ ] `npm run dev` testado
- [ ] Ollama rodando (opcional, para demo IA)
- [ ] 1–2 propostas na caixa (sondagem ou sugerir instalação)
- [ ] Instalador gerado (`npm run dist:win`) se for distribuir
- [ ] Atalhos memorizados: Ctrl+Shift+F, Ctrl+Shift+P

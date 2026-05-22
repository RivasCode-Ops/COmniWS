# Diagnóstico — Spec Omni Work (revisão v2.0)

**Documento analisado:** `Omni-Analyst .md.txt`  
**Data:** 2026-05-22  
**Resultado:** Spec reescrita em `ESPECIFICACAO_OMNI_WORK_v2.md`

---

## Problemas identificados

1. **Desatualização:** status “Aguardando Fase 1” vs código v1.0.0 (fases 1–9 entregues).
2. **Scope creep:** login, fullscreen, widget de notas, memória ML prometidos como se existissem.
3. **winget mal posicionado:** risco de tratar CLI como agente inteligente.
4. **Agente ambíguo:** IA regenerativa + sondagem sem limites explícitos vs executor.
5. **Arquitetura incompleta:** faltavam orquestrador, executor, adaptador winget, entidades, estados, erros, aceite por módulo.
6. **GTD inflado:** “projetos” no texto vs lista plana no código.
7. **M9 memória:** marketing de “aprendizado” vs `recusado_sempre` + audit_log.
8. **Métricas 10/10:** sem instrumentação no produto.

## Pontos preservados

- R1–R6, Pomodoro + GTD + FOCO como centro, local-first, Caixa de Propostas, multitela, stack Electron/SQLite/Ollama.

## Consenso adotado

| Camada | Definição |
|--------|-----------|
| v1.0.0 | MVP operacional entregue |
| v1.5 | Login, fullscreen, launcher entrada, notas, políticas, executor |
| v2+ | Sync, memória avançada, UX assistente — sem agente irrestrito |

## Checklist rápido

**Fecha MVP v1.0:** GTD, Pomodoro, modos, propostas, winget inventário, IA limitada, multitela, R1–R6.

**Fase 2 (v1.5):** login, fullscreen, notas widget, executor policy-based.

**Não agora:** agente irrestrito, winget como IA, install silencioso em massa, sync obrigatório.

**Validar em uso:** 8h estável, latência multitela, aceitação de propostas, onboarding não técnico.

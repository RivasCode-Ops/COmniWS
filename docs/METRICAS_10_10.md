# Métricas 10/10 - Checklist de Validação

## Critérios Obrigatórios

- [x] **Foco sem interrupção** - Durante FOCO, IA não gera notificações proativas no chat
- [x] **IA propõe, não age** - Nenhuma instalação automática sem autorização
- [x] **Acompanhar/ignorar** - Botão "Acompanhar IA" mostra stream; sondagem pode ser pausada
- [x] **Multitela com contexto** - Segunda tela sincroniza timer/tarefa/modo
- [x] **Aprendizado por decisão** - Propostas recusadas permanecem no histórico (Fase 8)
- [x] **Local-first** - Funciona sem internet (exceto sondagem web)
- [x] **Configuração <10 min** - Ver `PRIMEIROS_10_MINUTOS.md`
- [ ] **8h sem travamento** - Executar teste de estresse manual

## Métricas Quantitativas

| Métrica | Alvo | Status |
|---------|------|--------|
| Login → Pomodoro | < 2 min | ⬜ Validar manualmente |
| Aceitação de propostas | > 60% | ⬜ Validar em uso real |
| Conclusão de Pomodoros | > 85% | ⬜ Validar em uso real |
| Latência multitela | < 50ms | ⬜ `npm run test:latencia` |
| Satisfação usuário (1-5) | > 4.2 | ⬜ Feedback do usuário |

## Como Validar

```powershell
cd C:\_PROJETOS\COmniWS

# Informações do teste de estresse (8h)
npm run test:stress

# Informações do teste de latência multitela
npm run test:latencia

# Gerar instalador Windows
npm run dist:win
```

# N4 e N5 — backlog técnico e critérios propostos

> Documento de planejamento, não homologação. O escopo preciso de N4/N5 deve ser confirmado por Daniel antes de mudanças comerciais, identidade visual ou publicação. **Daniel avalia e aprova as PRs.** Não confundir PR aberta com etapa concluída.

## Ponto de partida

N2 está consolidado; N3 segue pendente de evidências externas segundo [o gate N3](n3-gate.md). O README registra restrições sobre textos, serviços, WhatsApp, avaliações, identidade e metadados. O trabalho de N4 começa após a homologação do N3. O trabalho de N5 começa após a homologação do N4.

## N4 — Identidade e estratégia de conversão (escopo proposto)

| Prioridade | Entrega isolável | Verificação e evidência | Dependência |
| --- | --- | --- | --- |
| Alta | Inventário dos CTAs por localização, serviço, destino e tipo de evento | Todas as rotas de contato abrem e a origem registrada é coerente | Sem mudança de mensagens |
| Alta | Auditoria de jornada mobile e desktop | Capturas em 320/390/768/1440 px; teclado e zoom; sem obstrução dos CTAs | Inspeção real no navegador |
| Média | Diagnóstico de consistência visual e componentes reutilizáveis | Lista de divergências demonstráveis, com antes/depois em PR própria | Aprovação da direção visual |
| Média | Proposta de melhorias de hierarquia e conversão | Hipótese, mudança mínima, medição e plano de rollback | Aprovação de copy/identidade |
| Baixa | Instrumentação de funil sem identificação pessoal | Eventos permitidos, ausência de duplicação e auditoria de consentimento | N3 analytics homologado |

Não publicar métricas de conversão como se fossem agendamentos: cliques no WhatsApp medem intenção, não negócio fechado.

## N5 — Operação, manutenção e evolução (escopo proposto)

| Prioridade | Entrega isolável | Verificação e evidência | Dependência |
| --- | --- | --- | --- |
| Alta | Checklist de release e rollback para GitHub Pages | SHA, URLs HTTP, checks de assets, procedimento de `git revert` | N3 smoke e publicação |
| Alta | Mapa de manutenção e responsabilidade de conteúdo | Local de edição, riscos de regressão e validação da responsável | Revisão de dados comerciais |
| Média | Orçamento de performance com baseline real | Lighthouse mobile/desktop com SHA; diferenças documentadas | Medição em produção |
| Média | Política de revisão de terceiros e dependências | Scripts, permissões, atualização do Sass, privacidade e links | Revisão técnica |
| Baixa | Plano de observabilidade sem coleta excessiva | Métricas de operação e consentimento aprovadas | Avaliar necessidade e LGPD |

## Organização das PRs

1. Cada PR deve resolver uma hipótese verificável, ter testes/evidências, descrever risco e rollback.
2. Evitar PRs de N4/N5 que alterem conteúdo/identidade sem aprovação do escopo específico.
3. Se uma PR depender de outra, explicitar o número da PR bloqueadora no corpo; se não houver dependência, apontar diretamente para `master`.
4. Revisão de código e CI podem ser auxiliados por agentes, mas **aprovação e decisão de merge pertencem a Daniel**.

## Critério de conclusão

- **N4:** experiência e conversão aprovadas visualmente e funcionalmente, sem regressões e sem métricas enganosas.
- **N5:** operação e manutenção verificáveis por terceiro, publicação reproduzível, procedimentos de rollback testados e qualidade medida.
- Nenhuma etapa deve ser marcada como concluída enquanto faltar evidência obrigatória ou aprovação humana.

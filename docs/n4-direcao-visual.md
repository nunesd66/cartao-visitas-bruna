# Direção visual e design system do N4

**Estado.** Proposta para revisão da Bruna. Este documento registra a linguagem visual já implementada no `css/style.scss` e os critérios para evoluí-la. A direção, os novos usos de marca e os testes de conversão dependem de aprovação específica.

## Direção proposta

Preservar a combinação de verde escuro, marrom suave e superfícies claras. A tipografia serifada e as fotos originais dão destaque à profissional e ao trabalho. A ordem da página conduz da apresentação aos serviços e evidências, esclarece dúvidas e oferece agendamento e localização. A proposta é refinar esse percurso usando a linguagem existente.

| Fundamento | Implementação atual | Uso proposto |
| --- | --- | --- |
| Verde `#243a2e` e terracota `#874744` | `--color-primary` e `--color-primary-dark` | Verde para ação principal em fundo claro, terracota para ênfase e variação de interação conforme o componente. |
| Superfícies `#fbf7f2`, `#fffdfb` e `#f3e7df` | `--color-bg`, `--color-surface` e `--color-surface-soft` | Diferenciar blocos de conteúdo, cartões e fundos de suporte. |
| Texto `#352823` e `#6d5e57` | `--color-text` e `--color-text-muted` | Usar o tom escuro para leitura principal e verificar o contraste do texto secundário sobre cada superfície real. |
| Georgia e pilha sans-serif local | `--font-serif` e `--font-sans` | Serifada nos títulos e marca textual. Sans-serif no corpo, navegação e ações. |
| Raios de `0.5rem`, `0.875rem` e `1.5rem` | `--radius-sm`, `--radius-md` e `--radius-lg` | Reutilizar raios existentes em controles, cartões, imagens e painéis conforme o padrão local. |
| Largura máxima de `75rem` | `--container-max` e `.container` | Manter alinhamento entre blocos. Usar o espaço útil em tablet antes de introduzir colunas. |
| Fotografia | Retratos da Bruna, resultados de serviços e capturas de avaliações já presentes na página | Preservar arquivos originais e revisão de enquadramento em viewport real. Qualquer mudança visual nas fotos depende de aprovação. |

## Componentes e uso na jornada

| Componente | Papel na jornada | Critério de revisão |
| --- | --- | --- |
| Cabeçalho, navegação e hero | Identificar a profissional e dar acesso à primeira ação | Nome e CTA legíveis, link de salto utilizável e navegação por teclado antes e depois de recolher o cabeçalho. |
| Cartões de serviço e galeria | Ajudar a comparar serviços e escolher por onde iniciar contato | Fotos originais visíveis, texto preservado e CTA específico dentro do cartão correspondente. |
| Sobre, avaliações e FAQ | Sustentar a decisão e esclarecer dúvidas | Leitura confortável em tablet, controles com foco visível e navegação de avaliações operável com teclado e movimento reduzido. |
| Agendamento e localização | Entregar canais de contato e acesso ao endereço | Ação principal distinguível. Links externos mantêm destinos existentes e o mapa segue sob demanda. |
| Painel e acesso à privacidade | Permitir aceitar, recusar e rever a preferência | Ações acessíveis a 320 px, foco visível e opções utilizáveis em recusa, aceite e reabertura. |

## Backlog visual de revisão

1. **Validar as bases.** Registrar imagens de referência em 320, 390, 768 e 1440 px no mesmo SHA. Conferir início, serviços, sobre, avaliações, privacidade e contato. Registrar também navegação por teclado e zoom de 200% em área menor.
2. **Aprovar direção com a Bruna.** Revisar os estados mobile e desktop e obter decisão sobre paleta, tipografia, enquadramento, hierarquia e pontos de ação. Registrar data, pessoa responsável e link das referências aprovadas.
3. **Testar uma hipótese por alteração.** Exemplo para aprovação: em mobile, reforçar a visibilidade do CTA do hero pode aumentar a proporção de sessões consentidas com clique no WhatsApp. Revisar a experiência visual e a área útil em 320×568 antes de publicar. A conclusão depende da mensuração autorizada e de volume suficiente de dados. Clique é intenção de contato.
4. **Registrar critérios antes do próximo PR visual.** Conferir estados padrão, hover, foco visível, aberto/fechado e movimento reduzido quando aplicável. Comparar contraste, ausência de overflow horizontal e Lighthouse em condições equivalentes. Associar cada evidência a commit, navegador, viewport e data.

A decisão da profissional, o resultado da revisão visual e as evidências de conversão formam o aceite desta frente do N4. A operação de publicação, rollback e monitoramento pertence ao ciclo de manutenção do N5.

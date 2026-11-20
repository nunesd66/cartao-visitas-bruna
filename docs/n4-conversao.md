# N4 — Jornada de contato e estratégia de conversão

Objetivo: facilitar a escolha do serviço e o início de uma conversa pelo WhatsApp. A profissional valida o posicionamento, os caminhos prioritários e os ajustes comerciais. A mensuração depende da homologação de analytics e privacidade prevista no [gate do N3](n3-gate.md).

## Jornada atual

| Momento | Elementos da página | Evidência disponível |
| --- | --- | --- |
| Conhecer a proposta | Hero com chamada principal, navegação e apresentação da profissional | `page_view` após consentimento, como contexto de volume |
| Comparar serviços | Galerias e cards de micropigmentação, design, tintura e henna | `contact_intent` com `cta_location=service_card` e `service_name` para cliques nesses botões |
| Ganhar confiança | Resultados, depoimentos e links para fontes de avaliações | `contact_channel_click` com `cta_location=testimonial_source` para cliques nas fontes |
| Resolver dúvidas | FAQ e formulário de pergunta que abre o WhatsApp | `faq_open` com `faq_id` para perguntas abertas. O formulário não tem evento próprio |
| Escolher um canal | WhatsApp no cabeçalho, menu móvel, hero, cards, chamada final e botão flutuante. Telefone e rota na seção de contato | `contact_intent` para CTAs de WhatsApp e `contact_channel_click` para telefone e rota |

O site mede cliques nos pontos instrumentados. Conversas iniciadas e agendamentos confirmados acontecem fora da página e dependem de informação da profissional.

## Verificação técnica em 19/11/2026

No Chromium 140, em cópia local da revisão `92ef788a66dda1976d6abf780de30471f9fedd58`, a jornada foi exercitada em 320×568, 390×844, 768×1024 e 1440×900. Em cada tamanho, os quatro botões de serviços abriram o destino de WhatsApp esperado, com o serviço correspondente nos metadados do link. Também foram verificados a acionabilidade dos CTAs do início e do fim, o CTA do cabeçalho ou menu móvel, a ação de avaliação e a abertura do FAQ pelo teclado. Não houve overflow horizontal.

A navegação ao WhatsApp foi interceptada no navegador. O teste confirma os destinos configurados e o fluxo técnico, sem enviar mensagens ou eventos de teste ao GA4. A revisão visual com a Bruna, o teste de tarefa com participantes e a medição de conversão permanecem pendentes.

## Jornada em modo paisagem em 20/11/2026

Em HeadlessChrome 153.0.8010.0, a cópia de `d11e58db05a81dc902343186b4d3301b03dd29d2` foi verificada em **568 × 320** e **844 × 390**, com toque emulado. Os bytes do HTML, CSS, `main.js` e `privacy.js` da cópia conferiram com o [deploy público](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44605705990).

Nos dois tamanhos, o toque nos botões do menu móvel, da abertura e da chamada final levou ao WhatsApp configurado, com texto de origem correspondente. A página ficou sem rolagem horizontal. Escape fechou o menu e devolveu o foco ao controle de abertura. A navegação externa foi interceptada e nenhuma requisição foi enviada ao GA4. A validação técnica foi feita em emulação. O aceite visual e o teste com uma pessoa do público permanecem pendentes.

## Prioridades para validação

| Ordem | Hipótese | Como avaliar |
| --- | --- | --- |
| 1 | Deixar a chamada principal facilmente identificável em telas estreitas e com teclado reduz a dificuldade de iniciar contato | Em 320, 390, 768 e 1440 px, pedir que a pessoa encontre a chamada principal e chegue ao WhatsApp. Registrar se concluiu, em qual ponto houve dificuldade e se outros controles ficaram obstruídos. Uma vez homologado o GA4, acompanhar sessões com `contact_intent`, segmentadas por dispositivo e ponto de clique |
| 2 | Padronizar a hierarquia visual dos cards ajuda a comparar serviços e encontrar o botão de cada um | Pedir que a pessoa localize dois serviços, compare o conteúdo e escolha o CTA desejado. Verificar se imagens e texto seguem legíveis. Acompanhar `contact_intent` em `service_card`, com a distribuição por `service_name` como contexto |
| 3 | Facilitar a consulta de dúvidas e avaliações ajuda quem ainda está decidindo | Pedir que a pessoa encontre uma resposta e a fonte de uma avaliação e, em seguida, encontre um caminho de contato. Usar `faq_open` e `contact_channel_click` como sinais de uso dessas áreas |

Cada teste deve incluir navegação por teclado e preferências de movimento reduzido. Manter as fotos originais, os textos aprovados e os destinos dos CTAs durante os ajustes de hierarquia. Validar com a profissional qualquer proposta de mudar ordem comercial, promessa, oferta, texto ou identidade.

## Avaliação de mudanças publicadas

1. Registrar URL, commit, data, hipótese, mudança isolada e resultado do teste de tarefa. Aplicar o mesmo roteiro antes e depois da mudança.
2. Após a homologação de analytics, registrar uma janela de referência com contagem de sessões medidas e de sessões com ao menos um `contact_intent`. O indicador é a razão entre essas contagens, restrita a sessões observadas com consentimento. Cliques repetidos em uma sessão entram uma vez nessa razão. Usar contagens de eventos por `cta_location` e `service_name` para diagnóstico, quando as dimensões estiverem disponíveis.
3. Comparar com uma janela posterior de duração e origem de tráfego comparáveis. Registrar o volume e fatores que podem influenciar a comparação, como campanha, mudança de oferta ou alterações simultâneas no layout. Se a amostra não permitir uma conclusão, registrar o resultado como inconclusivo e usar o teste de tarefa para decidir o próximo ajuste.
4. Registrar a decisão de manter, corrigir ou reverter. Se a profissional já possuir uma contagem agregada de atendimentos ou agendamentos, usá-la como contexto, sem adicionar identificação individual ou conteúdo de mensagens ao analytics.

O aceite desta frente exige aprovação do mapa de jornada e da hipótese prioritária, evidência do caminho de contato no navegador e um método de medição revisado com a profissional. Resultados de conversão ficam pendentes até a coleta estar homologada e haver uma janela observada.

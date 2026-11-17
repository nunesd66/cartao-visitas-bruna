# Bruna Eduarda Beauty

Landing page estática para apresentar os serviços de design e micropigmentação de sobrancelhas da Bruna Eduarda Beauty, em Coromandel, MG. O principal caminho de conversão é o agendamento pelo WhatsApp.

## Abrir o projeto

- **Ver no navegador local:** [abra `index.html`](index.html) ou abra esse arquivo diretamente no navegador.
- **Repositório:** [github.com/nunesd66/cartao-visitas-bruna](https://github.com/nunesd66/cartao-visitas-bruna)
- **Site publicado:** [nunesd66.github.io/cartao-visitas-bruna](https://nunesd66.github.io/cartao-visitas-bruna/). A branch `master` é publicada pelo GitHub Pages; esta branch de preparação não altera o site público.

## Prévia

Capturas da versão atual, feitas localmente em 17/11/2026:

| Desktop · 1440 px | Celular · 390 px |
| --- | --- |
| ![Prévia do site em desktop](docs/screenshots/desktop-visao-geral.png) | ![Prévia do site em celular](docs/screenshots/mobile-visao-geral.png) |

[Ver captura completa da página em desktop](docs/screenshots/desktop.png)

## O que a página apresenta

- Hero com chamada para agendamento.
- Serviços de micropigmentação, design de sobrancelhas, tintura e henna.
- Casos reais, apresentação da profissional e avaliações de clientes.
- Perguntas frequentes, chamada final, localização e canais de contato.
- Navegação acessível por teclado, menu móvel e controles do carrossel de depoimentos.

## Tecnologias e estrutura

Projeto sem framework ou dependências de runtime. O HTML é semântico, os estilos são escritos em SCSS e servidos pelo CSS compilado; o JavaScript vanilla é usado para interações progressivas.

```text
.
├── index.html                 # Conteúdo e estrutura da página
├── css/
│   ├── style.scss              # Fonte dos estilos e variáveis de tema
│   └── style.css               # CSS compilado, carregado pelo HTML
├── js/
│   └── main.js                 # Menu, FAQ, parallax e carrossel
├── images/                     # Fotos, resultados e avaliações
└── docs/
    └── screenshots/            # Capturas usadas nesta documentação
```

### Executar e desenvolver

Não é necessário instalar pacotes para abrir a página. Para uma prévia local, abra `index.html`. Se preferir servir por HTTP, na raiz do projeto execute:

```bash
python -m http.server 8080
```

Depois acesse <http://localhost:8080>.

Para compilar os estilos, é necessário ter Node.js `>=20.19.0` e npm. O requisito mínimo decorre da versão travada de `sass` (`1.108.2`) no `package-lock.json`; essa dependência é apenas de desenvolvimento. Instale as versões travadas e compile o SCSS assim:

```bash
npm ci
npm run build:css
```

Ao alterar os estilos, edite `css/style.scss` e gere novamente `css/style.css` com a versão de Sass travada no lockfile:

```bash
npm ci
npm run build:css
```

O `index.html` referencia `css/style.css`; mudanças apenas no SCSS não aparecem no navegador até a compilação. Sass é dependência apenas de desenvolvimento; a página publicada é estática e não precisa de npm ou Node em runtime.

### SEO e publicação

O HTML define canonical, Open Graph e JSON-LD com informações já exibidas na página. `robots.txt` e `sitemap.xml` devem estar na raiz publicada para responder em `/robots.txt` e `/sitemap.xml`. Não há favicon de marca aprovado; não crie um ícone provisório.

Antes de publicar, revise os arquivos do diff, execute `npm run build:css`, confira os links/URLs e acompanhe o workflow **pages build and deployment** em GitHub Actions. Após o deploy, valide HTTP 200 para a página, CSS, JS, imagens, robots e sitemap; repita Lighthouse mobile/desktop. Analytics permanece desligado sem um Measurement ID real e decisão de privacidade/consentimento.

Para reverter um deploy defeituoso, crie um novo commit com `git revert <sha-do-commit-de-publicação>` e confirme o novo workflow de Pages. A tag `backup-2026-11-16` é uma referência histórica anterior a alterações aprovadas depois de 16/11; não mova `master` diretamente para ela nem use force-push.

## Evolução do repositório

O gráfico abaixo resume os **19 commits** existentes no histórico local até 17/11/2026. Ele mostra a atividade por data, não uma medida de qualidade ou de funcionalidades.

![Commits por data](docs/evolucao-commits.svg)

| Data | Commits | Marco |
| --- | ---: | --- |
| 08/09/2026 | 1 | Primeiro esboço da landing page |
| 16/11/2026 | 17 | Conteúdo, responsividade, casos reais, acessibilidade e refinamentos visuais |
| 17/11/2026 | 1 | Ícones na navegação do rodapé |

## Conteúdo a revisar antes de publicar

Confirme textos, telefone e links de agendamento, endereço e horário de atendimento. As informações de contato ficam no `index.html`; imagens e textos também podem ser substituídos diretamente no HTML. A publicação em domínio ou serviço de hospedagem ainda não faz parte deste projeto.

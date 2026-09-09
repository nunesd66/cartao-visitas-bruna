# Landing page — Bruna Monteiro

Landing page estática, responsiva e orientada a conversão para uma profissional fictícia de design de sobrancelhas e micropigmentação.

O projeto foi construído apenas com HTML5 semântico e CSS gerado a partir de SCSS. Não há framework, fonte externa, tracker, backend ou dependência de JavaScript. A navegação mobile e o FAQ usam elementos HTML nativos e continuam funcionando com JavaScript desativado.

## Estrutura

```text
/
├── index.html
├── css/
│   ├── style.scss
│   └── style.css
├── images/
│   ├── hero-bruna-placeholder.jpg
│   ├── bruna-profissional-placeholder-v2.jpg
│   └── resultado-*-placeholder.jpg
└── README.md
```

O arquivo `mockup_de_beleza_e_guia_de_implementação.png` foi usado somente como referência visual. Ele não é carregado nem referenciado pelo site.

## Como executar localmente

### Opção 1 — abrir diretamente

Abra o arquivo `index.html` no navegador. Todo o conteúdo funciona também pelo protocolo local `file://`.

### Opção 2 — servidor local simples

Se tiver Python instalado, execute na raiz do projeto:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

Também é possível usar uma extensão de servidor local do editor, como Live Server.

## Como compilar o SCSS

O navegador carrega apenas `css/style.css`. Para alterar estilos, edite `css/style.scss` e gere novamente o CSS com Sass CLI:

```bash
sass css/style.scss css/style.css
```

Durante o desenvolvimento:

```bash
sass --watch css/style.scss:css/style.css
```

Sass é necessário somente para recompilar estilos; não é requisito para executar o site.

## Onde substituir o conteúdo fictício

Procure por `TODO REAL CONTENT` em `index.html`. Os principais pontos são:

- nome, assinatura visual e biografia da profissional;
- experiência e certificações;
- depoimentos autorizados;
- telefone, endereço e horários;
- perfil do Instagram;
- número do WhatsApp em todos os links `wa.me`;
- fotografias do hero, da profissional e de resultados.

As imagens atuais são ilustrações fictícias geradas exclusivamente para este protótipo. Ao substituí-las, mantenha os mesmos nomes de arquivo ou atualize os caminhos no HTML. Prefira AVIF/WebP responsivo e preserve os atributos `width`, `height`, `alt`, `loading` e `decoding`.

## Identidade visual

A paleta, raios, sombra e largura máxima estão centralizados no início de `css/style.scss`. Altere essas variáveis e recompile o SCSS para atualizar a identidade do site.

## Links temporários

- WhatsApp: `https://wa.me/5500000000000`
- Telefone: `(11) 00000-0000`
- Endereço: Rua das Flores, 123 — Centro, São Paulo — SP
- Instagram: página inicial do Instagram

Todos devem ser substituídos antes da publicação.

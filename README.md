# Evolution-Bodybuilding

Projeto web de gestão de treinos para academia (login, dashboard, treino, progresso, perfil, histórico).

## Estrutura de pastas

- `css/`: estilos principais
  - `dashboard.css` (estilos do painel e treinos)
  - `styles.css` (estilos de login/cadastro)
- `js/`: scripts de comportamento
  - `script.js` (login)
  - `register.js` (cadastro)
  - `dashboard.js` (painel, tema, logout)
  - `workout.js` (progressão de treino, modal, persistência)
  - `profile.js` (perfil)
  - `history.js` (histórico)
  - `forgot.js` (recuperar senha)
- `pages/`: conteúdo principal de navegação
  - `index.html`, `register.html`, `dashboard.html`, `profile.html`, `history.html`, `forgot.html`
  - `workout-*.html` (treinos específicos)
- `index.html` (raiz) redireciona para `pages/index.html`.

## Execução local

1. Abra `index.html` da raiz no navegador.
2. Ou acesse via servidor local (recomendado):
   - `python -m http.server 8000` (a partir do diretório do projeto)
   - Navegue para `http://localhost:8000`

## Deploy GitHub Pages

- URL: `https://hugo-batista.github.io/Evolution-Bodybuilding/`

## Observações

- O projeto usa `localStorage` para simular cadastro e login (sem backend). Dados são localmente persistidos.
- O redirecionamento no arquivo raiz permite o acesso direto via GitHub Pages.

# NUTRIBOX — HTML/CSS/JS + Flask

Conversão do projeto React/TanStack para HTML, CSS e JavaScript puros,
com backend em Flask. Sem frameworks de UI, sem build step.

## Estrutura

```
nutribox/
  backend/
    app.py             # API REST + serve o frontend
    requirements.txt
    data.json          # criado em runtime (usuários e sessões)
  frontend/
    index.html         # landing
    login.html
    cadastro.html
    configuracao.html  # metas nutricionais (etapa 2)
    planos.html        # escolher plano (etapa 3)
    dashboard.html     # cardápio da semana
    pedidos.html
    perfil.html
    css/styles.css
    js/app.js          # api(), toast, auth helpers
    js/dashboard.js    # layout sidebar
```

## Como rodar

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Abra http://localhost:5000

## Endpoints da API

| Método | Rota               | Auth | Descrição                          |
|--------|--------------------|------|------------------------------------|
| POST   | /api/signup        | -    | Cria usuário e retorna token       |
| POST   | /api/signin        | -    | Login                              |
| POST   | /api/signout       | sim  | Encerra sessão                     |
| GET    | /api/me            | sim  | Dados do usuário logado            |
| PATCH  | /api/me            | sim  | Atualiza perfil / metas / plano    |
| GET    | /api/menu          | -    | Cardápio da semana                 |
| GET    | /api/orders        | sim  | Pedidos                            |
| GET    | /api/plans         | -    | Planos disponíveis                 |
| GET    | /api/restrictions  | -    | Lista de restrições alimentares    |

Auth: header `Authorization: Bearer <token>` (token salvo em localStorage).

## Observações

- Persistência em arquivo JSON (`backend/data.json`) — substitua por SQLite/Postgres em produção.
- Senha armazenada em texto puro (igual ao mock original). Para produção, use `werkzeug.security.generate_password_hash`.
- Sem libs JS no frontend além do que o browser oferece. Sem build, sem TypeScript.

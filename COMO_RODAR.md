# Como rodar o projeto (backend + frontend)

## Pré-requisitos
- Python 3.14 + `uv`
- Node.js + `npm`
- MySQL e PostgreSQL rodando localmente

## 1) Backend (Django)
No terminal, a partir da raiz do projeto:

```bash
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2
cd backend```
uv sync
source .venv/bin/activate
```

Crie os bancos (se ainda não existirem):
- MySQL: `db_escola`
- PostgreSQL: `db_biblioteca`

As credenciais estão em `backend/core/settings.py`.

Rodar migrações e subir o servidor:
```bash
uv run python manage.py migrate --database=default --fake-initial 
uv run python manage.py migrate --database=biblioteca --fake-initial
uv run python manage.py runserver 127.0.0.1:8000
```

Endpoints:
- API: http://127.0.0.1:8000/api/v1
- Docs: http://127.0.0.1:8000/api/v1/docs
- Admin: http://127.0.0.1:8000/admin/

## 2) Frontend 
Em outro terminal:

```bash
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2
cd frontend
npm install
npm run dev


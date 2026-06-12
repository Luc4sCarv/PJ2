# Como rodar o projeto no Windows

## Pré-requisitos
1. Python 3.14 instalado.
2. `uv` instalado.
3. Node.js instalado.
4. MySQL e PostgreSQL instalados e em execução.

## 1) Abrir o projeto
1. Abra o **PowerShell**.
2. Entre na pasta raiz do projeto.

```powershell
cd C:\caminho\para\projetos_2
```

## 2) Configurar o backend
1. Entre na pasta do backend.

```powershell
cd backend
```

2. Crie ou ajuste o arquivo `backend\.env` com as senhas do banco.

```env
DJANGO_SECRET_KEY=change-me-in-local-env
MYSQL_DB_NAME=db_escola
MYSQL_DB_HOST=localhost
MYSQL_DB_PORT=3306
MYSQL_DB_USER=root
MYSQL_DB_PASSWORD=sua_senha_mysql
POSTGRES_DB_NAME=db_biblioteca
POSTGRES_DB_HOST=localhost
POSTGRES_DB_PORT=5432
POSTGRES_DB_USER=postgres
POSTGRES_DB_PASSWORD=sua_senha_postgres
```

3. Instale as dependências do Python.

```powershell
uv sync
```

4. Rode as migrações para criar as tabelas no banco.

```powershell
uv run python manage.py migrate --database=default --fake-initial
uv run python manage.py migrate --database=biblioteca --fake-initial
```

5. Suba a API (servidor backend).

```powershell
uv run python manage.py runserver 127.0.0.1:8000
```

> Resumo rápido (backend):
>
> 1. Criar tabelas: `uv run python manage.py migrate --database=default --fake-initial` e `uv run python manage.py migrate --database=biblioteca --fake-initial`
> 2. Subir API: `uv run python manage.py runserver 127.0.0.1:8000`

## 3) Configurar o frontend
1. Abra **outro PowerShell**.
2. Entre na pasta do frontend.

```powershell
cd C:\caminho\para\projetos_2\frontend
```

3. Instale as dependências.

```powershell
npm install
```

4. Inicie o frontend.

```powershell
npm run dev
```

## 4) Abrir no navegador
1. Acesse o frontend no endereço mostrado pelo Vite.
2. Para ver a API, use:
   - http://127.0.0.1:8000/api/v1
   - http://127.0.0.1:8000/api/v1/docs
   - http://127.0.0.1:8000/admin/

## Observação
- Se o comando `uv` não funcionar, instale-o antes de repetir os passos do backend.
- Se o banco não conectar, confira se o MySQL e o PostgreSQL estão rodando e se as senhas do `.env` estão corretas.

ls -la
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/backend && uv sync
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/backend && uv run python manage.py migrate --database=default --fake-initial && uv run python manage.py migrate --database=biblioteca --fake-initial
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/backend && uv run python manage.py test
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/backend && uv run python manage.py runserver 127.0.0.1:8000
sleep 2 && curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:8000/api/v1
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/frontend && npm install
cd /home/lucas/Documents/Faculdade/PJ2/projetos_2/frontend && npm run dev -- --host 127.0.0.1 --port 5173
sleep 2 && curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:5173
    
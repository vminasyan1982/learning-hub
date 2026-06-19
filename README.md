# Learning Hub — Аналитический дашборд

T&D и Ассессмент-центр. Django + React + PostgreSQL + Docker.

## Быстрый старт (локальная разработка)

```bash
cp .env.example .env
# Отредактируйте .env — особенно DJANGO_SECRET_KEY и пароль PostgreSQL

docker compose up --build
```

Сайт: http://localhost (через Nginx) или http://localhost:8000 (Django напрямую).

## Деплой на сервер 185.157.245.247

### 1. Первоначальная настройка сервера (один раз)

```bash
ssh root@185.157.245.247
bash -s < scripts/server-setup.sh
```

Скрипт:
- Установит Docker, Git
- Склонирует репозиторий в `/opt/learning-hub`
- Создаст `.env` (нужно заполнить вручную)
- Сгенерирует SSL-сертификат
- Создаст SSH-ключ для GitHub Actions

### 2. Заполните .env на сервере

```bash
nano /opt/learning-hub/.env
```

### 3. Настройте GitHub Actions (автодеплой)

В репозитории `vminasyan1982/learning-hub` → Settings → Secrets → Actions:

| Secret | Значение |
|---|---|
| `SSH_HOST` | `185.157.245.247` |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | Приватный ключ из `/root/.ssh/deploy_key` |

### 4. Push = Deploy

```bash
git push origin main  # → автоматический деплой на сервер
```

## Структура SSL

Самоподписной сертификат с IP SAN для 185.157.245.247.  
Для избежания предупреждений в браузере импортируйте `nginx/ssl/cert.pem` как доверенный CA.

## Django Admin

После деплоя создайте суперпользователя:

```bash
docker compose exec backend python manage.py createsuperuser
```

Откройте: `https://185.157.245.247/admin/`

## Структура пользователей

| Роль | Описание |
|---|---|
| `admin` | Полный доступ + управление пользователями |
| `manager` | Просмотр дашборда |
| `td_team` | Ввод данных + просмотр |
| `viewer` | Только просмотр |

## Поток регистрации

1. Создайте приглашение в Admin → Приглашения
2. Скопируйте ссылку и отправьте пользователю
3. Пользователь заполняет форму
4. Вы получаете email и одобряете/отклоняете в Admin

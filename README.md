# Learning Hub — T&D Analytics Dashboard

> Единая внутренняя платформа для команды Training & Development и Assessment Centre.  
> Все тренинги, тренеры, участники, метрики и планы развития — в одном месте.

**Live:** `https://185.157.245.247` · **Admin:** `https://185.157.245.247/admin/`

---

## Для кого и зачем

Learning Hub решает главную проблему T&D команд — данные разбросаны по Asana, Excel, LMS и почте. Платформа объединяет всё в одном месте и даёт руководству реальную картину: что делается, сколько стоит, какой результат.

**Польза для T&D команды:** меньше времени на ручные отчёты, больше времени на содержание.  
**Польза для бизнеса:** прозрачность инвестиций в обучение и их влияние на результат.

---

## Модули платформы

| Модуль | Что делает | Польза |
|---|---|---|
| **Dashboard** | 6 KPI-карточек (NPS%, CSAT%, Проекты в работе, Business Value, Участники, БЮ) с трендами и фильтром по году | Руководитель видит состояние T&D одним взглядом — без Excel-отчётов |
| **Trainings** | Полный каталог тренингов с метриками, ссылками (LMS, Asana, Drive), фильтром по формату и поиском | Единый реестр всех обучений с историей и результатами |
| **Internal Registry** | Журнал заявок от бизнес-подразделений — статус, ответственный, дедлайн, комментарии | Ни одна заявка не теряется, видна стадия исполнения |
| **External Registry** | Внешние провайдеры, стоимость, даты — с выгрузкой в Excel | Контроль расходов на внешнее обучение |
| **Trainers** | Профили тренеров с NPS/CSAT рейтингами и историей тренингов | Понимать кто лучший тренер и по каким направлениям |
| **Participants** | Кто что прошёл, история участий | Отчёт по любому сотруднику за секунды |
| **T&D Portfolio** | Витрина курсов с описанием, навыками, LMS-ссылкой — клик открывает детали | Сотрудники сами находят нужный курс, снижается нагрузка на T&D |
| **Compliance** | Обязательные тренинги: % прохождения, дедлайны, RAG-статус (🟢🟡🔴) | Контроль выполнения регуляторных и корпоративных требований |
| **Budget** | Плановый vs фактический бюджет по кварталам, отклонение, выбор валюты | Финансовая прозрачность L&D для CFO и HRD |
| **Skills Matrix** | Тепловая карта навыков команды: сотрудник × навык, уровень 0–4 | Видно где пробелы, на какие тренинги направлять людей |
| **My IDP** | Индивидуальный план развития: цели, связанные тренинги, прогресс | Каждый сотрудник видит свой путь, руководитель — прогресс команды |
| **ROI Calculator** | Инвестиции в обучение, стоимость на участника, NPS/CSAT vs бенчмарк | Бизнес-обоснование бюджета T&D для топ-менеджмента |
| **Assessment Centre** | В разработке | — |

---

## KPI и бенчмарки

| Метрика | Цель | Что измеряет |
|---|---|---|
| NPS | ≥ 3.0 / 60% | Готовность рекомендовать тренинг |
| CSAT | ≥ 4.3 / 80% | Удовлетворённость участников |
| Business Value | ≥ 70% | Применимость обучения на практике |
| LH Standards | ≥ 4.5 / 90% | Соответствие стандартам Learning Hub |
| Trainer Rating | ≥ 4.5 / 90% | Качество работы тренера |
| Compliance | 100% | Прохождение обязательных тренингов в срок |

---

## Technology stack

| Layer | Technology |
|---|---|
| Backend | Django 5.0 · Django REST Framework · SimpleJWT · django-guardian |
| Database | PostgreSQL 15 |
| Frontend | React 18 · TypeScript · Vite · Zustand · Recharts |
| Styling | CSS Modules · CSS custom properties · Mulish font |
| Infrastructure | Docker Compose · Nginx · Gunicorn · GitHub Actions |
| Auth | JWT (access + refresh tokens) · invitation-based registration |

---

## User roles

| Role | Access |
|---|---|
| `admin` | Full access + user management |
| `td_team` | Data entry + full view |
| `manager` | Dashboard + read-only |
| `viewer` | Read-only |

---

## Deployment

### 1. Push to GitHub → auto-deploy

```bash
git push origin main
```

GitHub Actions SSHes into the server and runs `git pull && docker compose up --build -d` automatically.

### 2. Manual deploy on server

```bash
ssh root@185.157.245.247
cd /opt/learning-hub
git pull
docker compose up --build -d
```

### 3. Load test data (first time only)

```bash
docker compose exec backend python manage.py seed_test_data
```

---

## Initial server setup (one-time)

```bash
ssh root@185.157.245.247
bash -s < scripts/server-setup.sh
nano /opt/learning-hub/.env   # fill in secrets
docker compose exec backend python manage.py createsuperuser
```

GitHub Actions secrets required:

| Secret | Value |
|---|---|
| `SSH_HOST` | `185.157.245.247` |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | Private key from `/root/.ssh/deploy_key` |

---

## Local development

```bash
cp .env.example .env
# Edit .env — set DJANGO_SECRET_KEY and DB password

docker compose up --build
```

Frontend: http://localhost · Django API: http://localhost:8000 · Admin: http://localhost:8000/admin/

---

## Registration flow

1. Create an invitation in Admin → Invitations → Copy invite link
2. Send the link to the new user
3. User fills in the form (name, position, department, business unit, role)
4. Admin receives email notification → approve or deny in Admin or at `/admin/users`
5. Approved users receive a temporary password by email and must change it on first login

---

## SSL note

Server uses a self-signed certificate with an IP SAN for `185.157.245.247`.  
To avoid browser warnings: import `nginx/ssl/cert.pem` as a trusted CA in your browser settings.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| Current | Jun 2026 | Sprint 2: Skills Matrix (heatmap), IDP (индивидуальные планы развития), ROI Calculator (инвестиции vs результат), Training↔Trainer M2M связь |
| Jun 2026 | Jun 2026 | Sprint 1: Compliance (обязательные тренинги, RAG), Budget (план/факт по кварталам), валюта USD/EUR, Portfolio modal, filter race-condition fix |
| Jun 2026 | Jun 2026 | English UI, dark mode, user menu, KPI hover details, expandable rows, External Registry, Business Value %, NPS/CSAT % |
| v0.4 | Jun 2026 | Requirements finalized (v0.4 spec), Assessment Centre and External Registry fields TBD |
| v0.3 | — | Learning Hub rebrand, Mulish fonts, T&D Portfolio, invitation system |
| v0.2 | — | 6 KPI metrics with targets, role-based access |
| v0.1 | — | Initial structure |

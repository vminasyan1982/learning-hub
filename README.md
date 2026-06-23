# Learning Hub — T&D Analytics Dashboard

> Internal analytics platform for the Training & Development team and Assessment Centre.  
> Tracks trainings, trainers, participants, projects, and KPIs in one place.

**Live:** `https://185.157.245.247` · **Admin:** `https://185.157.245.247/admin/`

---

## What it does

Learning Hub gives the T&D team and management a single source of truth for all learning activity:

| Module | Description |
|---|---|
| **Dashboard** | 6 KPI cards (NPS%, CSAT%, Projects in Progress, Business Value, Participants, Business Units) with trend charts and per-period filtering |
| **Trainings** | Full catalogue of classified training projects with metrics, links (LMS, Asana, Drive), expandable detail rows |
| **Internal Registry** | Journal of all department requests — status tracking, project managers, developers, deadlines, comments |
| **External Registry** | External provider trainings with cost/budget tracking |
| **Trainers** | Trainer profiles with NPS/CSAT ratings, types, and training history |
| **Participants** | Who attended what, with training history |
| **T&D Portfolio** | Course catalogue — click any card for detail modal (description, skills, participants count, LMS link) |
| **Compliance** | Mandatory training tracking — per-training completion %, green/yellow/red status, deadlines |
| **Budget** | Planned vs actual L&D spend by year and quarter, variance tracking |
| **Assessment Centre** | Planned — requirements in progress |

---

## KPIs tracked

| Metric | Target |
|---|---|
| NPS | ≥ 60% |
| CSAT | ≥ 80% |
| Business Value compliance | ≥ 70% |
| LH Standards | ≥ 4.5 / 90% |
| Trainer quarterly rating | ≥ 4.5 / 90% |
| Discipline | No formal warnings |

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
| Current | Jun 2026 | Sprint 1: Compliance tracking module (mandatory trainings, progress bars, RAG status), Budget module (planned vs actual by quarter, variance), BudgetPlan model + Django Admin |
| Jun 2026 | Jun 2026 | English UI, dark mode, user menu, KPI hover details, expandable table rows, External Registry split, Business Value % and Projects in Progress KPIs, NPS/CSAT as %, per-year trend filter |
| v0.4 | Jun 2026 | Requirements finalized (v0.4 spec), Assessment Centre and External Registry fields TBD |
| v0.3 | — | Learning Hub rebrand, Mulish fonts, T&D Portfolio, invitation system |
| v0.2 | — | 6 KPI metrics with targets, role-based access |
| v0.1 | — | Initial structure |

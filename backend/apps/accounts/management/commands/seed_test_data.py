import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.accounts.models import Lookup, LookupCategory
from apps.trainings.models import BusinessUnit, Training, TrainingMetric
from apps.trainers.models import Trainer
from apps.trainees.models import Trainee, TrainingParticipation
from apps.registry.models import InternalRegistryEntry, ExternalRegistryEntry
from apps.portfolio.models import PortfolioItem


class Command(BaseCommand):
    help = "Seed database with test data (remove before production)"

    def handle(self, *args, **options):
        with transaction.atomic():
            self.seed_lookups()
            bus = self.seed_business_units()
            trainers = self.seed_trainers()
            trainings = self.seed_trainings(bus, trainers)
            self.seed_trainees(trainings)
            self.seed_registry()
            self.seed_portfolio()
        self.stdout.write(self.style.SUCCESS("Test data seeded successfully!"))

    def seed_lookups(self):
        departments = ["T&D", "Assessment Centre", "HR", "Finance", "Sales", "Operations", "Marketing", "IT"]
        positions = ["L&D Specialist", "T&D Manager", "HR Business Partner", "Team Lead", "Senior Specialist", "Analyst", "Coordinator", "Director"]
        business_units = ["Corporate", "Retail", "Digital", "Logistics", "Support"]

        for name in departments:
            Lookup.objects.get_or_create(category=LookupCategory.DEPARTMENT, name=name)
        for name in positions:
            Lookup.objects.get_or_create(category=LookupCategory.POSITION, name=name)
        for name in business_units:
            Lookup.objects.get_or_create(category=LookupCategory.BUSINESS_UNIT, name=name)
        self.stdout.write("  ✓ Lookups created")

    def seed_business_units(self):
        names = ["Corporate", "Retail", "Digital", "Logistics", "Support"]
        units = [BusinessUnit.objects.get_or_create(name=n)[0] for n in names]
        self.stdout.write("  ✓ Business units created")
        return units

    def seed_trainers(self):
        trainers_data = [
            ("Anna", "Petrosyan", "anna.petrosyan@company.am", True, ["soft_skills", "leadership"]),
            ("David", "Hakobyan", "david.hakobyan@company.am", True, ["technical", "management"]),
            ("Maria", "Sargsyan", "maria.sargsyan@company.am", False, ["coaching", "sales"]),
            ("Armen", "Hovhannisyan", "armen.h@company.am", True, ["facilitation", "teambuilding"]),
            ("Narine", "Grigoryan", "narine.g@external.com", False, ["leadership", "strategy"]),
            ("Karen", "Mkrtchyan", "karen.m@company.am", True, ["technical", "data"]),
        ]
        trainers = []
        for first, last, email, internal, types in trainers_data:
            t, _ = Trainer.objects.get_or_create(
                email=email,
                defaults=dict(
                    first_name=first, last_name=last,
                    is_internal=internal, trainer_types=types, is_active=True,
                    bio=f"{first} {last} is an experienced trainer specializing in {', '.join(types)}."
                )
            )
            trainers.append(t)
        self.stdout.write("  ✓ Trainers created")
        return trainers

    def seed_trainings(self, bus, trainers):
        formats = ["online", "offline", "mixed"]
        classifications = [
            "online_trainer", "offline_trainer", "online_workshop", "offline_workshop",
            "online_self", "offline_mixed", "online_coaching", "offline_game",
        ]
        titles = [
            "Leadership Excellence Program",
            "Sales Mastery Workshop",
            "Data-Driven Decision Making",
            "Effective Communication Skills",
            "Agile Project Management",
            "Customer Experience Training",
            "Strategic Thinking & Planning",
            "Team Building & Collaboration",
            "Digital Tools for Modern Teams",
            "Feedback Culture & Coaching",
            "Conflict Resolution Workshop",
            "Time Management Masterclass",
        ]
        trainings = []
        base_date = date(2024, 1, 15)
        for i, title in enumerate(titles):
            d = base_date + timedelta(days=i * 22)
            fmt = formats[i % len(formats)]
            t, created = Training.objects.get_or_create(
                title=title,
                defaults=dict(
                    date=d,
                    format=fmt,
                    classification=classifications[i % len(classifications)],
                    description=f"Training program focused on {title.lower()}.",
                    is_internal=(i % 3 != 0),
                )
            )
            if created:
                t.business_units.set(random.sample(bus, k=random.randint(1, 3)))
                nps = Decimal(str(round(random.uniform(2.5, 5.0), 2)))
                csat = Decimal(str(round(random.uniform(3.8, 5.0), 2)))
                TrainingMetric.objects.create(
                    training=t,
                    nps_score=nps,
                    nps_percent=Decimal(str(round(random.uniform(60, 95), 2))),
                    csat_score=csat,
                    csat_percent=Decimal(str(round(random.uniform(65, 98), 2))),
                    participants_count=random.randint(8, 45),
                    trainer_rating=Decimal(str(round(random.uniform(4.0, 5.0), 2))),
                    lh_standards_score=Decimal(str(round(random.uniform(3.8, 5.0), 2))),
                    business_value=random.randint(3, 5),
                    discipline_ok=(random.random() > 0.1),
                )
            trainings.append(t)
        self.stdout.write("  ✓ Trainings created")
        return trainings

    def seed_trainees(self, trainings):
        trainees_data = [
            ("Alex", "Danielyan", "alex.d@company.am", "Team Lead", "Sales", "Retail"),
            ("Sophie", "Karapetyan", "sophie.k@company.am", "Analyst", "Finance", "Corporate"),
            ("Tigran", "Avetisyan", "tigran.a@company.am", "Senior Specialist", "IT", "Digital"),
            ("Lilit", "Nahapetyan", "lilit.n@company.am", "Coordinator", "HR", "Corporate"),
            ("Artur", "Baghdasaryan", "artur.b@company.am", "Director", "Operations", "Logistics"),
            ("Marine", "Simonyan", "marine.s@company.am", "L&D Specialist", "T&D", "Corporate"),
            ("Hayk", "Muradyan", "hayk.m@company.am", "HR Business Partner", "HR", "Retail"),
            ("Ani", "Gevorgyan", "ani.g@company.am", "Analyst", "Marketing", "Digital"),
            ("Vahan", "Abrahamyan", "vahan.a@company.am", "Senior Specialist", "Sales", "Retail"),
            ("Karine", "Martirosyan", "karine.m@company.am", "Coordinator", "Finance", "Corporate"),
        ]
        for first, last, email, pos, dept, bu in trainees_data:
            trainee, _ = Trainee.objects.get_or_create(
                email=email,
                defaults=dict(first_name=first, last_name=last, position=pos, department=dept, business_unit=bu)
            )
            for training in random.sample(trainings, k=random.randint(2, 5)):
                TrainingParticipation.objects.get_or_create(
                    trainee=trainee, training=training,
                    defaults=dict(attended=True, completion_date=training.date)
                )
        self.stdout.write("  ✓ Trainees created")

    def seed_registry(self):
        internal = [
            ("Leadership Program Q1", "td", "Workshop", "L&D Specialist", "2024-03-31", "completed"),
            ("Sales Onboarding Update", "td", "E-learning", "T&D Manager", "2024-04-15", "done"),
            ("Assessment 360 Review", "assessment", "Assessment", "HR Business Partner", "2024-05-01", "in_progress"),
            ("Digital Skills Bootcamp", "td", "Blended", "L&D Specialist", "2024-06-30", "in_progress"),
            ("Manager Development Track", "td", "Workshop Series", "T&D Manager", "2024-08-31", "not_started"),
            ("Customer Service Excellence", "assessment", "Role Play", "HR Business Partner", "2024-07-15", "on_hold"),
        ]
        for i, (title, center, fmt, pm, deadline, status) in enumerate(internal):
            InternalRegistryEntry.objects.get_or_create(
                title=title,
                defaults=dict(
                    request_date=date(2024, 1, 1) + timedelta(days=i * 15),
                    center=center, format=fmt, project_manager=pm,
                    deadline=deadline, status=status,
                    completed_on_time=(True if status in ("done", "completed") else None),
                    asana_url="https://app.asana.com/0/123456",
                )
            )
        external = [
            ("Coaching Certification ICF", "ICF Institute", "2024-03-10", 1200),
            ("HR Tech Conference 2024", "SHRM", "2024-05-22", 800),
            ("Agile Leadership Bootcamp", "Scrum Alliance", "2024-07-08", 650),
        ]
        for title, provider, d, cost in external:
            ExternalRegistryEntry.objects.get_or_create(
                title=title,
                defaults=dict(provider=provider, date=d, cost=Decimal(str(cost)), currency="USD")
            )
        self.stdout.write("  ✓ Registry entries created")

    def seed_portfolio(self):
        items = [
            ("Leadership Excellence", "Leadership Development Program", "Leadership, Strategic Thinking, Decision Making", "English", "Contact T&D team via email", 1),
            ("Sales Mastery", "Sales Skills Workshop Series", "Negotiation, Customer Relations, Closing Skills", "Armenian", "Sign up via Asana", 2),
            ("Digital Foundations", "Digital Tools & Productivity", "Excel, Google Workspace, Data Analysis", "Russian", "Available in LMS", 3),
            ("Manager Toolkit", "New Manager Onboarding Track", "People Management, Feedback, Performance", "English", "Nomination by HR", 4),
        ]
        for promo, internal, skills, lang, enroll, order in items:
            PortfolioItem.objects.get_or_create(
                promo_name=promo,
                defaults=dict(
                    internal_name=internal, skills=skills, language=lang,
                    enrollment_info=enroll, order=order, is_active=True,
                )
            )
        self.stdout.write("  ✓ Portfolio items created")

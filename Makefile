# ================================================================
#  Savor — Developer Makefile
#  Run `make help` to see all available commands
# ================================================================

.PHONY: help dev-backend dev-frontend install migrate seed superuser \
        lint-backend lint-frontend test-backend build-frontend clean

# ─────────────────────────────────────────────────────────────────
#  Default: show help
# ─────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  ╔══════════════════════════════════════╗"
	@echo "  ║        Savor — Make Commands          ║"
	@echo "  ╚══════════════════════════════════════╝"
	@echo ""
	@echo "  Setup:"
	@echo "    make install          Install all backend + frontend deps"
	@echo "    make migrate          Run Django migrations"
	@echo "    make seed             Run seed_kerala management command"
	@echo "    make superuser        Create Django superuser interactively"
	@echo ""
	@echo "  Development:"
	@echo "    make dev-backend      Start Django dev server on :8000"
	@echo "    make dev-frontend     Start Vite dev server on :5173"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-up        Start full stack with Docker Compose"
	@echo "    make docker-down      Stop all Docker containers"
	@echo "    make docker-reset     Wipe volumes and rebuild from scratch"
	@echo ""
	@echo "  Quality:"
	@echo "    make lint-backend     Run flake8 on Django code"
	@echo "    make lint-frontend    Run ESLint on React code"
	@echo "    make test-backend     Run Django test suite"
	@echo ""
	@echo "  Build:"
	@echo "    make build-frontend   Build React for production"
	@echo "    make clean            Remove build artifacts"
	@echo ""

# ─────────────────────────────────────────────────────────────────
#  Setup
# ─────────────────────────────────────────────────────────────────
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed."

migrate:
	@echo "🗄️  Running Django migrations..."
	cd backend && python manage.py migrate

seed:
	@echo "🌱 Seeding Kerala data..."
	cd backend && python manage.py seed_kerala

superuser:
	@echo "👑 Creating Django superuser..."
	cd backend && python manage.py createsuperuser

# ─────────────────────────────────────────────────────────────────
#  Development Servers
# ─────────────────────────────────────────────────────────────────
dev-backend:
	@echo "🚀 Starting Django backend on http://localhost:8000"
	cd backend && python manage.py runserver

dev-frontend:
	@echo "⚡ Starting Vite frontend on http://localhost:5173"
	cd frontend && npm run dev

# ─────────────────────────────────────────────────────────────────
#  Docker
# ─────────────────────────────────────────────────────────────────
docker-up:
	@echo "🐳 Starting full Savor stack..."
	docker compose up --build

docker-down:
	@echo "🛑 Stopping containers..."
	docker compose down

docker-reset:
	@echo "💥 Resetting Docker environment..."
	docker compose down -v --remove-orphans
	docker compose up --build

# ─────────────────────────────────────────────────────────────────
#  Code Quality
# ─────────────────────────────────────────────────────────────────
lint-backend:
	@echo "🔍 Linting Django code..."
	cd backend && flake8 . --exclude=venv,migrations --max-line-length=100

lint-frontend:
	@echo "🔍 Linting React code..."
	cd frontend && npm run lint

test-backend:
	@echo "🧪 Running Django tests..."
	cd backend && python manage.py test

# ─────────────────────────────────────────────────────────────────
#  Build
# ─────────────────────────────────────────────────────────────────
build-frontend:
	@echo "🏗️  Building frontend for production..."
	cd frontend && npm run build

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf backend/staticfiles
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Clean complete."

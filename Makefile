# ============================================
# Recipe Share - Docker Development Makefile
# ============================================

# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Colors for terminal output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help dev dev-build dev-down dev-logs dev-clean \
        prod prod-build prod-down prod-logs prod-clean \
        db-shell redis-shell api-shell web-shell \
        prune build-cache-clean

# Default target
help:
	@echo "$(GREEN)Recipe Share Docker Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev           - Start development environment"
	@echo "  make dev-build     - Build and start development environment"
	@echo "  make dev-down      - Stop development environment"
	@echo "  make dev-logs      - View all container logs"
	@echo "  make dev-clean     - Remove all dev containers and volumes"
	@echo ""
	@echo "$(YELLOW)Production:$(NC)"
	@echo "  make prod          - Start production environment"
	@echo "  make prod-build    - Build and start production environment"
	@echo "  make prod-down     - Stop production environment"
	@echo "  make prod-clean    - Remove all prod containers and volumes"
	@echo ""
	@echo "$(YELLOW)Shell Access:$(NC)"
	@echo "  make db-shell      - PostgreSQL shell"
	@echo "  make redis-shell   - Redis CLI"
	@echo "  make api-shell     - API container shell"
	@echo "  make web-shell     - Web container shell"
	@echo ""
	@echo "$(YELLOW)Maintenance:$(NC)"
	@echo "  make prune         - Remove unused Docker resources"
	@echo "  make build-cache-clean - Clear BuildKit cache"

# ============================================
# Development Commands
# ============================================

dev:
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker compose -f docker-compose.dev.yml up

dev-build:
	@echo "$(GREEN)Building and starting development environment...$(NC)"
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

dev-logs-api:
	docker compose -f docker-compose.dev.yml logs -f api

dev-logs-web:
	docker compose -f docker-compose.dev.yml logs -f web

dev-clean:
	@echo "$(RED)Removing all development containers and volumes...$(NC)"
	docker compose -f docker-compose.dev.yml down -v --rmi local
	docker volume rm -f recipe-share-api-dist recipe-share-web-next-cache 2>/dev/null || true

# ============================================
# Production Commands
# ============================================

prod:
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker compose -f docker-compose.prod.yml --env-file .env.production up -d

prod-build:
	@echo "$(GREEN)Building and starting production environment...$(NC)"
	docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

prod-down:
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker compose -f docker-compose.prod.yml --env-file .env.production down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-clean:
	@echo "$(RED)Removing all production containers and volumes...$(NC)"
	docker compose -f docker-compose.prod.yml --env-file .env.production down -v --rmi all

# ============================================
# Shell Access
# ============================================

db-shell:
	@echo "$(GREEN)Connecting to PostgreSQL...$(NC)"
	docker compose -f docker-compose.dev.yml exec postgres psql -U recipe_user -d recipe_share

redis-shell:
	@echo "$(GREEN)Connecting to Redis...$(NC)"
	docker compose -f docker-compose.dev.yml exec redis redis-cli

api-shell:
	@echo "$(GREEN)Opening API container shell...$(NC)"
	docker compose -f docker-compose.dev.yml exec api sh

web-shell:
	@echo "$(GREEN)Opening Web container shell...$(NC)"
	docker compose -f docker-compose.dev.yml exec web sh

# ============================================
# Maintenance
# ============================================

prune:
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f

build-cache-clean:
	@echo "$(YELLOW)Clearing BuildKit cache...$(NC)"
	docker builder prune -f
	rm -rf /tmp/.buildx-cache /tmp/.buildx-cache-new

# ============================================
# Health Check
# ============================================

health:
	@echo "$(GREEN)Checking service health...$(NC)"
	@echo "API: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/health)"
	@echo "Web: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"

# ============================================
# Quick Restart
# ============================================

restart-api:
	docker compose -f docker-compose.dev.yml restart api

restart-web:
	docker compose -f docker-compose.dev.yml restart web

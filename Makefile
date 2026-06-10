COMPOSE ?= docker compose

.PHONY: help build up down

help:
	@printf "HIITBuddy commands:\\n"
	@printf "  make build  Rebuild and start the app container\\n"
	@printf "  make up     Start the app container\\n"
	@printf "  make down   Stop and remove the app container\\n"

build:
	$(COMPOSE) up -d --build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

COMPOSE ?= docker compose

.PHONY: help build up down

help:
	@printf "HIITBuddy commands:\\n"
	@printf "  make build  Pull the latest image and start the app container\\n"
	@printf "  make up     Start the app container\\n"
	@printf "  make down   Stop and remove the app container\\n"

build:
	$(COMPOSE) pull
	$(COMPOSE) up -d

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

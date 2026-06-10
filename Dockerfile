FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src

RUN npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/serve.mjs ./scripts/serve.mjs
COPY --from=build /app/dist ./dist

EXPOSE 8080

USER node

CMD ["npm", "run", "start"]

FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY workers/hermes ./workers/hermes

CMD ["npx", "tsx", "workers/hermes/index.ts"]

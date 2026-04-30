# Base
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./

# Development
FROM base AS development
ENV NODE_ENV='development'
RUN npm install
COPY . .

EXPOSE 1700
CMD ["npm", "run", "dev"]

# Builder
FROM base AS builder
ENV NODE_ENV='production'
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Production
FROM node:lts-alpine AS production
ENV NODE_ENV='production'

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

COPY --from=builder --chown=apiuser:nodejs /app/package*.json ./
COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist
RUN npm ci --only=production --silent

USER apiuser

EXPOSE 1700
CMD ["node", "dist/src/index.js"]
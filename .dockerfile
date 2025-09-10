FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/bank-recon-service/package.json apps/bank-recon-service/package-lock.json ./
RUN npm install --frozen-lockfile

COPY apps/bank-recon-service ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY apps/bank-recon-service/package.json apps/bank-recon-service/package-lock.json ./
RUN npm install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install and generate Prisma
RUN npm ci && npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build:railway

# Expose port  
EXPOSE 3000

# Start - Railway PORT env variable'ını kullan
CMD sh -c "npx prisma migrate deploy && npx next start -H 0.0.0.0 -p \${PORT:-3000}"

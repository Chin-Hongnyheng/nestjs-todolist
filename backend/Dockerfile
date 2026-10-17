# ================================
# Build Stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies based on package-lock.json
COPY package*.json ./
RUN npm ci

# Copy source code and build the NestJS application
COPY . .
RUN npm run build

# ================================
# Production Stage
# ================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Give ownership of working directory to non-root node user
RUN chown -R node:node /usr/src/app

# Use non-root node user for security
USER node

# Default NestJS port
EXPOSE 3000

CMD ["node", "dist/main.js"]

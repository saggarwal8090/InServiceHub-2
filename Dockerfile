# ── Stage 1: Build React client ──
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Node.js Express server ──
FROM node:20-alpine AS server
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client
COPY --from=client-build /app/client/dist ./client/dist

# Copy public images to client dist
COPY client/public/images/ ./client/dist/images/

# Create data directory for SQLite (persistent volume mount point)
RUN mkdir -p /app/data

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

CMD ["node", "server/index.js"]

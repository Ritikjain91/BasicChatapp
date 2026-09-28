FROM node:20-alpine

WORKDIR /app

# Install build tools for sqlite3 native bindings if needed
RUN apk add --no-cache python3 make g++

# Copy backend dependencies
COPY backend/package*.json ./

RUN npm install --production

# Copy backend source code
COPY backend/ ./

EXPOSE 10000

ENV PORT=10000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/chat.db

CMD ["node", "src/server.js"]

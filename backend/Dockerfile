FROM node:20-alpine

WORKDIR /app

# Install build tools for sqlite3 native bindings if needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/chat.db

CMD ["node", "src/server.js"]

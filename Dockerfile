# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig*.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm install

# Copy all source files and configs BEFORE building
COPY . .

# Debug: list important files before build
RUN ls -l tsconfig.build.json src/server.ts

# Build TypeScript
RUN pnpm run build

# Debug: check build output files
RUN ls -l dist

EXPOSE 4000

CMD ["pnpm", "run", "start:prod"]

FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Override the local SDK dependency with the npm version and add missing dependencies
RUN pnpm add @hashgraph/sdk@^2.58.0 long@^5.2.3 @hashgraph/proto@^2.16.0-beta.8

# Install dependencies
RUN pnpm install

ENV RUNNING_IN_DOCKER=true 

# Copy TCK source code
COPY . .

# Expose the port used by the server
EXPOSE 8544

# Start the server
CMD ["pnpm", "start"]
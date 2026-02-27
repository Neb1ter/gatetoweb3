# 单阶段构建（简化版，方便调试）
FROM node:20-alpine
WORKDIR /app

RUN echo "Step 1: Base image ready, Node version:"
RUN node --version && npm --version

# 复制 package.json
COPY package.json ./

RUN echo "Step 2: Installing dependencies..."
RUN npm install --legacy-peer-deps

RUN echo "Step 3: Dependencies installed, copying source code..."
COPY . .

RUN echo "Step 4: Starting build..."
RUN npm run build

RUN echo "Step 5: Build complete!"

# 暴露端口
EXPOSE 3000

# 生产模式启动
ENV NODE_ENV=production
CMD ["npm", "run", "start"]

# 多阶段构建：第一阶段用于构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行时
FROM node:20-alpine

WORKDIR /app

# 只复制必要的文件
COPY package*.json ./
RUN npm install --legacy-peer-deps --production

# 从构建阶段复制构建输出
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动应用
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

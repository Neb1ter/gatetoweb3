# 多阶段构建：第一阶段用于构建
FROM node:20-alpine AS builder
WORKDIR /app

# 启用 corepack 以使用项目指定的 pnpm 版本
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制锁定文件和 package.json（优先使用 pnpm-lock.yaml）
COPY package.json pnpm-lock.yaml ./

# 使用 pnpm 安装依赖（--frozen-lockfile 确保与锁定文件严格匹配）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用（前端 Vite + 后端 esbuild）
RUN pnpm run build

# 第二阶段：运行时（精简镜像）
FROM node:20-alpine
WORKDIR /app

# 启用 corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# 只复制 package.json 和锁定文件
COPY package.json pnpm-lock.yaml ./

# 仅安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 从构建阶段复制构建输出
COPY --from=builder /app/dist ./dist

# 暴露端口（由环境变量 PORT 控制）
EXPOSE 3000

# 生产模式启动
ENV NODE_ENV=production
CMD ["pnpm", "run", "start"]

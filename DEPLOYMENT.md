# gatetoweb3 部署指南

本项目已配置为支持多种部署平台。选择下列任一方式进行部署。

## 快速开始

### 1. Railway 部署（推荐）

Railway 是最简单的部署方式，支持自动 Git 集成。

**步骤：**
1. 访问 [Railway.app](https://railway.app)
2. 使用 GitHub 账户登录
3. 创建新项目，选择"Deploy from GitHub"
4. 选择 `Neb1ter/gatetoweb3` 仓库
5. Railway 将自动检测 `railway.json` 配置
6. 添加环境变量：
   - `DATABASE_URL`: MySQL 连接字符串
   - `JWT_SECRET`: 任意随机字符串
   - `VITE_APP_ID`: gatetoweb3
7. 点击"Deploy"

**预计部署时间：** 3-5 分钟

---

### 2. Render 部署

Render 也提供简单的 Docker 部署支持。

**步骤：**
1. 访问 [Render.com](https://render.com)
2. 使用 GitHub 账户登录
3. 创建新的 Web Service
4. 连接 GitHub 仓库 `Neb1ter/gatetoweb3`
5. 配置：
   - **Runtime**: Docker
   - **Build Command**: (自动)
   - **Start Command**: `node dist/index.js`
6. 添加环境变量（同上）
7. 创建 MySQL 数据库服务
8. 点击"Deploy"

**预计部署时间：** 5-10 分钟

---

### 3. Vercel 部署

Vercel 是 Next.js 的官方部署平台，也支持自定义 Node.js 应用。

**步骤：**
1. 访问 [Vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 导入项目 `Neb1ter/gatetoweb3`
4. 在项目设置中添加环境变量
5. 配置 Build Command: `npm run build`
6. 配置 Output Directory: `dist/public`
7. 部署

**注意：** Vercel 的免费计划对 Serverless Functions 有时间限制。

---

### 4. Docker 本地部署

如果您有自己的服务器或想在本地测试：

```bash
# 构建 Docker 镜像
docker build -t gatetoweb3 .

# 运行容器（需要 MySQL 数据库）
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=mysql://user:pass@host:3306/gatetoweb3 \
  -e JWT_SECRET=your_secret_key \
  gatetoweb3
```

或使用 docker-compose：

```bash
docker-compose up -d
```

---

### 5. 其他平台

本项目也可部署到以下平台：
- **Fly.io**: 支持 Docker，有免费额度
- **Heroku**: 虽然免费计划已停止，但仍可通过付费部署
- **AWS**: 使用 ECS 或 App Runner
- **Google Cloud**: 使用 Cloud Run
- **Azure**: 使用 App Service

---

## 环境变量配置

部署时需要配置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 监听端口 | `3000` |
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | JWT 签名密钥 | 任意随机字符串 |
| `VITE_APP_ID` | 应用 ID | `gatetoweb3` |
| `OAUTH_SERVER_URL` | OAuth 服务器（可选） | 留空或提供 URL |
| `OWNER_OPEN_ID` | 管理员 ID（可选） | 留空 |

---

## 数据库设置

本项目使用 MySQL 8.0。部署时需要：

1. **创建数据库**
   ```sql
   CREATE DATABASE gatetoweb3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **初始化数据库**
   ```bash
   npm run db:push
   ```

3. **连接字符串格式**
   ```
   mysql://username:password@hostname:3306/gatetoweb3
   ```

---

## 部署后验证

部署完成后，访问应用 URL 并检查：

1. ✅ 前端页面是否正常加载
2. ✅ 导航菜单是否可用
3. ✅ API 端点是否响应（检查浏览器控制台）
4. ✅ 数据库连接是否正常（如果有数据库操作）

---

## 常见问题

### Q: 部署后出现 "Cannot find module" 错误
**A:** 确保 `npm install` 已在构建过程中执行。检查 Dockerfile 或部署平台的构建日志。

### Q: 数据库连接失败
**A:** 验证 `DATABASE_URL` 环境变量是否正确，并确保数据库服务已启动。

### Q: 应用启动后立即崩溃
**A:** 检查部署平台的日志。常见原因包括缺少环境变量或数据库初始化失败。

### Q: 如何更新已部署的应用？
**A:** 推送新的代码到 GitHub，大多数平台会自动重新部署。

---

## 支持

如有问题，请查看项目的 GitHub Issues 或联系开发者。


# 🚀 GitHub 部署指南

本指南将帮助你把 Teams Bot 演示版部署到 GitHub，并使用 GitHub Pages 托管。

---

## 📋 前置要求

1. ✅ GitHub 账号
2. ✅ Git 已安装
3. ✅ 项目已在本地正常运行

---

## 🎯 部署步骤

### 步骤 1: 在 GitHub 上创建仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 `+` → `New repository`
3. 填写仓库信息：
   - **Repository name**: `TeamsBot` （或你喜欢的名字）
   - **Description**: `Microsoft Teams Bot - Live of Interest Management`
   - **Public/Private**: 选择 Public（GitHub Pages 免费版需要公开仓库）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
4. 点击 `Create repository`

### 步骤 2: 连接本地仓库到 GitHub

复制 GitHub 显示的仓库 URL，例如：
```
https://github.com/你的用户名/TeamsBot.git
```

然后在终端运行：

```bash
cd /Users/ximinwang/Documents/TeamsBot

# 添加远程仓库
git remote add origin https://github.com/你的用户名/TeamsBot.git

# 查看是否添加成功
git remote -v
```

### 步骤 3: 添加并提交所有文件

```bash
# 查看哪些文件会被提交
git status

# 添加所有文件
git add .

# 创建初始提交
git commit -m "Initial commit: Teams LOI Bot with demo mode"

# 查看提交历史
git log --oneline
```

### 步骤 4: 推送到 GitHub

```bash
# 推送到 main 分支
git branch -M main
git push -u origin main
```

如果需要输入凭据：
- **Username**: 你的 GitHub 用户名
- **Password**: 使用 Personal Access Token（不是密码）

#### 🔑 如何创建 Personal Access Token:

1. 访问 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 `Generate new token` → `Generate new token (classic)`
3. 勾选 `repo` 权限
4. 点击 `Generate token`
5. **复制并保存** token（只显示一次）

### 步骤 5: 启用 GitHub Pages

1. 访问你的 GitHub 仓库页面
2. 点击 `Settings`
3. 在左侧菜单找到 `Pages`
4. 在 `Source` 下选择：
   - **Source**: `GitHub Actions`
5. 保存设置

### 步骤 6: 配置部署工作流

仓库中已经包含了 GitHub Actions 配置文件：
```
.github/workflows/deploy-github-pages.yml
```

**重要**: 需要更新工作流中的 base path。

编辑 `.github/workflows/deploy-github-pages.yml`，在 `Build for Demo Mode` 步骤中添加：

```yaml
      - name: Build for Demo Mode
        run: |
          cd frontend
          echo "VITE_DEMO_MODE=true" > .env.production
          echo "VITE_BASE_PATH=/你的仓库名/" >> .env.production
          npm run build
        env:
          NODE_ENV: production
```

**替换 `/你的仓库名/` 为你的实际仓库名，例如 `/TeamsBot/`**

然后提交并推送：

```bash
git add .github/workflows/deploy-github-pages.yml
git commit -m "Update GitHub Pages base path"
git push
```

### 步骤 7: 等待部署完成

1. 访问仓库的 `Actions` 标签页
2. 你会看到 "Deploy to GitHub Pages" 工作流正在运行
3. 等待工作流完成（通常 2-3 分钟）
4. 完成后，访问：
   ```
   https://你的用户名.github.io/TeamsBot/
   ```

---

## 🎉 完成！

现在你可以分享这个链接给任何人：

```
https://你的用户名.github.io/TeamsBot/
```

任何人都可以：
- ✅ 访问演示版
- ✅ 查看 Teams 模拟器
- ✅ 创建和编辑 Live of Interest
- ✅ 测试所有功能

---

## 🔄 更新部署

每次你修改代码并推送到 GitHub 时，都会自动重新部署：

```bash
# 修改代码后
git add .
git commit -m "描述你的修改"
git push
```

几分钟后，GitHub Pages 会自动更新。

---

## 🎨 自定义域名（可选）

如果你有自己的域名，可以配置自定义域名：

1. 在仓库的 `Settings` → `Pages` 中
2. 在 `Custom domain` 输入你的域名
3. 在域名 DNS 设置中添加 CNAME 记录指向：
   ```
   你的用户名.github.io
   ```

---

## 🔧 故障排除

### 问题 1: 推送时要求用户名密码

**解决方案**: 使用 Personal Access Token 而不是密码。

### 问题 2: 部署失败

**解决方案**: 
1. 检查 `Actions` 标签页的错误日志
2. 确保 `VITE_BASE_PATH` 设置正确
3. 确保 GitHub Pages 已启用

### 问题 3: 页面显示 404

**解决方案**:
1. 检查 URL 是否正确（包含仓库名）
2. 确保 `base` 配置正确：
   ```
   https://你的用户名.github.io/仓库名/
   ```

### 问题 4: 页面空白

**解决方案**:
1. 打开浏览器开发者工具查看控制台错误
2. 检查 `vite.config.ts` 中的 `base` 配置
3. 确保 `.env.production` 包含正确的 `VITE_BASE_PATH`

---

## 📱 分享方式

### 方式 1: 直接分享链接
```
https://你的用户名.github.io/TeamsBot/
```

### 方式 2: 生成二维码
1. 访问 https://www.qr-code-generator.com/
2. 输入你的 GitHub Pages URL
3. 生成二维码分享

### 方式 3: 创建短链接
使用服务如：
- bit.ly
- tinyurl.com
- s.id

---

## 🌟 进阶选项

### 选项 A: 使用 Vercel 部署（推荐）

Vercel 提供更快的部署和更好的性能：

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 `Import Project`
4. 选择你的 GitHub 仓库
5. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**: 
     ```
     VITE_DEMO_MODE=true
     ```
6. 点击 `Deploy`

Vercel 会给你一个更好的 URL：
```
https://teams-bot-你的名字.vercel.app
```

### 选项 B: 使用 Netlify 部署

1. 访问 [Netlify](https://netlify.com)
2. 使用 GitHub 账号登录
3. 点击 `Add new site` → `Import an existing project`
4. 选择你的 GitHub 仓库
5. 配置：
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Environment variables**:
     ```
     VITE_DEMO_MODE=true
     ```
6. 点击 `Deploy site`

---

## 💡 提示

- 🚀 GitHub Pages 是完全免费的
- 🔄 每次推送都会自动部署（约 2-3 分钟）
- 🌐 支持 HTTPS（自动配置）
- 📱 支持所有设备（手机、平板、电脑）
- 🎨 可以自定义域名
- 📊 支持查看访问统计（需要额外配置 Google Analytics）

---

## 🆘 需要帮助？

如果遇到问题，可以：
1. 查看 GitHub Actions 日志
2. 查看浏览器控制台错误
3. 检查本文档的故障排除部分
4. 在 GitHub Issues 中提问

---

**祝部署顺利！** 🎉


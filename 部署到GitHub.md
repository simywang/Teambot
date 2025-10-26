# 🚀 快速部署到 GitHub

## 📝 第一步：在 GitHub 创建仓库

1. 打开浏览器访问: https://github.com/new
2. 填写信息：
   - **Repository name**: `TeamsBot`
   - **Description**: `Microsoft Teams Bot - Live of Interest 管理系统`
   - **选择**: Public（公开）
   - ⚠️ **不要勾选** "Add a README file"
3. 点击 **Create repository**

---

## 📤 第二步：推送代码到 GitHub

复制你在 GitHub 看到的仓库 URL（类似这样）：
```
https://github.com/你的用户名/TeamsBot.git
```

然后在终端运行以下命令：

### 1. 添加远程仓库
```bash
cd /Users/ximinwang/Documents/TeamsBot
git remote add origin https://github.com/你的用户名/TeamsBot.git
```
**⚠️ 记得把 `你的用户名` 替换成你的实际 GitHub 用户名！**

### 2. 推送代码
```bash
git branch -M main
git push -u origin main
```

系统会要求输入：
- **Username**: 你的 GitHub 用户名
- **Password**: 你的 Personal Access Token（见下方）

---

## 🔑 获取 Personal Access Token

如果没有 token，按以下步骤创建：

1. 访问: https://github.com/settings/tokens
2. 点击 `Generate new token` → `Generate new token (classic)`
3. 设置：
   - **Note**: `TeamsBot Deploy`
   - **Expiration**: `No expiration` 或选择一个期限
   - **权限**: 勾选 `repo`（所有子选项）
4. 点击 `Generate token`
5. **立即复制保存** token（只显示一次！）

使用这个 token 作为密码推送代码。

---

## 🌐 第三步：启用 GitHub Pages

### 3.1 进入仓库设置
1. 访问你的 GitHub 仓库: `https://github.com/你的用户名/TeamsBot`
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**

### 3.2 配置 Pages
在 `Build and deployment` 部分：
- **Source**: 选择 `GitHub Actions`
- 保存（会自动保存）

### 3.3 更新部署配置

你需要修改一个文件来设置正确的路径。

**在你的电脑上**，编辑这个文件：
```
/Users/ximinwang/Documents/TeamsBot/.github/workflows/deploy-github-pages.yml
```

找到这一段（第 32-37 行）：
```yaml
      - name: Build for Demo Mode
        run: |
          cd frontend
          echo "VITE_DEMO_MODE=true" > .env.production
          npm run build
```

改成：
```yaml
      - name: Build for Demo Mode
        run: |
          cd frontend
          echo "VITE_DEMO_MODE=true" > .env.production
          echo "VITE_BASE_PATH=/TeamsBot/" >> .env.production
          npm run build
```

**⚠️ 把 `/TeamsBot/` 改成你的实际仓库名！例如如果你的仓库叫 `my-teams-bot`，就改成 `/my-teams-bot/`**

保存后，提交并推送：
```bash
cd /Users/ximinwang/Documents/TeamsBot
git add .github/workflows/deploy-github-pages.yml
git commit -m "配置 GitHub Pages 部署路径"
git push
```

---

## ⏳ 第四步：等待部署完成

1. 访问你的仓库的 **Actions** 标签页:
   ```
   https://github.com/你的用户名/TeamsBot/actions
   ```

2. 你会看到 "Deploy to GitHub Pages" 工作流正在运行 ⏳

3. 等待约 2-3 分钟，直到显示 ✅ 绿色勾

4. 完成后，访问你的网站：
   ```
   https://你的用户名.github.io/TeamsBot/
   ```

---

## 🎉 完成！分享给同事

你的演示网站现在已经上线了！

**分享链接:**
```
https://你的用户名.github.io/TeamsBot/
```

任何人都可以访问：
- ✅ 无需登录
- ✅ 无需安装
- ✅ 在手机、平板、电脑上都能用
- ✅ 完整的 Teams 模拟器
- ✅ Live of Interest 管理功能

---

## 🔄 更新网站

以后如果你修改了代码，只需：

```bash
cd /Users/ximinwang/Documents/TeamsBot

# 查看改动
git status

# 添加改动
git add .

# 提交
git commit -m "描述你的修改"

# 推送
git push
```

推送后 2-3 分钟，网站会自动更新！

---

## 🆘 遇到问题？

### 问题 1: 推送时显示 "remote: Permission denied"

**原因**: Token 没有正确的权限  
**解决**: 重新创建 token 并确保勾选了 `repo` 权限

### 问题 2: GitHub Pages 显示 404

**原因**: Base path 没有正确配置  
**解决**: 
1. 检查 `.github/workflows/deploy-github-pages.yml` 中的 `VITE_BASE_PATH`
2. 确保路径格式为 `/仓库名/`（注意前后的斜杠）
3. 重新推送代码触发部署

### 问题 3: 网页显示空白

**原因**: Base path 配置错误导致资源加载失败  
**解决**: 
1. 打开浏览器开发者工具（F12）查看错误
2. 检查 Network 标签页，看资源是否 404
3. 修改 `VITE_BASE_PATH` 并重新部署

### 问题 4: Actions 失败

**原因**: 可能是 npm install 失败  
**解决**: 
1. 查看 Actions 日志详细错误
2. 确保 `frontend/package.json` 没有问题
3. 可以本地运行 `cd frontend && npm ci` 测试

---

## 💡 提示

如果你想要更好的 URL（不带 `.github.io`），可以考虑：

### 方案 A: 使用 Vercel（推荐）
1. 访问 https://vercel.com
2. 用 GitHub 登录
3. Import 你的仓库
4. 配置：
   - Root Directory: `frontend`
   - Framework: Vite
   - Environment: `VITE_DEMO_MODE=true`
5. Deploy

你会得到类似这样的 URL：
```
https://teams-bot-你的名字.vercel.app
```

### 方案 B: 使用 Netlify
1. 访问 https://netlify.com
2. 用 GitHub 登录
3. Import 你的仓库
4. 配置：
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Environment: `VITE_DEMO_MODE=true`
5. Deploy

---

## 📚 更多信息

详细指南请查看：
```bash
cat /Users/ximinwang/Documents/TeamsBot/GITHUB_DEPLOYMENT.md
```

---

**祝部署顺利！** 🚀

有问题随时问我！


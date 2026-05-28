# Talari Pradeep · Portfolio Website
### 🌐 [talaripradeep.info](https://talaripradeep.info)

A personal portfolio website for **Talari Pradeep** — Cloud & DevOps Engineer.

**Tech Stack:** Pure HTML · Vanilla CSS · Vanilla JavaScript  
**Hosting:** GitHub Pages (Free)  
**SSL:** Let's Encrypt via GitHub Pages (Free)  
**Domain:** talaripradeep.info (GoDaddy)

---

## 🚀 Quick Deploy to GitHub Pages

### Step 1 — Push this repo to GitHub
```bash
git init
git add .
git commit -m "🚀 Initial portfolio launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The `deploy.yml` workflow will automatically deploy

### Step 3 — Add Custom Domain (talaripradeep.info)
1. In **Settings → Pages**, enter `talaripradeep.info` in the Custom domain box
2. Click **Save** — GitHub will verify DNS

---

## 🔒 Free SSL Fix (GoDaddy DNS → GitHub Pages)

### GoDaddy DNS Records Required

Log into GoDaddy → DNS Management → Add/Edit these records:

| Type  | Name | Value                   | TTL |
|-------|------|-------------------------|-----|
| A     | @    | 185.199.108.153         | 600 |
| A     | @    | 185.199.109.153         | 600 |
| A     | @    | 185.199.110.153         | 600 |
| A     | @    | 185.199.111.153         | 600 |
| CNAME | www  | pradeeptalari14.github.io | 600 |

### SSL Certificate Steps
1. In GitHub Settings → Pages → delete domain → save → wait 60s → re-add domain → save
2. Wait 10–30 minutes for "TLS certificate is being provisioned" to show green ✓
3. Check **Enforce HTTPS** once the certificate is ready

---

## 📁 Project Structure
```
Domain/
├── index.html          # Main portfolio page
├── styles.css          # Premium CSS design system  
├── script.js           # Animations & interactions
├── CNAME               # Custom domain config
├── resume.pdf          # Your resume (add this!)
└── .github/
    └── workflows/
        └── deploy.yml  # Auto-deploy GitHub Actions
```

---

## ✏️ Customization

Update these in `index.html`:
- Your name, bio, and description
- Experience entries (company names, dates, bullets)
- Project cards (titles, descriptions, GitHub links)
- Certifications (names, years)
- Contact info (email, LinkedIn, GitHub)
- Add your actual `resume.pdf`

---

*Built with ❤️ · Hosted free on GitHub Pages · SSL by Let's Encrypt*

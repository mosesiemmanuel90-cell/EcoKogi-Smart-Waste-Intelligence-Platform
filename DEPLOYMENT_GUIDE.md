# EcoKogi Smart Waste Intelligence Platform

# Deployment Guide

## Prerequisites

Before deployment, ensure the following are installed:

- Node.js (v18 or later)
- Git
- Visual Studio Code
- npm
- GitHub Account
- Supabase Project
- Vercel Account

---

## Clone Repository

```bash
git clone https://github.com/mosesiemmanuel90-cell/EcoKogi-Smart-Waste-Intelligence-Platform.git
```

---

## Navigate to Project

```bash
cd EcoKogi-Smart-Waste-Intelligence-Platform
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

The application will run at:

http://localhost:5173

---

## Build Production Version

```bash
npm run build
```

---

## Deploy to Vercel

1. Login to Vercel
2. Import the GitHub repository
3. Configure environment variables (if required)
4. Click **Deploy**
5. Wait for deployment to complete
6. Access the live application using the generated Vercel URL

---

## Supabase Configuration

Configure:

- Database
- Authentication
- Storage
- API Keys
- Row Level Security (RLS)

---

## Troubleshooting

### Build fails

Run:

```bash
npm install
```

then

```bash
npm run build
```

### Missing packages

```bash
npm install
```

### GitHub Push Issues

Verify:

```bash
git remote -v
```

### Deployment Issues

Check:

- Environment Variables
- Build Logs
- Supabase Connection

---

## Production Status

Deployment Target:

**Vercel**

Version:

**1.0**

Environment:

**Production**
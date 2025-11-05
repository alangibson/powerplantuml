# Quick Start Guide

Get the PlantUML Editor running on Atlassian Forge in 10 minutes.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Atlassian account created
- [ ] Confluence Cloud development site created

## Step-by-Step Setup

### 1. Install Forge CLI (2 minutes)

```bash
npm install -g @forge/cli
```

Verify installation:
```bash
forge --version
```

### 2. Authenticate (1 minute)

```bash
forge login
```

This opens your browser - log in with your Atlassian account.

### 3. Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd powerplantuml

# Install root dependencies
npm install
```

### 4. Build Frontend (3 minutes)

```bash
cd static/plantuml-editor
npm install
npm run build
cd ../..
```

### 5. Register and Deploy (2 minutes)

```bash
# Register the app (first time only)
forge register

# Deploy to Forge
forge deploy
```

### 6. Install to Confluence (1 minute)

```bash
forge install
```

Select:
- Product: **Confluence**
- Site: Your development site URL

### 7. Test It Out!

1. Open your Confluence site
2. Create or edit a page
3. Type `/plantuml`
4. Start creating diagrams!

## Development Workflow

### Quick Test Cycle

```bash
# Make changes to Vue app
cd static/plantuml-editor
# Edit files in src/
npm run build
cd ../..

# Use tunnel for instant testing
forge tunnel
```

### Deploy Changes

```bash
# Rebuild frontend
cd static/plantuml-editor
npm run build
cd ../..

# Deploy
forge deploy
```

## Common Commands

```bash
# View logs
forge logs --follow

# Uninstall app
forge uninstall

# List installed apps
forge install --list

# Deploy to production
forge deploy --environment production
```

## Troubleshooting

### "Command not found: forge"

**Solution:** Install Forge CLI globally:
```bash
npm install -g @forge/cli
```

### "Build failed"

**Solution:** Rebuild frontend:
```bash
cd static/plantuml-editor
rm -rf node_modules build
npm install
npm run build
```

### "App not appearing in Confluence"

**Solution:** Reinstall:
```bash
forge uninstall
forge install
```

## Next Steps

- Read [README.md](README.md) for full feature list
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [MIGRATION.md](MIGRATION.md) for architecture details

## Need Help?

- **Logs:** `forge logs --follow`
- **Docs:** [https://developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge/)
- **Community:** [https://community.developer.atlassian.com/](https://community.developer.atlassian.com/)

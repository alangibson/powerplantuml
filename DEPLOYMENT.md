# Deployment Guide: PlantUML Editor on Atlassian Forge

This guide walks you through deploying the PlantUML Editor Forge app to Atlassian Cloud.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Building the Application](#building-the-application)
4. [Local Development](#local-development)
5. [Deployment](#deployment)
6. [Installation](#installation)
7. [Updating Your App](#updating-your-app)
8. [Production Deployment](#production-deployment)
9. [Marketplace Distribution](#marketplace-distribution)
10. [Monitoring and Logs](#monitoring-and-logs)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js:** Version 18.x or later
- **npm:** Version 8.x or later
- **Forge CLI:** Latest version

### Required Accounts

- **Atlassian Account:** Free account at [atlassian.com](https://www.atlassian.com)
- **Atlassian Cloud Site:** Development site for testing
- **Forge Developer Account:** Register at [developer.atlassian.com](https://developer.atlassian.com)

### Installation

1. **Install Node.js**
   ```bash
   # Download from https://nodejs.org/
   # Or use nvm
   nvm install 18
   nvm use 18
   ```

2. **Install Forge CLI**
   ```bash
   npm install -g @forge/cli
   ```

3. **Verify Installation**
   ```bash
   forge --version
   # Should output version 6.0.0 or later
   ```

## Initial Setup

### 1. Authenticate with Forge

```bash
forge login
```

This will:
- Open a browser window
- Prompt you to log in with your Atlassian account
- Generate and store an API token
- Confirm successful authentication

### 2. Create Development Site

If you don't have a Confluence Cloud development site:

1. Visit [https://developer.atlassian.com/console/myapps/](https://developer.atlassian.com/console/myapps/)
2. Click "Create" → "Create a site"
3. Choose "Confluence" as the product
4. Name your site (e.g., `yourname-dev`)
5. Wait for provisioning to complete

### 3. Register Your App

The app needs to be registered with Forge before first deployment.

```bash
# Navigate to project root
cd /path/to/powerplantuml

# Register the app
forge register
```

You'll be prompted for:
- **App name:** Enter "plantuml-editor" (or your preferred name)
- This creates a unique app ID in the Atlassian ecosystem

**Important:** The app ID will be added to your `manifest.yml` automatically. Keep this ID - you'll need it for all deployments.

## Building the Application

### 1. Build the Frontend

Build the Vue.js Custom UI:

```bash
# Navigate to the static directory
cd static/plantuml-editor

# Install dependencies
npm install

# Build the Vue app
npm run build
```

This creates the `static/plantuml-editor/build/` directory with optimized assets.

**Verify the build:**
```bash
ls -la build/
# Should show index.html, js/, css/, and static/ directories
```

### 2. Install Backend Dependencies

```bash
# Navigate back to project root
cd ../..

# Install Forge backend dependencies
npm install
```

## Local Development

Forge provides a tunnel for local development without deploying.

### 1. Start the Tunnel

```bash
forge tunnel
```

This command:
- Builds and packages your app
- Creates a secure tunnel to Atlassian cloud
- Watches for code changes
- Enables hot-reloading for development

**Output:**
```
✔ Bundling and packing app...
✔ Creating tunnel...
✔ Tunnel is ready!

Your app is now running at:
https://developer.atlassian.com/console/install/...
```

### 2. Install to Development Site

During the tunnel session, you'll be prompted:
```
? Select a product: Confluence
? Select a site: yourname-dev.atlassian.net
```

The app will install automatically on your development site.

### 3. Testing Changes

With the tunnel running:

1. **Frontend changes:**
   ```bash
   # In a new terminal
   cd static/plantuml-editor
   npm run build
   ```
   Refresh the browser to see changes.

2. **Backend changes:**
   Modify files in `src/`
   The tunnel automatically reloads the backend.

### 4. Stop the Tunnel

Press `Ctrl+C` to stop the tunnel session.

## Deployment

### Development Deployment

Deploy to a development environment:

```bash
# Ensure frontend is built
npm run build

# Deploy to Forge
forge deploy --environment development
```

**What happens:**
- Frontend assets are uploaded to Forge
- Backend functions are packaged and deployed
- A new version is created
- Previous development version is replaced

### Install to Your Site

After deployment, install the app:

```bash
forge install
```

Select:
- **Product:** Confluence
- **Site:** Your development site URL

**Or install via URL:**
```bash
forge install --site yourname-dev.atlassian.net --product confluence
```

### Verify Deployment

1. Navigate to your Confluence site
2. Create or open a page
3. Look for PlantUML Editor in:
   - Page macros (`/plantuml`)
   - Content byline items
   - Global pages (Apps menu)

## Installation

### User Installation Flow

After deployment, users can access the app:

### 1. As a Macro

In any Confluence page:
1. Type `/` to open the macro browser
2. Search for "PlantUML"
3. Select "PlantUML Diagram"
4. The editor opens

### 2. As a Global Page

1. Click the Apps menu (≡) in Confluence
2. Look for "PlantUML Editor"
3. Click to open the full-page editor

### 3. As a Content Byline Item

On any Confluence page, look for the PlantUML icon in the content byline.

## Updating Your App

### Making Updates

1. **Make code changes**
2. **Rebuild frontend** (if changed)
   ```bash
   cd static/plantuml-editor
   npm run build
   cd ../..
   ```
3. **Deploy new version**
   ```bash
   forge deploy
   ```

### Version Management

Forge automatically versions your deployments:

```bash
# View deployment history
forge deploy --list

# Deploy to specific environment
forge deploy --environment staging
forge deploy --environment production
```

### Upgrade Installations

After deploying, existing installations will:
- Automatically use the new version (for development)
- Require explicit upgrade (for production)

To upgrade production installations:
```bash
forge install --upgrade
```

## Production Deployment

### 1. Create Production Environment

```bash
forge environments create production
```

### 2. Deploy to Production

```bash
# Build frontend
npm run build

# Deploy to production
forge deploy --environment production
```

### 3. Promote to Users

For Marketplace apps, submit for review:
1. Log into [Atlassian Marketplace](https://marketplace.atlassian.com/manage/plugins)
2. Create a new listing
3. Upload your app
4. Submit for security review

For private installations:
```bash
forge install --environment production --site your-production-site.atlassian.net
```

### 4. Production Checklist

- [ ] All features tested in development
- [ ] User acceptance testing completed
- [ ] Performance testing completed
- [ ] Security review passed (for Marketplace)
- [ ] Documentation updated
- [ ] Support plan in place
- [ ] Rollback plan prepared
- [ ] Monitoring configured

## Marketplace Distribution

### Prerequisites for Marketplace

1. **App Security Review**
   - Required for all Marketplace apps
   - Automated scanning for vulnerabilities
   - Manual review by Atlassian

2. **Privacy Policy**
   - Required if collecting user data
   - Must be publicly accessible

3. **Support Information**
   - Support email or ticketing system
   - Documentation URL

### Submission Process

1. **Prepare App Listing**
   ```bash
   # Generate app descriptor
   forge deploy --environment production
   ```

2. **Create Marketplace Listing**
   - Go to [https://marketplace.atlassian.com/manage](https://marketplace.atlassian.com/manage)
   - Click "Create new app"
   - Select "Forge app"
   - Fill in app details:
     - Name: "PlantUML Editor for Confluence"
     - Summary: Brief description
     - Description: Full feature list
     - Screenshots: At least 3 high-quality images
     - Categories: Productivity, Diagramming
     - Pricing: Free or Paid

3. **Submit for Review**
   - Click "Submit for review"
   - Wait for automated security scan
   - Respond to any security findings
   - Wait for approval (typically 3-5 business days)

4. **Publish**
   - Once approved, publish to Marketplace
   - App becomes available to all users

### Pricing Models

- **Free:** No charge to users
- **Paid:** Monthly/annual subscription
- **Freemium:** Free tier + paid features
- **Trial:** 30-day free trial, then paid

### Marketplace Resources

- **Vendor Agreement:** https://developer.atlassian.com/platform/marketplace/vendor-agreement/
- **Listing Guidelines:** https://developer.atlassian.com/platform/marketplace/listing-guidelines/
- **Marketing Resources:** https://developer.atlassian.com/platform/marketplace/marketing-resources/

## Monitoring and Logs

### Viewing Logs

**Real-time logs during tunnel:**
```bash
forge tunnel --verbose
```

**Deployed app logs:**
```bash
forge logs --follow
```

**Filter logs:**
```bash
# Show only errors
forge logs --filter level=error

# Show specific function
forge logs --filter function=render-diagram

# Show recent logs
forge logs --tail 100
```

### Monitoring Dashboard

Access the Forge console:
1. Visit [https://developer.atlassian.com/console/myapps/](https://developer.atlassian.com/console/myapps/)
2. Select your app
3. View:
   - **Invocations:** Function call counts
   - **Errors:** Error rates and types
   - **Performance:** Response times
   - **Resources:** Storage and bandwidth usage

### Error Tracking

Configure error tracking in your functions:

```javascript
// src/index.js
resolver.define('render-diagram', async (req) => {
  try {
    // Your code
  } catch (error) {
    console.error('Error rendering diagram:', {
      error: error.message,
      stack: error.stack,
      payload: req.payload,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
});
```

### Performance Monitoring

Monitor function performance:
```bash
forge performance --function render-diagram
```

## Troubleshooting

### Common Deployment Issues

#### 1. Build Fails

**Problem:** Frontend build errors

**Solution:**
```bash
cd static/plantuml-editor
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Deployment Fails

**Problem:** "Failed to deploy" error

**Check:**
- Manifest.yml syntax
- All required fields present
- App ID is correct

**Validate manifest:**
```bash
forge lint
```

#### 3. App Not Appearing

**Problem:** App doesn't show in Confluence

**Solution:**
1. Verify installation:
   ```bash
   forge install --list
   ```
2. Check site URL is correct
3. Reinstall:
   ```bash
   forge uninstall
   forge install
   ```

#### 4. Function Errors

**Problem:** Backend functions failing

**Debug:**
```bash
forge logs --follow
```

Check:
- Permissions in manifest.yml
- External fetch domains are whitelisted
- Function code has no syntax errors

#### 5. Resource Quota Exceeded

**Problem:** "Resource quota exceeded" during deployment

**Solution:**
- Reduce frontend bundle size
- Remove unused dependencies
- Optimize images
- Contact Atlassian for quota increase

### Getting Help

**Forge CLI Help:**
```bash
forge --help
forge deploy --help
```

**Community Support:**
- [Developer Community Forum](https://community.developer.atlassian.com/)
- [Forge Slack Channel](https://atlassian.design/get-started/slack/)

**Documentation:**
- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Forge API Reference](https://developer.atlassian.com/platform/forge/apis-reference/)

**Support Tickets:**
For critical issues, create a support ticket at [support.atlassian.com](https://support.atlassian.com)

## Command Reference

### Essential Commands

```bash
# Authentication
forge login
forge logout

# App Registration
forge register

# Development
forge tunnel
forge tunnel --verbose

# Deployment
forge deploy
forge deploy --environment production
forge deploy --no-verify  # Skip verification

# Installation
forge install
forge install --site yoursite.atlassian.net
forge install --upgrade
forge uninstall

# Logs
forge logs
forge logs --follow
forge logs --filter level=error

# Environments
forge environments create [name]
forge environments list
forge environments delete [name]

# Utilities
forge lint                 # Validate manifest
forge settings list        # List settings
forge settings set [key] [value]
```

### Advanced Commands

```bash
# CI/CD Integration
forge deploy --non-interactive --environment production

# App Variables (for environment-specific config)
forge variables set KEY value
forge variables list
forge variables delete KEY

# Inspect deployed resources
forge inspect
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Forge

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Forge CLI
        run: npm install -g @forge/cli

      - name: Build Frontend
        run: |
          cd static/plantuml-editor
          npm install
          npm run build

      - name: Deploy to Forge
        env:
          FORGE_EMAIL: ${{ secrets.FORGE_EMAIL }}
          FORGE_API_TOKEN: ${{ secrets.FORGE_API_TOKEN }}
        run: |
          forge deploy --environment production --non-interactive
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - cd static/plantuml-editor
    - npm install
    - npm run build
  artifacts:
    paths:
      - static/plantuml-editor/build/

deploy:
  stage: deploy
  image: node:18
  script:
    - npm install -g @forge/cli
    - forge deploy --environment production --non-interactive
  only:
    - main
```

## Best Practices

### 1. Version Control

- Always commit `manifest.yml`
- Don't commit `.forge/` directory
- Don't commit `build/` directories
- Use `.gitignore` properly

### 2. Testing

- Test in development environment first
- Use separate Confluence sites for dev/staging/prod
- Test all module locations (macro, global page, byline)
- Test with different user permissions

### 3. Deployment

- Build frontend before every deploy
- Use environment-specific deployments
- Tag releases in version control
- Document changes in release notes

### 4. Monitoring

- Regularly check logs for errors
- Monitor function invocation counts
- Track resource usage
- Set up alerts for critical errors

### 5. Security

- Request minimum permissions needed
- Regularly update dependencies
- Follow Atlassian security guidelines
- Test for XSS and injection vulnerabilities

## Next Steps

After successful deployment:

1. **User Training:** Create documentation for end users
2. **Feedback Loop:** Set up channels for user feedback
3. **Monitoring:** Configure alerts and monitoring
4. **Iterate:** Plan feature updates based on usage
5. **Support:** Establish support processes

## Additional Resources

- **Forge Getting Started:** https://developer.atlassian.com/platform/forge/getting-started/
- **Forge Manifest Reference:** https://developer.atlassian.com/platform/forge/manifest-reference/
- **Forge CLI Reference:** https://developer.atlassian.com/platform/forge/cli-reference/
- **Confluence Cloud API:** https://developer.atlassian.com/cloud/confluence/rest/
- **Example Apps:** https://developer.atlassian.com/platform/forge/example-apps/

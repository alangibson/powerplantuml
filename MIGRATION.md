# Migration Guide: PlantUML Editor to Atlassian Forge

This guide explains how to migrate the PlantUML Editor application to run on Atlassian Forge.

## Table of Contents

1. [Overview](#overview)
2. [What is Atlassian Forge?](#what-is-atlassian-forge)
3. [Key Differences: Connect vs Forge](#key-differences-connect-vs-forge)
4. [Migration Steps](#migration-steps)
5. [Architecture Changes](#architecture-changes)
6. [Code Changes](#code-changes)
7. [Testing the Migration](#testing-the-migration)
8. [Troubleshooting](#troubleshooting)

## Overview

This migration transforms the PlantUML Editor from a standalone Vue.js web application into an Atlassian Forge application that runs natively within Confluence Cloud.

### Migration Summary

- **From:** Standalone Vue.js web application
- **To:** Atlassian Forge Custom UI application
- **Target Platform:** Confluence Cloud
- **UI Framework:** Vue.js 2.x (unchanged)
- **Backend:** Forge Functions (serverless)

## What is Atlassian Forge?

Atlassian Forge is a cloud app development platform that allows developers to build secure, performant apps for Atlassian products without managing infrastructure.

### Key Benefits

- **No Infrastructure Management:** Forge handles hosting, scaling, and security
- **Built-in Security:** Automatic security updates and compliance
- **Native Integration:** Deep integration with Atlassian products
- **Serverless Functions:** Backend logic runs on Forge's infrastructure
- **Cost Effective:** Pay only for what you use (free tier available)

### Forge Components Used

1. **Custom UI:** Hosts the Vue.js frontend
2. **Forge Functions:** Serverless backend for API calls
3. **Confluence Modules:** Integration points in Confluence

## Key Differences: Connect vs Forge

| Aspect | Atlassian Connect | Atlassian Forge |
|--------|------------------|----------------|
| **Hosting** | Self-hosted or external | Atlassian cloud infrastructure |
| **Security** | OAuth, JWT tokens | Built-in security with scoped permissions |
| **Backend** | Custom server required | Serverless functions |
| **Frontend** | iframe-based | Custom UI with sandboxed environment |
| **API Access** | Direct REST API calls | Through Forge API with automatic auth |
| **External APIs** | Direct access | Must be declared in manifest |
| **Deployment** | Manual server deployment | `forge deploy` CLI command |
| **Pricing** | Infrastructure costs | Consumption-based pricing |

## Migration Steps

### 1. Prerequisites

Before starting the migration, ensure you have:

- [x] Node.js 18.x or later installed
- [x] Forge CLI installed globally: `npm install -g @forge/cli`
- [x] An Atlassian Cloud developer site for testing
- [x] Forge developer account (free at [developer.atlassian.com](https://developer.atlassian.com))

### 2. Project Structure Changes

The original project structure:
```
powerplantuml/
├── src/                    # Vue components
├── public/                 # Static assets
├── package.json            # Vue dependencies
└── vue.config.js          # Vue build config
```

The new Forge project structure:
```
powerplantuml/
├── src/
│   └── index.js           # Forge backend functions
├── static/
│   └── plantuml-editor/
│       ├── src/           # Vue components (moved)
│       ├── public/        # Static assets (moved)
│       ├── build/         # Built Vue app (generated)
│       ├── package.json   # Vue + Forge bridge deps
│       └── vue.config.js  # Vue build config
├── manifest.yml           # Forge app manifest
└── package.json           # Forge dependencies
```

### 3. Backend Migration

#### Original Architecture
The original app made direct HTTP calls to PlantUML servers from the browser:

```javascript
// Old approach - direct browser call
const response = await fetch(`https://www.plantuml.com/plantuml/svg/${encoded}`);
```

#### New Forge Architecture
Forge uses backend functions that proxy external API calls:

```javascript
// New approach - through Forge backend
import { invoke } from '@forge/bridge';
const result = await invoke('render-diagram', { encodedDiagram, format: 'svg' });
```

**Why this change?**
- Forge Custom UI has strict Content Security Policy (CSP)
- External API calls must go through backend functions
- Provides better security and control over external dependencies

### 4. Frontend Migration

#### Forge Bridge Integration

The Vue app now integrates with Forge using `@forge/bridge`:

```javascript
// src/lib/forgeBridge.js
import { invoke, view } from '@forge/bridge';

// Initialize Forge context
export async function initializeForgeBridge() {
  const context = await view.getContext();
  return context;
}

// Call backend functions
export async function renderDiagram(encodedDiagram, format = 'svg') {
  return await invoke('render-diagram', { encodedDiagram, format });
}
```

#### Vue Component Updates

Update Vue components to use the Forge bridge instead of direct HTTP calls:

```javascript
// Before (Direct HTTP)
async renderDiagram() {
  const response = await axios.get(`${PLANTUML_URL}/svg/${encoded}`);
  this.svgData = response.data;
}

// After (Forge Bridge)
import { renderDiagram } from '@/lib/forgeBridge';

async renderDiagram() {
  const result = await renderDiagram(encoded, 'svg');
  this.svgData = result.data;
}
```

### 5. Storage Migration

#### Local Storage
The app previously used browser localStorage and IndexedDB. This continues to work in Forge Custom UI.

#### New: Confluence Storage
Forge enables storing diagrams in Confluence page properties:

```javascript
import { saveDiagram, loadDiagram } from '@/lib/forgeBridge';

// Save to Confluence page
await saveDiagram(pageId, diagramSource, 'my-diagram');

// Load from Confluence page
const diagram = await loadDiagram(pageId, 'my-diagram');
```

### 6. Configuration Changes

#### Environment Variables

**Before (.env.development):**
```bash
VUE_APP_URL="http://localhost:8080/"
VUE_APP_SERVER="http://localhost:4000/"
VUE_APP_CDN="http://localhost:4000/"
```

**After:**
Environment variables are not needed as Forge handles the backend through the manifest.yml external fetch permissions:

```yaml
permissions:
  external:
    fetch:
      backend:
        - 'https://www.plantuml.com'
```

#### Build Configuration

**Updated vue.config.js:**
```javascript
module.exports = {
  outputDir: 'build',      // Changed from 'dist' to 'build'
  publicPath: './',        // Relative paths for Forge hosting
  // ... rest of config
}
```

### 7. Permissions and Scopes

The Forge app requires specific permissions defined in `manifest.yml`:

```yaml
permissions:
  scopes:
    - read:confluence-content.all    # Read Confluence pages
    - write:confluence-content       # Modify content
    - read:confluence-space.summary  # Access space info
    - read:confluence-props          # Read page properties
    - write:confluence-props         # Write page properties
    - read:confluence-user           # Access user information
  external:
    fetch:
      backend:
        - 'http://www.plantuml.com'
        - 'https://www.plantuml.com'
```

**Important:** Always request minimum permissions needed for your app to function.

## Architecture Changes

### Request Flow

#### Before (Standalone)
```
User → Vue App → PlantUML Server → Vue App → User
```

#### After (Forge)
```
User → Vue App (Custom UI)
         ↓
      Forge Bridge
         ↓
      Forge Function → PlantUML Server
         ↓
      Forge Function → Confluence API (storage)
         ↓
      Vue App (Custom UI) → User
```

### Security Model

#### Content Security Policy (CSP)

Forge Custom UI enforces strict CSP:
- No inline scripts
- No external script loading
- All resources must be bundled
- External API calls only through backend functions

#### Authentication

Forge handles authentication automatically:
- No JWT tokens needed
- No OAuth flows required
- Automatic user context
- Scoped API access

## Code Changes

### Required Changes

1. **Install Forge Bridge**
   ```bash
   cd static/plantuml-editor
   npm install @forge/bridge
   ```

2. **Create Forge Bridge Module**
   Create `src/lib/forgeBridge.js` (already provided in migration)

3. **Update Components**
   Replace direct API calls with Forge bridge invocations

4. **Update Build Scripts**
   ```json
   {
     "scripts": {
       "build": "vue-cli-service build"
     }
   }
   ```

### Optional Enhancements

1. **Confluence Integration**
   - Save diagrams to page properties
   - Load diagrams from Confluence storage
   - Integrate with Confluence macros

2. **User Context**
   - Access current user information
   - Personalize the experience
   - Track user preferences in Confluence

3. **Collaborative Features**
   - Share diagrams via Confluence
   - Comment on diagrams
   - Version control through Confluence history

## Testing the Migration

### Local Development

1. **Build the Vue App**
   ```bash
   cd static/plantuml-editor
   npm install
   npm run build
   ```

2. **Install Forge Dependencies**
   ```bash
   cd ../..
   npm install
   ```

3. **Start Forge Tunnel**
   ```bash
   forge tunnel
   ```
   This allows live testing without deployment.

4. **Test in Browser**
   - Navigate to your Confluence development site
   - Open a page where the app is installed
   - Test all functionality

### Validation Checklist

- [ ] App appears in Confluence
- [ ] Diagram rendering works
- [ ] Save functionality works (if implemented)
- [ ] Load functionality works (if implemented)
- [ ] All UI elements render correctly
- [ ] No console errors
- [ ] Backend functions execute successfully

## Troubleshooting

### Common Issues

#### 1. "Blocked by CSP" Errors

**Problem:** External resources are blocked by Content Security Policy

**Solution:** Ensure all external API calls go through Forge backend functions, not directly from the frontend.

#### 2. Module Not Found Errors

**Problem:** Vue can't find @forge/bridge

**Solution:**
```bash
cd static/plantuml-editor
npm install @forge/bridge --save
npm run build
```

#### 3. Build Output Not Found

**Problem:** Forge can't find the built assets

**Solution:** Verify `vue.config.js` has:
```javascript
outputDir: 'build'
```

And manifest.yml points to:
```yaml
resources:
  - key: plantuml-editor
    path: static/plantuml-editor/build
```

#### 4. Permission Denied Errors

**Problem:** Forge function can't access Confluence API

**Solution:** Check manifest.yml permissions and ensure required scopes are listed.

#### 5. External Fetch Blocked

**Problem:** Can't reach PlantUML server

**Solution:** Verify external fetch permissions in manifest.yml:
```yaml
permissions:
  external:
    fetch:
      backend:
        - 'https://www.plantuml.com'
```

### Debug Mode

Enable Forge debug logging:
```bash
forge tunnel --verbose
```

Check browser console for Custom UI logs.

Check terminal for backend function logs.

### Getting Help

- **Forge Documentation:** https://developer.atlassian.com/platform/forge/
- **Community Forums:** https://community.developer.atlassian.com/
- **GitHub Issues:** Report bugs in the repository

## Next Steps

After completing the migration:

1. Read the [DEPLOYMENT.md](DEPLOYMENT.md) guide
2. Test thoroughly in development environment
3. Deploy to staging for user acceptance testing
4. Submit to Atlassian Marketplace (if public distribution)
5. Deploy to production

## Migration Checklist

- [x] Forge CLI installed
- [x] Developer account created
- [x] Project structure updated
- [x] Manifest.yml created
- [x] Backend functions implemented
- [x] Forge bridge integrated
- [x] Vue app moved to static directory
- [x] Build configuration updated
- [x] Dependencies installed
- [ ] Local testing completed
- [ ] Permissions verified
- [ ] Documentation updated
- [ ] Ready for deployment

## Additional Resources

- [Forge Custom UI Documentation](https://developer.atlassian.com/platform/forge/custom-ui/)
- [Forge API Reference](https://developer.atlassian.com/platform/forge/apis-reference/)
- [Confluence Cloud REST API](https://developer.atlassian.com/cloud/confluence/rest/v1/)
- [Atlassian Forge Examples](https://developer.atlassian.com/platform/forge/example-apps/)

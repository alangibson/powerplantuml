import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

/**
 * Resolver function for Custom UI
 */
resolver.define('resolver', async (req) => {
  console.log('Resolver called with:', req);
  return {
    success: true,
    context: req.context,
  };
});

/**
 * Render PlantUML diagram
 * This function proxies requests to PlantUML server
 */
resolver.define('render-diagram', async (req) => {
  const { encodedDiagram, format = 'svg' } = req.payload;

  if (!encodedDiagram) {
    return {
      error: 'No diagram provided',
    };
  }

  try {
    // Call PlantUML server to render the diagram
    const plantUmlUrl = `https://www.plantuml.com/plantuml/${format}/${encodedDiagram}`;

    const response = await api.fetch(plantUmlUrl);

    if (!response.ok) {
      throw new Error(`PlantUML server returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (format === 'svg') {
      const svgData = await response.text();
      return {
        success: true,
        data: svgData,
        contentType,
      };
    } else {
      // For PNG and other binary formats
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        success: true,
        data: base64,
        contentType,
      };
    }
  } catch (error) {
    console.error('Error rendering diagram:', error);
    return {
      error: error.message,
    };
  }
});

/**
 * Save diagram to Confluence page properties
 */
resolver.define('save-diagram', async (req) => {
  const { pageId, diagramData, diagramName } = req.payload;

  if (!pageId || !diagramData) {
    return {
      error: 'Missing required parameters',
    };
  }

  try {
    const propertyKey = `plantuml-${diagramName || Date.now()}`;

    // Store diagram in page properties
    const response = await api.asApp().requestConfluence(
      route`/wiki/rest/api/content/${pageId}/property/${propertyKey}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: propertyKey,
          value: {
            diagram: diagramData,
            savedAt: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to save diagram: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      propertyKey,
      data,
    };
  } catch (error) {
    console.error('Error saving diagram:', error);
    return {
      error: error.message,
    };
  }
});

/**
 * Load diagram from Confluence page properties
 */
resolver.define('load-diagram', async (req) => {
  const { pageId, diagramName } = req.payload;

  if (!pageId || !diagramName) {
    return {
      error: 'Missing required parameters',
    };
  }

  try {
    const propertyKey = `plantuml-${diagramName}`;

    const response = await api.asApp().requestConfluence(
      route`/wiki/rest/api/content/${pageId}/property/${propertyKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          notFound: true,
        };
      }
      throw new Error(`Failed to load diagram: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.value,
    };
  } catch (error) {
    console.error('Error loading diagram:', error);
    return {
      error: error.message,
    };
  }
});

export const handler = resolver.getDefinitions();

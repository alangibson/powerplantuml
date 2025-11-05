/**
 * Forge Bridge Integration
 * This module provides utilities for communicating with Forge backend functions
 */

import { invoke, view } from '@forge/bridge';

/**
 * Initialize Forge bridge
 */
export async function initializeForgeBridge() {
  try {
    const context = await view.getContext();
    console.log('Forge context:', context);
    return context;
  } catch (error) {
    console.error('Failed to initialize Forge bridge:', error);
    throw error;
  }
}

/**
 * Render a PlantUML diagram using Forge backend
 * @param {string} encodedDiagram - Encoded PlantUML diagram
 * @param {string} format - Output format (svg, png, etc.)
 * @returns {Promise<Object>} Rendered diagram data
 */
export async function renderDiagram(encodedDiagram, format = 'svg') {
  try {
    const result = await invoke('render-diagram', {
      encodedDiagram,
      format,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error rendering diagram:', error);
    throw error;
  }
}

/**
 * Save a diagram to Confluence page properties
 * @param {string} pageId - Confluence page ID
 * @param {string} diagramData - Diagram source code
 * @param {string} diagramName - Name/identifier for the diagram
 * @returns {Promise<Object>} Save result
 */
export async function saveDiagram(pageId, diagramData, diagramName) {
  try {
    const result = await invoke('save-diagram', {
      pageId,
      diagramData,
      diagramName,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error saving diagram:', error);
    throw error;
  }
}

/**
 * Load a diagram from Confluence page properties
 * @param {string} pageId - Confluence page ID
 * @param {string} diagramName - Name/identifier for the diagram
 * @returns {Promise<Object>} Loaded diagram data
 */
export async function loadDiagram(pageId, diagramName) {
  try {
    const result = await invoke('load-diagram', {
      pageId,
      diagramName,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error loading diagram:', error);
    throw error;
  }
}

/**
 * Get the current Confluence context
 * @returns {Promise<Object>} Context information
 */
export async function getContext() {
  try {
    return await view.getContext();
  } catch (error) {
    console.error('Error getting context:', error);
    throw error;
  }
}

export default {
  initializeForgeBridge,
  renderDiagram,
  saveDiagram,
  loadDiagram,
  getContext,
};

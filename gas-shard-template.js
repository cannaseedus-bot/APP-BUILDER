/**
 * ASX Builder Shard Template
 * Google Apps Script Web App Template for Deploying Builder Shards
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Create new Google Apps Script project
 * 2. Copy this template and customize for your builder
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 4. Copy deployment URL to BUILDER-SHARDS-MANIFEST.json
 * 5. Update sw.js with new shard endpoint
 *
 * @version 1.0
 * @builder [CUSTOMIZE: kuhul|xjson|scx|asx|layout|style|component|animation]
 */

// ============================================================================
// CONFIGURATION - Customize for each builder
// ============================================================================

const SHARD_CONFIG = {
  name: '[BUILDER_NAME]', // e.g., "KUHUL Compiler"
  version: '1.0.0',
  builder_type: '[BUILDER_TYPE]', // e.g., "compiler", "generator", "optimizer"
  capabilities: [
    // List builder capabilities
    'capability_1',
    'capability_2'
  ]
};

// ============================================================================
// MAIN ENTRY POINT - doPost handler
// ============================================================================

/**
 * Main entry point for POST requests
 * @param {Object} e - Event object from Google Apps Script
 * @returns {ContentService.TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Parse incoming request
    const request = JSON.parse(e.postData.contents);
    const action = request.action;

    // Log request (helpful for debugging)
    console.log(`Shard: ${SHARD_CONFIG.name} | Action: ${action}`);

    // Route to appropriate handler
    let result;
    switch(action) {
      // Add your builder-specific actions here
      case 'compile':
        result = handleCompile(request);
        break;

      case 'generate':
        result = handleGenerate(request);
        break;

      case 'optimize':
        result = handleOptimize(request);
        break;

      case 'validate':
        result = handleValidate(request);
        break;

      case 'health':
        result = healthCheck();
        break;

      default:
        result = errorResponse(`Unknown action: ${action}`);
    }

    // Return JSON response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Error handling
    console.error('Shard Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse(error.message)))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET request handler (for health checks)
 */
function doGet(e) {
  const health = e.parameter.health === 'true';

  if (health) {
    return ContentService
      .createTextOutput(JSON.stringify(healthCheck()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      shard: SHARD_CONFIG.name,
      message: 'Shard is online. Use POST requests for operations.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// ACTION HANDLERS - Customize these for your builder
// ============================================================================

/**
 * Handle compile action
 * EXAMPLE: KUHUL Compiler would implement CSS → Symbolic Atoms
 */
function handleCompile(request) {
  // CUSTOMIZE THIS FOR YOUR BUILDER
  const input = request.input || request.source || request.code;

  if (!input) {
    return errorResponse('Missing input for compilation');
  }

  try {
    // Your builder logic here
    const compiled = performCompilation(input, request);

    return successResponse({
      compiled: compiled,
      input_size: input.length,
      output_size: compiled.length,
      compression_ratio: (1 - compiled.length / input.length).toFixed(4)
    });
  } catch (error) {
    return errorResponse(`Compilation failed: ${error.message}`);
  }
}

/**
 * Handle generate action
 * EXAMPLE: Component Factory would generate UI components
 */
function handleGenerate(request) {
  // CUSTOMIZE THIS FOR YOUR BUILDER
  const spec = request.spec || request.config;

  if (!spec) {
    return errorResponse('Missing specification for generation');
  }

  try {
    // Your builder logic here
    const generated = performGeneration(spec, request);

    return successResponse({
      generated: generated,
      type: spec.type || 'unknown'
    });
  } catch (error) {
    return errorResponse(`Generation failed: ${error.message}`);
  }
}

/**
 * Handle optimize action
 * EXAMPLE: SCX Compressor would optimize compression algorithm selection
 */
function handleOptimize(request) {
  // CUSTOMIZE THIS FOR YOUR BUILDER
  const data = request.data || request.input;

  if (!data) {
    return errorResponse('Missing data for optimization');
  }

  try {
    // Your builder logic here
    const optimized = performOptimization(data, request);

    return successResponse({
      optimized: optimized,
      optimization_gain: request.optimization_gain || 'N/A'
    });
  } catch (error) {
    return errorResponse(`Optimization failed: ${error.message}`);
  }
}

/**
 * Handle validate action
 * EXAMPLE: XJSON Builder would validate XJSON schemas
 */
function handleValidate(request) {
  // CUSTOMIZE THIS FOR YOUR BUILDER
  const target = request.target || request.data;

  if (!target) {
    return errorResponse('Missing target for validation');
  }

  try {
    // Your builder logic here
    const validation = performValidation(target, request);

    return successResponse({
      valid: validation.valid,
      errors: validation.errors || [],
      warnings: validation.warnings || []
    });
  } catch (error) {
    return errorResponse(`Validation failed: ${error.message}`);
  }
}

/**
 * Health check endpoint
 */
function healthCheck() {
  return {
    ok: true,
    shard: SHARD_CONFIG.name,
    version: SHARD_CONFIG.version,
    builder_type: SHARD_CONFIG.builder_type,
    capabilities: SHARD_CONFIG.capabilities,
    status: 'online',
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// BUILDER-SPECIFIC LOGIC - Implement these for your builder
// ============================================================================

/**
 * Perform compilation (CUSTOMIZE FOR YOUR BUILDER)
 */
function performCompilation(input, options) {
  // EXAMPLE: KUHUL Compiler
  // Convert CSS to symbolic atoms
  // "display: flex" → "⚛d:f"

  // YOUR IMPLEMENTATION HERE
  return input; // Placeholder - replace with actual logic
}

/**
 * Perform generation (CUSTOMIZE FOR YOUR BUILDER)
 */
function performGeneration(spec, options) {
  // EXAMPLE: Component Factory
  // Generate UI component from specification

  // YOUR IMPLEMENTATION HERE
  return {}; // Placeholder - replace with actual logic
}

/**
 * Perform optimization (CUSTOMIZE FOR YOUR BUILDER)
 */
function performOptimization(data, options) {
  // EXAMPLE: SCX Compressor
  // Select best compression algorithm and apply it

  // YOUR IMPLEMENTATION HERE
  return data; // Placeholder - replace with actual logic
}

/**
 * Perform validation (CUSTOMIZE FOR YOUR BUILDER)
 */
function performValidation(target, options) {
  // EXAMPLE: XJSON Builder
  // Validate XJSON structure against schema

  // YOUR IMPLEMENTATION HERE
  return {
    valid: true,
    errors: [],
    warnings: []
  }; // Placeholder - replace with actual logic
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create success response
 */
function successResponse(data) {
  return {
    ok: true,
    shard_id: SHARD_CONFIG.name,
    timestamp: new Date().toISOString(),
    data: data
  };
}

/**
 * Create error response
 */
function errorResponse(message) {
  return {
    ok: false,
    shard_id: SHARD_CONFIG.name,
    timestamp: new Date().toISOString(),
    error: message
  };
}

/**
 * Measure execution time
 */
function measureExecutionTime(fn) {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;

  return {
    result: result,
    execution_time_ms: duration
  };
}

// ============================================================================
// EXAMPLE BUILDER IMPLEMENTATIONS
// ============================================================================

/**
 * EXAMPLE: KUHUL Compiler Shard Implementation
 */
function exampleKuhulCompiler(css) {
  const symbolMap = {
    'display: flex': '.⚛d:f',
    'justify-content: center': '.⚛jc:c',
    'align-items: center': '.⚛ai:c',
    'padding: 10px': '.⚛p:10p',
    'margin: 8px': '.⚛m:8p',
    'border-radius: 8px': '.⚛br:8p'
  };

  let compressed = css;
  for (const [pattern, symbol] of Object.entries(symbolMap)) {
    compressed = compressed.replace(new RegExp(pattern, 'g'), symbol);
  }

  return compressed;
}

/**
 * EXAMPLE: Component Factory Shard Implementation
 */
function exampleComponentFactory(spec) {
  const componentTemplate = {
    button: `
      <button class="⚛d:f ⚛jc:c ⚛ai:c ⚛p:10p ⚛br:8p">
        {label}
      </button>
    `,
    card: `
      <div class="⚛p:10p ⚛br:8p ⚛bg:surface">
        <h3>{title}</h3>
        <p>{content}</p>
      </div>
    `
  };

  const template = componentTemplate[spec.type] || componentTemplate.button;

  let component = template;
  for (const [key, value] of Object.entries(spec.props || {})) {
    component = component.replace(`{${key}}`, value);
  }

  return component;
}

/**
 * EXAMPLE: SCX Compressor Shard Implementation
 */
function exampleSCXCompressor(data, algorithm) {
  const algorithms = {
    'symbolic': (d) => exampleKuhulCompiler(d),
    'dictionary': (d) => {
      // Simple dictionary compression
      const words = d.split(/\s+/);
      const dict = {};
      let counter = 0;

      return words.map(word => {
        if (!dict[word]) {
          dict[word] = String.fromCharCode(97 + counter++);
        }
        return dict[word];
      }).join(' ');
    },
    'huffman': (d) => {
      // Huffman encoding would go here
      return d; // Placeholder
    }
  };

  const compressor = algorithms[algorithm] || algorithms.symbolic;
  return compressor(data);
}

/**
 * EXAMPLE: Layout Generator Shard Implementation
 */
function exampleLayoutGenerator(spec) {
  const gridTemplate = `
    .grid-container {
      display: grid;
      grid-template-columns: repeat(${spec.columns || 3}, 1fr);
      gap: ${spec.gap || '1rem'};
      padding: ${spec.padding || '1rem'};
    }

    @media (max-width: 768px) {
      .grid-container {
        grid-template-columns: 1fr;
      }
    }
  `;

  return gridTemplate.trim();
}

/**
 * EXAMPLE: Style System Shard Implementation
 */
function exampleStyleSystem(colors) {
  const tokens = {
    colors: colors || {
      primary: '#16f2aa',
      secondary: '#38bdf8',
      background: '#020617',
      text: '#e8fff6'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
      xl: '4rem'
    },
    typography: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    }
  };

  return tokens;
}

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/*
  DEPLOYMENT CHECKLIST:

  □ 1. Customize SHARD_CONFIG with your builder details
  □ 2. Implement builder-specific action handlers
  □ 3. Test locally with example data
  □ 4. Create new Google Apps Script project
  □ 5. Copy and paste this code
  □ 6. Deploy as Web App (Execute as: Me, Access: Anyone)
  □ 7. Copy deployment URL
  □ 8. Update BUILDER-SHARDS-MANIFEST.json with URL
  □ 9. Update sw.js BUILDER_SHARDS object
  □ 10. Test with curl or Postman
  □ 11. Monitor logs in GAS execution log
  □ 12. Document any builder-specific configuration

  TEST COMMAND:
  curl -X POST [YOUR_SHARD_URL] \
    -H "Content-Type: application/json" \
    -d '{"action":"health"}'

  Expected response:
  {
    "ok": true,
    "shard": "[BUILDER_NAME]",
    "version": "1.0.0",
    "status": "online"
  }
*/

/**
 * C@@L @GRAMS Glyph-Weight Mapping
 * Glyphs are compressed weight carriers
 * From CALL-GRAMS-PRACTICAL-RUNTIME.md
 */

const GLYPH_TABLE = {
  // Base glyphs
  '@':     { base: 1.0,  hue: 45,  shape: 'cube' },
  '@@':    { base: 2.0,  hue: 135, shape: 'sphere' },
  '@@@':   { base: 3.0,  hue: 225, shape: 'torus' },
  '@@@@':  { base: 4.0,  hue: 315, shape: 'pyramid' },

  // Operator glyphs
  '⤍':     { base: 0.87, type: 'operator', function: 'transform' },
  '↻':     { base: 0.93, type: 'operator', function: 'rotate' },
  '⟲':     { base: 0.76, type: 'operator', function: '3d_transform' },
  '⟿':     { base: 0.82, type: 'operator', function: 'vector' },

  // Mathematical constants
  'π':     { base: 3.14159, type: 'constant' },
  'φ':     { base: 1.61803, type: 'constant' },
  'e':     { base: 2.71828, type: 'constant' },
  'τ':     { base: 6.28318, type: 'constant' },

  // Constraint glyphs
  '⊗':     { base: 1.0, type: 'constraint', operation: 'multiply' },
  '⊕':     { base: 1.0, type: 'constraint', operation: 'add' },
  '≠':     { base: 0.0, type: 'constraint', operation: 'forbidden' },
  '∂':     { base: 1.0, type: 'constraint', operation: 'derivative' }
};

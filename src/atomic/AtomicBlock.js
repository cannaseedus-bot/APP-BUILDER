// File: /src/atomic/AtomicBlock.js
// ATOMIC BLOCK - Core data structure for ASX/XCFE system

export class AtomicBlock {
  constructor(type, control = [], variable = {}, view = null, links = []) {
    this['@type'] = type;
    this['@control'] = control;      // XCFE vectors
    this['@variable'] = variable;    // State vectors
    this['@view'] = view;            // DOM/AST projection
    this['@links'] = links;          // Connections to other blocks

    // Auto-generated metadata
    this['@id'] = `atomic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this['@timestamp'] = Date.now();
    this['@version'] = '1.0.0';
  }

  toXJSON() {
    return JSON.stringify(this, null, 2);
  }

  static fromXJSON(json) {
    const data = JSON.parse(json);
    return new AtomicBlock(
      data['@type'],
      data['@control'],
      data['@variable'],
      data['@view'],
      data['@links']
    );
  }

  // Core operations
  updateVariable(key, value) {
    this['@variable'][key] = value;
    this['@timestamp'] = Date.now();
  }

  addControl(vector) {
    this['@control'].push(vector);
  }

  linkTo(otherBlock) {
    this['@links'].push(otherBlock['@id']);
  }

  // K'uhul cycle operations
  executeKuhulCycle() {
    return {
      '@Pop': this.phaseActivate(),
      '@Wo': this.phaseIntention(),
      '@Sek': this.phaseExecute(),
      '@Xul': this.phaseTransform(),
      '@Ch\'en': this.phaseRender()
    };
  }

  phaseActivate() {
    return {
      phase: '@Pop',
      activated: true,
      timestamp: Date.now(),
      blockId: this['@id'],
      energy: 1.0
    };
  }

  phaseIntention() {
    return {
      phase: '@Wo',
      intentions: this['@control'].map(v => `Execute: ${v}`),
      priority: this['@control'].length > 0 ? 'high' : 'low'
    };
  }

  phaseExecute() {
    return {
      phase: '@Sek',
      executed: true,
      operations: this['@control'].length,
      state: this['@variable']
    };
  }

  phaseTransform() {
    return {
      phase: '@Xul',
      transformed: true,
      output: this['@view']
    };
  }

  phaseRender() {
    return {
      phase: '@Ch\'en',
      rendered: true,
      view: this['@view'],
      complete: true
    };
  }
}

export default AtomicBlock;

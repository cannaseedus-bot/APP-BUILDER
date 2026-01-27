// File: /src/agents/MicroAgent.js
// MICRO-AGENT - Simple pattern matching and task execution agents

import AtomicBlock from '../atomic/AtomicBlock.js';

export class MicroAgent {
  constructor(name, capabilities) {
    this.name = name;
    this.capabilities = capabilities; // Array of what it can do
    this.state = {
      active: false,
      lastActivated: 0,
      successCount: 0,
      failureCount: 0
    };
    this.atomics = []; // Atomic blocks this agent has created
  }

  activate(inputData, ngramBlocks = []) {
    this.state.active = true;
    this.state.lastActivated = Date.now();

    // Simple pattern matching agent
    if (this.capabilities.includes('@pattern_match')) {
      return this.patternMatch(inputData, ngramBlocks);
    }

    // Simple question detection
    if (this.capabilities.includes('@question_detect')) {
      return this.detectQuestion(inputData, ngramBlocks);
    }

    // Command detection
    if (this.capabilities.includes('@command_detect')) {
      return this.detectCommand(inputData, ngramBlocks);
    }

    return null;
  }

  patternMatch(inputData, ngramBlocks) {
    // Check for greeting patterns
    const greetingPatterns = ['hello', 'hi', 'hey', 'greetings', 'howdy', 'sup'];
    const tokens = inputData.toLowerCase().split(/\s+/);

    const hasGreeting = tokens.some(token =>
      greetingPatterns.includes(token)
    );

    if (hasGreeting) {
      const greetingBlock = new AtomicBlock(
        'greeting_detected',
        ['@respond', '@acknowledge', '@greet'],
        {
          detected: true,
          pattern: 'greeting',
          confidence: 0.9,
          originalText: inputData,
          agent: this.name
        },
        'Greeting pattern detected',
        ngramBlocks.map(b => b['@id'])
      );

      this.atomics.push(greetingBlock);
      this.state.successCount++;
      return greetingBlock;
    }

    return null;
  }

  detectQuestion(inputData, ngramBlocks) {
    const questionWords = ['what', 'where', 'when', 'why', 'how', 'who', 'which', '?'];
    const tokens = inputData.toLowerCase().split(/\s+/);

    const isQuestion = tokens.some(token =>
      questionWords.includes(token.replace('?', ''))
    ) || inputData.includes('?');

    if (isQuestion) {
      const questionBlock = new AtomicBlock(
        'question_detected',
        ['@answer', '@research', '@clarify'],
        {
          isQuestion: true,
          questionType: this.detectQuestionType(tokens),
          confidence: 0.85,
          originalText: inputData,
          agent: this.name
        },
        'Question detected',
        ngramBlocks.map(b => b['@id'])
      );

      this.atomics.push(questionBlock);
      this.state.successCount++;
      return questionBlock;
    }

    return null;
  }

  detectCommand(inputData, ngramBlocks) {
    const commandWords = ['create', 'delete', 'update', 'get', 'find', 'show',
                         'forge', 'drop', 'make', 'build', 'start', 'stop'];
    const tokens = inputData.toLowerCase().split(/\s+/);

    const hasCommand = tokens.some(token =>
      commandWords.includes(token)
    );

    if (hasCommand) {
      const commandType = this.detectCommandType(tokens);
      const commandBlock = new AtomicBlock(
        'command_detected',
        ['@execute', '@process', '@action'],
        {
          isCommand: true,
          commandType: commandType,
          confidence: 0.8,
          originalText: inputData,
          agent: this.name
        },
        `Command detected: ${commandType}`,
        ngramBlocks.map(b => b['@id'])
      );

      this.atomics.push(commandBlock);
      this.state.successCount++;
      return commandBlock;
    }

    return null;
  }

  detectQuestionType(tokens) {
    if (tokens.includes('what')) return 'factual';
    if (tokens.includes('how')) return 'process';
    if (tokens.includes('why')) return 'causal';
    if (tokens.includes('when')) return 'temporal';
    if (tokens.includes('where')) return 'spatial';
    if (tokens.includes('who')) return 'personal';
    if (tokens.includes('which')) return 'selection';
    return 'general';
  }

  detectCommandType(tokens) {
    if (tokens.includes('create') || tokens.includes('make') || tokens.includes('forge')) {
      return 'create';
    }
    if (tokens.includes('delete') || tokens.includes('remove') || tokens.includes('drop')) {
      return 'delete';
    }
    if (tokens.includes('update') || tokens.includes('change') || tokens.includes('modify')) {
      return 'update';
    }
    if (tokens.includes('get') || tokens.includes('show') || tokens.includes('find')) {
      return 'query';
    }
    if (tokens.includes('start') || tokens.includes('begin') || tokens.includes('launch')) {
      return 'start';
    }
    if (tokens.includes('stop') || tokens.includes('end') || tokens.includes('terminate')) {
      return 'stop';
    }
    return 'generic';
  }

  getStats() {
    return {
      name: this.name,
      capabilities: this.capabilities,
      state: this.state,
      atomicsCreated: this.atomics.length
    };
  }
}

export default MicroAgent;

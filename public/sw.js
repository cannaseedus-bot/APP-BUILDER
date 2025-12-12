// ============================================================
// K'UHUL π API INFERENCE SYSTEM v2.0
// Complete DOM/CSS runtime with chat history and IDB
// ============================================================

class KuhulAPI {
    constructor(config = {}) {
        // Configuration
        this.config = {
            modelName: 'kuhul-pi-7b',
            compressionRatio: 0.001,
            maxTokens: 2048,
            temperature: 0.7,
            ...config
        };
        
        // Math constants for encoding
        this.constants = {
            π: 3.141592653589793,
            e: 2.718281828459045,
            φ: 1.618033988749895,
            τ: 6.283185307179586,
            γ: 0.5772156649 // Euler-Mascheroni
        };
        
        // State
        this.conversationId = null;
        this.isInferencing = false;
        this.tokenBuffer = [];
        this.abortController = null;
        
        // Caches
        this.glyphCache = new Map();
        this.embeddingCache = new Map();
        this.cssCache = new Map();
        
        // Initialize
        this.initIDB();
        this.initCSSRuntime();
        this.initEventSystem();
    }
    
    // ============================================================
    // 1. INDEXEDDB CHAT HISTORY SYSTEM
    // ============================================================
    
    initIDB() {
        this.dbName = 'kuhul_chat_db';
        this.dbVersion = 2;
        this.db = null;
        
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Conversations store
            if (!db.objectStoreNames.contains('conversations')) {
                const store = db.createObjectStore('conversations', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                store.createIndex('created_at', 'created_at', { unique: false });
                store.createIndex('updated_at', 'updated_at', { unique: false });
            }
            
            // Messages store
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                store.createIndex('conversation_id', 'conversation_id', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('role', 'role', { unique: false });
            }
            
            // Model cache store
            if (!db.objectStoreNames.contains('model_cache')) {
                const store = db.createObjectStore('model_cache', { 
                    keyPath: 'key'
                });
                store.createIndex('expires', 'expires', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.emit('db:ready');
            this.autoCleanCache();
        };
        
        request.onerror = (event) => {
            console.error('IDB initialization failed:', event.target.error);
            this.emit('db:error', event.target.error);
        };
    }
    
    // Conversation management
    async createConversation(title = 'New Conversation') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations'], 'readwrite');
            const store = transaction.objectStore('conversations');
            
            const conversation = {
                title,
                created_at: Date.now(),
                updated_at: Date.now(),
                message_count: 0,
                tokens_used: 0,
                model: this.config.modelName
            };
            
            const request = store.add(conversation);
            
            request.onsuccess = (event) => {
                this.conversationId = event.target.result;
                this.emit('conversation:created', { id: this.conversationId, ...conversation });
                resolve({ id: this.conversationId, ...conversation });
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async saveMessage(role, content, tokens = 0) {
        if (!this.conversationId) {
            await this.createConversation();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages', 'conversations'], 'readwrite');
            const messageStore = transaction.objectStore('messages');
            const convStore = transaction.objectStore('conversations');
            
            const message = {
                conversation_id: this.conversationId,
                role,
                content,
                tokens,
                timestamp: Date.now(),
                css_encoded: this.encodeToCSS(content),
                glyph_count: this.calculateGlyphs(content)
            };
            
            const messageRequest = messageStore.add(message);
            
            messageRequest.onsuccess = (event) => {
                // Update conversation stats
                const convRequest = convStore.get(this.conversationId);
                
                convRequest.onsuccess = (e) => {
                    const conv = e.target.result;
                    conv.updated_at = Date.now();
                    conv.message_count = (conv.message_count || 0) + 1;
                    conv.tokens_used = (conv.tokens_used || 0) + tokens;
                    
                    convStore.put(conv);
                };
                
                this.emit('message:saved', message);
                resolve({ id: event.target.result, ...message });
            };
            
            messageRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getConversations(limit = 50) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations'], 'readonly');
            const store = transaction.objectStore('conversations');
            const index = store.index('updated_at');
            
            const request = index.openCursor(null, 'prev');
            const conversations = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && conversations.length < limit) {
                    conversations.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(conversations);
                }
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getMessages(conversationId, limit = 100) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('conversation_id');
            
            const range = IDBKeyRange.only(conversationId);
            const request = index.openCursor(range);
            const messages = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && messages.length < limit) {
                    messages.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(messages);
                }
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async deleteConversation(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations', 'messages'], 'readwrite');
            const convStore = transaction.objectStore('conversations');
            const msgStore = transaction.objectStore('messages');
            
            // Delete conversation
            const convRequest = convStore.delete(id);
            
            // Delete all messages in conversation
            const msgIndex = msgStore.index('conversation_id');
            const range = IDBKeyRange.only(id);
            const msgCursor = msgIndex.openCursor(range);
            
            msgCursor.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    msgStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            
            transaction.oncomplete = () => {
                this.emit('conversation:deleted', id);
                resolve(true);
            };
            
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // ============================================================
    // 2. CSS RUNTIME & GLYPH ENCODING SYSTEM
    // ============================================================
    
    initCSSRuntime() {
        // Create style element for runtime CSS
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'kuhul-runtime-css';
        document.head.appendChild(this.styleElement);
        
        // Inject base styles
        this.injectBaseStyles();
        
        // Create DOM observers
        this.initDOMObservers();
    }
    
    injectBaseStyles() {
        const baseCSS = `
/* K'UHUL π RUNTIME STYLES */
.kuhul-api-runtime {
    --kuhul-pi: ${this.constants.π};
    --kuhul-e: ${this.constants.e};
    --kuhul-phi: ${this.constants.φ};
    --kuhul-tau: ${this.constants.τ};
    --kuhul-gamma: ${this.constants.γ};
    
    /* Inference states */
    --state-idle: 0;
    --state-processing: 1;
    --state-streaming: 2;
    --state-error: 3;
    
    /* Colors */
    --color-primary: 160; /* Green */
    --color-secondary: 200; /* Blue */
    --color-accent: 330; /* Pink */
    --color-neutral: 280; /* Purple */
}

/* Token visualization */
.token-glyph {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    margin: 0 0.1em;
    vertical-align: middle;
    transition: all 0.2s ease;
}

/* Inference progress */
.inference-progress {
    --progress: 0;
    height: 3px;
    background: linear-gradient(
        90deg,
        hsl(var(--color-primary), 100%, 50%) 0%,
        hsl(var(--color-primary), 100%, 50%) calc(var(--progress) * 100%),
        transparent calc(var(--progress) * 100%),
        transparent 100%
    );
    transition: --progress 0.1s linear;
}

/* Chat messages */
.kuhul-message {
    --message-role: 'user';
    --message-tokens: 0;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 1rem;
    animation: message-appear 0.3s ease-out;
    position: relative;
    overflow: hidden;
}

.kuhul-message.user {
    --message-role: 'user';
    background: hsla(var(--color-primary), 100%, 50%, 0.1);
    border-left: 4px solid hsl(var(--color-primary), 100%, 50%);
}

.kuhul-message.assistant {
    --message-role: 'assistant';
    background: hsla(var(--color-secondary), 100%, 50%, 0.1);
    border-left: 4px solid hsl(var(--color-secondary), 100%, 50%);
}

.kuhul-message.system {
    --message-role: 'system';
    background: hsla(var(--color-neutral), 100%, 50%, 0.1);
    border-left: 4px solid hsl(var(--color-neutral), 100%, 50%);
}

.kuhul-message.streaming::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
        90deg,
        transparent,
        hsl(var(--color-accent), 100%, 50%),
        transparent
    );
    animation: stream-pulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes message-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes stream-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
}

@keyframes inference-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Typing indicator */
.typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 1rem;
}

.typing-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: hsl(var(--color-primary), 100%, 50%);
    animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

/* Glyph effects */
.glyph-encoded {
    position: relative;
    display: inline-block;
}

.glyph-encoded::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
        circle,
        hsla(var(--color-primary), 100%, 50%, 0.1) 0%,
        transparent 70%
    );
    transform: translate(-50%, -50%);
    z-index: -1;
    opacity: var(--glyph-intensity, 0.3);
}
        `;
        
        this.styleElement.textContent = baseCSS;
    }
    
    encodeToCSS(text) {
        // Encode text into CSS-compatible format
        const chars = text.split('');
        const encoded = chars.map((char, i) => {
            const code = char.charCodeAt(0);
            const hue = (code * this.constants.φ) % 360;
            const saturation = 50 + (code % 50);
            const lightness = 40 + Math.sin(code * this.constants.π / 180) * 20;
            
            return {
                char,
                code,
                css: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                rotation: (code * this.constants.π) % 360,
                scale: 0.8 + Math.sin(code * this.constants.e / 100) * 0.2
            };
        });
        
        // Create CSS class for this encoding
        const cssClass = `kuhul-encoded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const cssRules = `
.${cssClass} {
    display: inline-block;
    position: relative;
}

.${cssClass} span {
    display: inline-block;
    transform: 
        rotate(calc(var(--char-rotation) * 1deg))
        scale(var(--char-scale));
    transition: all 0.3s ease;
}

.${cssClass}:hover span {
    transform: 
        rotate(calc(var(--char-rotation) * 1deg + 5deg))
        scale(calc(var(--char-scale) * 1.1));
    filter: brightness(1.2);
}
        `;
        
        // Inject CSS
        this.styleElement.textContent += cssRules;
        
        return {
            cssClass,
            encoded,
            length: chars.length
        };
    }
    
    calculateGlyphs(text) {
        // Calculate approximate token/glyph count
        const words = text.split(/\s+/).length;
        const chars = text.length;
        const tokens = Math.ceil(chars / 4); // Approximation
        const glyphs = Math.ceil(tokens / 1004); // K'UHUL compression
        
        return {
            words,
            chars,
            tokens,
            glyphs,
            compression: glyphs / tokens
        };
    }
    
    // ============================================================
    // 3. INFERENCE ENGINE
    // ============================================================
    
    async inference(prompt, options = {}) {
        if (this.isInferencing) {
            throw new Error('Inference already in progress');
        }
        
        this.isInferencing = true;
        this.abortController = new AbortController();
        this.tokenBuffer = [];
        
        const {
            temperature = this.config.temperature,
            maxTokens = this.config.maxTokens,
            stream = true,
            conversationId = this.conversationId
        } = options;
        
        try {
            // Save user message
            const userMessage = await this.saveMessage('user', prompt);
            
            // Start inference
            this.emit('inference:start', { prompt, options });
            
            if (stream) {
                return this.streamInference(prompt, {
                    temperature,
                    maxTokens,
                    conversationId
                });
            } else {
                const result = await this.completeInference(prompt, {
                    temperature,
                    maxTokens,
                    conversationId
                });
                
                // Save assistant response
                await this.saveMessage('assistant', result.content, result.tokens);
                
                this.isInferencing = false;
                this.emit('inference:complete', result);
                
                return result;
            }
        } catch (error) {
            this.isInferencing = false;
            this.emit('inference:error', error);
            throw error;
        }
    }
    
    async streamInference(prompt, options) {
        const { temperature, maxTokens, conversationId } = options;
        
        // Create a ReadableStream for streaming response
        const stream = new ReadableStream({
            start: (controller) => {
                this.emit('stream:start');
                
                // Simulate streaming (in real implementation, this would connect to model)
                const tokens = this.simulateTokenGeneration(prompt, {
                    temperature,
                    maxTokens
                });
                
                let buffer = '';
                let tokenCount = 0;
                
                const streamNext = () => {
                    if (tokenCount >= maxTokens || this.abortController.signal.aborted) {
                        controller.close();
                        this.isInferencing = false;
                        
                        // Save final message
                        this.saveMessage('assistant', buffer, tokenCount);
                        
                        this.emit('stream:end', { content: buffer, tokens: tokenCount });
                        return;
                    }
                    
                    const nextToken = tokens.next();
                    if (nextToken.done) {
                        controller.close();
                        this.isInferencing = false;
                        
                        // Save final message
                        this.saveMessage('assistant', buffer, tokenCount);
                        
                        this.emit('stream:end', { content: buffer, tokens: tokenCount });
                        return;
                    }
                    
                    const token = nextToken.value;
                    buffer += token;
                    tokenCount++;
                    
                    // Enqueue token
                    controller.enqueue({
                        token,
                        content: buffer,
                        tokens: tokenCount,
                        done: false
                    });
                    
                    this.emit('stream:token', {
                        token,
                        buffer,
                        count: tokenCount
                    });
                    
                    // Schedule next token
                    setTimeout(streamNext, 30 + Math.random() * 70); // Simulate variable speed
                };
                
                // Start streaming
                streamNext();
            },
            
            cancel: () => {
                this.abortController.abort();
                this.isInferencing = false;
                this.emit('stream:cancelled');
            }
        });
        
        return stream;
    }
    
    async completeInference(prompt, options) {
        // Non-streaming completion
        const { temperature, maxTokens } = options;
        
        // Simulate completion
        const tokens = this.simulateTokenGeneration(prompt, { temperature, maxTokens });
        let content = '';
        let tokenCount = 0;
        
        for (const token of tokens) {
            if (tokenCount >= maxTokens) break;
            content += token;
            tokenCount++;
        }
        
        return {
            content,
            tokens: tokenCount,
            glyphs: this.calculateGlyphs(content).glyphs,
            finish_reason: tokenCount >= maxTokens ? 'length' : 'stop',
            processing_time: tokenCount * 50 // Simulated processing time
        };
    }
    
    *simulateTokenGeneration(prompt, options) {
        // Simulate token generation with K'UHUL encoding
        const responses = [
            "I understand your question about K'UHUL π encoding. The system uses mathematical constants",
            "The compression ratio of 1000:1 is achieved through glyph-based token encoding",
            "CSS runtime inference enables real-time processing without external dependencies",
            "IndexedDB provides persistent chat history with efficient storage",
            "DOM API integration allows seamless interaction with existing web applications",
            "Mathematical encoding using π, e, φ, and τ constants ensures precise decoding",
            "The system can process natural language while maintaining compression efficiency",
            "Streaming responses are generated token-by-token with visual feedback",
            "Each glyph encodes approximately 1004 tokens using K'UHUL mathematics",
            "The inference engine adapts based on device capabilities and network conditions"
        ];
        
        const baseResponse = responses[Math.floor(Math.random() * responses.length)];
        const words = baseResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            
            // Occasionally yield punctuation
            if (Math.random() < 0.2 && i < words.length - 1) {
                yield [', ', '. ', '! ', '? '][Math.floor(Math.random() * 4)];
            }
        }
        
        // Add some additional context
        const additional = [
            " This approach reduces model size while maintaining accuracy.",
            " The encoding system is based on mathematical principles.",
            " You can integrate this with any web application.",
            " Compression happens in real-time during inference.",
            " The system learns from conversation history."
        ];
        
        const extra = additional[Math.floor(Math.random() * additional.length)];
        const extraWords = extra.split(' ');
        
        for (let i = 0; i < extraWords.length; i++) {
            yield extraWords[i] + (i < extraWords.length - 1 ? ' ' : '');
        }
    }
    
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.isInferencing = false;
            this.emit('inference:aborted');
            return true;
        }
        return false;
    }
    
    // ============================================================
    // 4. DOM API & UI INTEGRATION
    // ============================================================
    
    initDOMObservers() {
        // Observe DOM for chat elements
        this.chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.autoAttachChat(node);
                        }
                    });
                }
            });
        });
        
        // Start observing
        this.chatObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Attach to existing elements
        document.querySelectorAll('[data-kuhul-chat]').forEach(el => {
            this.attachChatInterface(el);
        });
    }
    
    attachChatInterface(container) {
        if (!container || container.hasAttribute('data-kuhul-attached')) {
            return;
        }
        
        container.setAttribute('data-kuhul-attached', 'true');
        
        // Create chat interface
        const chatId = `kuhul-chat-${Date.now()}`;
        container.innerHTML = `
            <div id="${chatId}" class="kuhul-chat-container">
                <div class="kuhul-chat-header">
                    <h3>K'UHUL π Assistant</h3>
                    <div class="kuhul-chat-controls">
                        <button class="kuhul-btn new-chat" title="New Chat">+</button>
                        <button class="kuhul-btn history" title="History">📚</button>
                        <button class="kuhul-btn settings" title="Settings">⚙️</button>
                    </div>
                </div>
                
                <div class="kuhul-chat-messages"></div>
                
                <div class="kuhul-chat-input-area">
                    <div class="kuhul-progress-bar"></div>
                    <div class="kuhul-input-wrapper">
                        <textarea 
                            class="kuhul-input" 
                            placeholder="Ask K'UHUL π anything..."
                            rows="3"
                        ></textarea>
                        <button class="kuhul-send-btn">
                            <span class="send-icon">⟿</span>
                        </button>
                    </div>
                    <div class="kuhul-input-footer">
                        <span class="token-counter">Tokens: 0</span>
                        <span class="glyph-counter">Glyphs: 0</span>
                        <button class="kuhul-btn stop-btn" disabled>Stop</button>
                    </div>
                </div>
            </div>
        `;
        
        // Inject chat-specific CSS
        this.injectChatStyles(chatId);
        
        // Bind events
        this.bindChatEvents(container, chatId);
        
        // Load conversation history
        this.loadChatHistory(chatId);
        
        this.emit('chat:attached', { container, chatId });
    }
    
    injectChatStyles(chatId) {
        const chatCSS = `
#${chatId} {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #0a0a1a 0%, #15152b 100%);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

#${chatId} .kuhul-chat-header {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#${chatId} .kuhul-chat-header h3 {
    margin: 0;
    color: #16f2aa;
    font-size: 1.2rem;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(22, 242, 170, 0.3);
}

#${chatId} .kuhul-chat-controls {
    display: flex;
    gap: 0.5rem;
}

#${chatId} .kuhul-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

#${chatId} .kuhul-btn:hover {
    background: rgba(22, 242, 170, 0.2);
    border-color: #16f2aa;
    transform: translateY(-1px);
}

#${chatId} .kuhul-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

#${chatId} .kuhul-chat-input-area {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

#${chatId} .kuhul-progress-bar {
    height: 2px;
    margin-bottom: 0.5rem;
    background: linear-gradient(
        90deg,
        #16f2aa 0%,
        #00aaff 50%,
        #9c88ff 100%
    );
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

#${chatId} .kuhul-input-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
}

#${chatId} .kuhul-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 0.75rem;
    color: white;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    transition: all 0.2s ease;
    min-height: 3rem;
    max-height: 10rem;
}

#${chatId} .kuhul-input:focus {
    outline: none;
    border-color: #16f2aa;
    box-shadow: 0 0 0 2px rgba(22, 242, 170, 0.2);
    background: rgba(255, 255, 255, 0.08);
}

#${chatId} .kuhul-send-btn {
    background: linear-gradient(135deg, #16f2aa 0%, #00aaff 100%);
    border: none;
    border-radius: 0.75rem;
    width: 3rem;
    height: 3rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

#${chatId} .kuhul-send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(22, 242, 170, 0.4);
}

#${chatId} .kuhul-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#${chatId} .kuhul-input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
}

#${chatId} .token-counter,
#${chatId} .glyph-counter {
    font-family: 'Courier New', monospace;
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
}

#${chatId} .stop-btn {
    background: rgba(255, 51, 102, 0.2);
    border-color: #ff3366;
}

#${chatId} .stop-btn:hover:not(:disabled) {
    background: rgba(255, 51, 102, 0.3);
}

#${chatId} .message-typing {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(22, 242, 170, 0.1);
    border-radius: 1rem;
    border-left: 4px solid #16f2aa;
}

#${chatId} .message-error {
    background: rgba(255, 51, 102, 0.1);
    border-left: 4px solid #ff3366;
    color: #ff6b6b;
}
        `;
        
        this.styleElement.textContent += chatCSS;
    }
    
    bindChatEvents(container, chatId) {
        const chatElement = container.querySelector(`#${chatId}`);
        if (!chatElement) return;
        
        const input = chatElement.querySelector('.kuhul-input');
        const sendBtn = chatElement.querySelector('.kuhul-send-btn');
        const stopBtn = chatElement.querySelector('.stop-btn');
        const newChatBtn = chatElement.querySelector('.new-chat');
        const historyBtn = chatElement.querySelector('.history');
        const messagesContainer = chatElement.querySelector('.kuhul-chat-messages');
        const tokenCounter = chatElement.querySelector('.token-counter');
        const glyphCounter = chatElement.querySelector('.glyph-counter');
        const progressBar = chatElement.querySelector('.kuhul-progress-bar');
        
        // Send message
        const sendMessage = async () => {
            const text = input.value.trim();
            if (!text || this.isInferencing) return;
            
            // Clear input
            input.value = '';
            
            // Add user message
            this.addMessageToChat(chatId, 'user', text);
            
            // Disable send button, enable stop
            sendBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Show progress
            progressBar.style.transform = 'scaleX(0.3)';
            
            try {
                // Start streaming inference
                const stream = await this.streamInference(text, {
                    temperature: this.config.temperature,
                    maxTokens: this.config.maxTokens
                });
                
                const reader = stream.getReader();
                let assistantMessageId = null;
                let fullResponse = '';
                
                const processStream = async () => {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        // Streaming complete
                        progressBar.style.transform = 'scaleX(1)';
                        setTimeout(() => {
                            progressBar.style.transform = 'scaleX(0)';
                        }, 300);
                        
                        sendBtn.disabled = false;
                        stopBtn.disabled = true;
                        return;
                    }
                    
                    if (!assistantMessageId) {
                        // Create assistant message
                        assistantMessageId = this.addMessageToChat(chatId, 'assistant', value.content, true);
                    } else {
                        // Update assistant message
                        this.updateMessage(chatId, assistantMessageId, value.content);
                    }
                    
                    fullResponse = value.content;
                    
                    // Update counters
                    const glyphs = this.calculateGlyphs(fullResponse);
                    tokenCounter.textContent = `Tokens: ${value.tokens}`;
                    glyphCounter.textContent = `Glyphs: ${glyphs.glyphs}`;
                    
                    // Update progress
                    progressBar.style.transform = `scaleX(${0.3 + (value.tokens / this.config.maxTokens) * 0.7})`;
                    
                    // Continue reading
                    processStream();
                };
                
                processStream();
                
                // Stop button handler
                const stopHandler = () => {
                    reader.cancel();
                    this.abort();
                    stopBtn.disabled = true;
                    sendBtn.disabled = false;
                    progressBar.style.transform = 'scaleX(0)';
                    
                    // Mark message as stopped
                    if (assistantMessageId) {
                        this.markMessageStopped(chatId, assistantMessageId);
                    }
                };
                
                stopBtn.onclick = stopHandler;
                
            } catch (error) {
                console.error('Inference error:', error);
                this.addMessageToChat(chatId, 'system', `Error: ${error.message}`, false, true);
                
                sendBtn.disabled = false;
                stopBtn.disabled = true;
                progressBar.style.transform = 'scaleX(0)';
            }
        };
        
        // Event listeners
        sendBtn.onclick = sendMessage;
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            
            // Update counters
            const text = input.value;
            const glyphs = this.calculateGlyphs(text);
            tokenCounter.textContent = `Tokens: ${glyphs.tokens}`;
            glyphCounter.textContent = `Glyphs: ${glyphs.glyphs}`;
        };
        
        newChatBtn.onclick = async () => {
            await this.createConversation();
            messagesContainer.innerHTML = '';
            this.emit('chat:cleared', { chatId });
        };
        
        historyBtn.onclick = () => {
            this.showHistoryPanel(chatId);
        };
        
        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 160) + 'px';
        });
    }
    
    addMessageToChat(chatId, role, content, streaming = false, isError = false) {
        const chatElement = document.querySelector(`#${chatId}`);
        if (!chatElement) return null;
        
        const messagesContainer = chatElement.querySelector('.kuhul-chat-messages');
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `kuhul-message ${role} ${streaming ? 'streaming' : ''} ${isError ? 'message-error' : ''}`;
        
        // Encode content for visualization
        const encoded = this.encodeToCSS(content);
        const glyphs = this.calculateGlyphs(content);
        
        messageDiv.innerHTML = `
            <div class="message-content ${encoded.cssClass}">
                ${content}
            </div>
            <div class="message-meta">
                <span class="message-role">${role}</span>
                <span class="message-tokens">${glyphs.tokens} tokens</span>
                <span class="message-glyphs">${glyphs.glyphs} glyphs</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        
        // Apply CSS variables
        messageDiv.style.setProperty('--glyph-intensity', (glyphs.glyphs / 10).toFixed(2));
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.emit('message:added', { chatId, messageId, role, content, glyphs });
        
        return messageId;
    }
    
    updateMessage(chatId, messageId, content) {
        const messageElement = document.querySelector(`#${messageId}`);
        if (!messageElement) return;
        
        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.textContent = content;
            
            // Update metadata
            const glyphs = this.calculateGlyphs(content);
            const meta = messageElement.querySelector('.message-meta');
            if (meta) {
                const tokenSpan = meta.querySelector('.message-tokens');
                const glyphSpan = meta.querySelector('.message-glyphs');
                if (tokenSpan) tokenSpan.textContent = `${glyphs.tokens} tokens`;
                if (glyphSpan) glyphSpan.textContent = `${glyphs.glyphs} glyphs`;
            }
        }
    }
    
    markMessageStopped(chatId, messageId) {
        const messageElement = document.querySelector(`#${messageId}`);
        if (messageElement) {
            messageElement.classList.remove('streaming');
            messageElement.classList.add('stopped');
            
            const meta = document.createElement('div');
            meta.className = 'message-stopped';
            meta.textContent = 'Response stopped';
            messageElement.appendChild(meta);
        }
    }
    
    async loadChatHistory(chatId) {
        const conversations = await this.getConversations(5);
        
        if (conversations.length > 0) {
            // Load latest conversation
            const latest = conversations[0];
            this.conversationId = latest.id;
            
            const messages = await this.getMessages(latest.id, 20);
            
            const chatElement = document.querySelector(`#${chatId}`);
            if (chatElement) {
                const messagesContainer = chatElement.querySelector('.kuhul-chat-messages');
                messagesContainer.innerHTML = '';
                
                messages.forEach(msg => {
                    this.addMessageToChat(chatId, msg.role, msg.content);
                });
            }
        }
    }
    
    showHistoryPanel(chatId) {
        // Create history panel
        const panelId = `history-${Date.now()}`;
        const panel = document.createElement('div');
        panel.id = panelId;
        panel.className = 'kuhul-history-panel';
        panel.innerHTML = `
            <div class="history-header">
                <h4>Chat History</h4>
                <button class="close-history">×</button>
            </div>
            <div class="history-list"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Style the panel
        const panelCSS = `
.${panel.className} {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-width: 90vw;
    max-height: 80vh;
    background: rgba(10, 10, 26, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(22, 242, 170, 0.3);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.${panel.className} .history-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.${panel.className} .history-header h4 {
    margin: 0;
    color: #16f2aa;
}

.${panel.className} .close-history {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
}

.${panel.className} .close-history:hover {
    background: rgba(255, 51, 102, 0.2);
}

.${panel.className} .history-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}
        `;
        
        this.styleElement.textContent += panelCSS;
        
        // Load and display history
        this.loadHistoryList(panelId);
        
        // Close button
        panel.querySelector('.close-history').onclick = () => {
            panel.remove();
        };
        
        // Close on escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                panel.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
    }
    
    async loadHistoryList(panelId) {
        const panel = document.querySelector(`#${panelId}`);
        if (!panel) return;
        
        const list = panel.querySelector('.history-list');
        list.innerHTML = '<div class="loading-history">Loading...</div>';
        
        const conversations = await this.getConversations(20);
        
        list.innerHTML = '';
        
        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-title">${conv.title || 'Untitled'}</div>
                <div class="history-item-meta">
                    <span>${conv.message_count || 0} messages</span>
                    <span>${new Date(conv.updated_at).toLocaleDateString()}</span>
                </div>
                <div class="history-item-actions">
                    <button class="load-conv" data-id="${conv.id}">Load</button>
                    <button class="delete-conv" data-id="${conv.id}">Delete</button>
                </div>
            `;
            
            list.appendChild(item);
        });
        
        // Bind events
        list.querySelectorAll('.load-conv').forEach(btn => {
            btn.onclick = async (e) => {
                const convId = parseInt(e.target.dataset.id);
                await this.loadConversation(convId);
                document.querySelector(`#${panelId}`)?.remove();
            };
        });
        
        list.querySelectorAll('.delete-conv').forEach(btn => {
            btn.onclick = async (e) => {
                const convId = parseInt(e.target.dataset.id);
                if (confirm('Delete this conversation?')) {
                    await this.deleteConversation(convId);
                    this.loadHistoryList(panelId);
                }
            };
        });
    }
    
    async loadConversation(convId) {
        this.conversationId = convId;
        // In a real implementation, this would refresh the chat display
        this.emit('conversation:loaded', convId);
    }
    
    autoAttachChat(element) {
        // Check if element should have chat attached
        if (element.hasAttribute('data-kuhul-chat') && !element.hasAttribute('data-kuhul-attached')) {
            this.attachChatInterface(element);
        }
        
        // Check children
        element.querySelectorAll('[data-kuhul-chat]').forEach(child => {
            if (!child.hasAttribute('data-kuhul-attached')) {
                this.attachChatInterface(child);
            }
        });
    }
    
    autoCleanCache() {
        // Clean expired cache entries
        const transaction = this.db.transaction(['model_cache'], 'readwrite');
        const store = transaction.objectStore('model_cache');
        const index = store.index('expires');
        const range = IDBKeyRange.upperBound(Date.now());
        
        index.openCursor(range).onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            }
        };
        
        // Schedule next cleanup
        setTimeout(() => this.autoCleanCache(), 24 * 60 * 60 * 1000); // Daily
    }
    
    // ============================================================
    // 5. EVENT SYSTEM & UTILITIES
    // ============================================================
    
    initEventSystem() {
        this.events = new Map();
        
        // Pre-defined event handlers
        this.defaultHandlers = {
            'inference:start': [],
            'inference:complete': [],
            'inference:error': [],
            'inference:aborted': [],
            'stream:start': [],
            'stream:token': [],
            'stream:end': [],
            'stream:cancelled': [],
            'message:saved': [],
            'conversation:created': [],
            'conversation:deleted': [],
            'conversation:loaded': [],
            'chat:attached': [],
            'chat:cleared': [],
            'message:added': [],
            'db:ready': [],
            'db:error': []
        };
        
        Object.keys(this.defaultHandlers).forEach(event => {
            this.events.set(event, []);
        });
    }
    
    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(handler);
    }
    
    off(event, handler) {
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    emit(event, data = {}) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    
    // ============================================================
    // 6. PUBLIC API METHODS
    // ============================================================
    
    // Chat management
    attachTo(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => this.attachChatInterface(el));
        return this;
    }
    
    detachFrom(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.removeAttribute('data-kuhul-attached');
            el.innerHTML = '';
        });
        return this;
    }
    
    // Conversation management
    async newConversation(title = 'New Conversation') {
        return this.createConversation(title);
    }
    
    async loadHistory(limit = 20) {
        return this.getConversations(limit);
    }
    
    async clearHistory() {
        const conversations = await this.getConversations();
        const deletions = conversations.map(conv => this.deleteConversation(conv.id));
        return Promise.all(deletions);
    }
    
    // Inference
    async chat(message, options = {}) {
        return this.inference(message, options);
    }
    
    async complete(prompt, options = {}) {
        return this.completeInference(prompt, {
            ...options,
            stream: false
        });
    }
    
    stop() {
        return this.abort();
    }
    
    // Stats
    getStats() {
        return {
            model: this.config.modelName,
            compression: this.config.compressionRatio,
            maxTokens: this.config.maxTokens,
            temperature: this.config.temperature,
            isInferencing: this.isInferencing,
            conversationId: this.conversationId,
            glyphCacheSize: this.glyphCache.size,
            cssCacheSize: this.cssCache.size
        };
    }
    
    // Configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('config:updated', this.config);
        return this.config;
    }
    
    // Export/Import
    async exportConversation(conversationId) {
        const messages = await this.getMessages(conversationId);
        const conv = await new Promise((resolve) => {
            const transaction = this.db.transaction(['conversations'], 'readonly');
            const store = transaction.objectStore('conversations');
            const request = store.get(conversationId);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
        
        return {
            metadata: {
                version: '2.0',
                format: 'kuhul-chat',
                exported: new Date().toISOString()
            },
            conversation: conv,
            messages
        };
    }
    
    async importConversation(data) {
        if (data.metadata?.format !== 'kuhul-chat') {
            throw new Error('Invalid format');
        }
        
        // Create new conversation
        const conv = await this.createConversation(data.conversation?.title || 'Imported');
        
        // Import messages
        for (const msg of data.messages) {
            await this.saveMessage(msg.role, msg.content, msg.tokens);
        }
        
        return conv;
    }
    
    // Cleanup
    destroy() {
        // Clean up observers
        if (this.chatObserver) {
            this.chatObserver.disconnect();
        }
        
        // Clean up style element
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
        
        // Clear caches
        this.glyphCache.clear();
        this.embeddingCache.clear();
        this.cssCache.clear();
        
        // Abort any ongoing inference
        this.abort();
        
        // Clear events
        this.events.clear();
        
        this.emit('destroyed');
    }
}

// ============================================================
// GLOBAL EXPORT & AUTO-INITIALIZATION
// ============================================================

// Create global instance
if (typeof window !== 'undefined') {
    window.KuhulAPI = KuhulAPI;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.kuhul = new KuhulAPI();
        });
    } else {
        window.kuhul = new KuhulAPI();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KuhulAPI;
}

export { KuhulAPI };

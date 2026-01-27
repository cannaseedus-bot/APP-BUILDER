// database/asx-ram-database.js
// ASX RAM DATABASE - Encrypted In-Memory Database with Web Crypto API

export class ASXRAMDatabase {
  constructor(options = {}) {
    this.name = options.name || 'asx-ram-db';
    this.version = options.version || '1.0.0';
    this.encryptionKey = null;
    this.isEncrypted = false;

    // Main database structure
    this.tables = new Map();
    this.indexes = new Map();
    this.cache = new Map();
    this.transactions = new Map();

    // Statistics
    this.stats = {
      reads: 0,
      writes: 0,
      queries: 0,
      cacheHits: 0,
      encryptionOps: 0,
      lastBackup: null
    };

    // Configuration
    this.config = {
      autoBackup: options.autoBackup || false,
      backupInterval: options.backupInterval || 300000, // 5 minutes
      maxCacheSize: options.maxCacheSize || 10000,
      encryption: options.encryption || {
        algorithm: 'AES-GCM',
        keyLength: 256
      }
    };

    // Initialize
    this.init();
  }

  async init() {
    console.log(`🔄 Initializing ASX RAM Database: ${this.name}`);

    // Create default tables
    await this.createTable('system', {
      id: 'primary',
      key: 'string',
      value: 'json',
      created: 'timestamp',
      updated: 'timestamp'
    });

    await this.createTable('sessions', {
      id: 'primary',
      data: 'encrypted',
      expires: 'timestamp',
      created: 'timestamp'
    });

    // Setup auto-backup if enabled
    if (this.config.autoBackup) {
      this.setupAutoBackup();
    }

    console.log(`✅ ASX RAM Database ready: ${this.name}`);
  }

  // ---- Table Management -------------------------------------------

  async createTable(tableName, schema) {
    if (this.tables.has(tableName)) {
      throw new Error(`Table already exists: ${tableName}`);
    }

    const table = {
      name: tableName,
      schema: schema,
      data: new Map(),
      indexes: new Map(),
      sequences: new Map()
    };

    // Create primary index
    table.indexes.set('primary', new Map());

    // Create indexes based on schema
    for (const [field, type] of Object.entries(schema)) {
      if (type === 'index' || field === 'id') {
        table.indexes.set(field, new Map());
      }
    }

    this.tables.set(tableName, table);

    // Add to system table
    if (tableName !== 'system') {
      await this.insert('system', {
        key: `table.${tableName}`,
        value: { schema, created: Date.now() },
        created: Date.now(),
        updated: Date.now()
      });
    }

    console.log(`✅ Created table: ${tableName}`);
    return table;
  }

  async dropTable(tableName) {
    if (!this.tables.has(tableName)) {
      throw new Error(`Table not found: ${tableName}`);
    }

    this.tables.delete(tableName);

    // Remove from system table
    if (tableName !== 'system') {
      await this.delete('system', { key: `table.${tableName}` });
    }

    console.log(`🗑️ Dropped table: ${tableName}`);
  }

  // ---- CRUD Operations --------------------------------------------

  async insert(tableName, record) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table not found: ${tableName}`);
    }

    // Generate ID if not provided
    if (!record.id) {
      record.id = this.generateId();
    }

    // Add timestamps
    const now = Date.now();
    record.created = record.created || now;
    record.updated = now;

    // Validate against schema
    this.validateRecord(table.schema, record);

    // Encrypt sensitive fields
    const encryptedRecord = await this.encryptRecord(record);

    // Store record
    table.data.set(record.id, encryptedRecord);

    // Update indexes
    this.updateIndexes(table, record.id, encryptedRecord);

    this.stats.writes++;

    // Cache the record
    this.cache.set(`${tableName}:${record.id}`, record);

    return record.id;
  }

  async select(tableName, query = {}, options = {}) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table not found: ${tableName}`);
    }

    this.stats.queries++;
    this.stats.reads++;

    // Check cache first for single ID queries
    if (query.id && Object.keys(query).length === 1) {
      const cacheKey = `${tableName}:${query.id}`;
      if (this.cache.has(cacheKey)) {
        this.stats.cacheHits++;
        return [this.cache.get(cacheKey)];
      }
    }

    let results = [];

    // Use index if available
    const indexedField = Object.keys(query).find(field =>
      table.indexes.has(field) && query[field]
    );

    if (indexedField) {
      const index = table.indexes.get(indexedField);
      const value = query[indexedField];

      if (index.has(value)) {
        const recordIds = index.get(value);
        for (const id of recordIds) {
          const record = table.data.get(id);
          if (record && this.matchesQuery(record, query)) {
            const decrypted = await this.decryptRecord(record);
            results.push(decrypted);
          }
        }
      }
    } else {
      // Full table scan
      for (const [id, record] of table.data) {
        if (this.matchesQuery(record, query)) {
          const decrypted = await this.decryptRecord(record);
          results.push(decrypted);
        }
      }
    }

    // Apply sorting
    if (options.sort) {
      results.sort((a, b) => {
        for (const [field, direction] of Object.entries(options.sort)) {
          if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
          if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    // Cache results
    results.forEach(record => {
      this.cache.set(`${tableName}:${record.id}`, record);
    });

    return results;
  }

  async update(tableName, query, updates) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table not found: ${tableName}`);
    }

    const records = await this.select(tableName, query);
    const updatedIds = [];

    for (const record of records) {
      // Remove old index entries
      this.removeFromIndexes(table, record.id, record);

      // Apply updates
      const updatedRecord = { ...record, ...updates, updated: Date.now() };

      // Validate updated record
      this.validateRecord(table.schema, updatedRecord);

      // Encrypt and store
      const encryptedRecord = await this.encryptRecord(updatedRecord);
      table.data.set(record.id, encryptedRecord);

      // Update indexes
      this.updateIndexes(table, record.id, encryptedRecord);

      // Update cache
      this.cache.set(`${tableName}:${record.id}`, updatedRecord);

      updatedIds.push(record.id);
    }

    this.stats.writes++;
    return updatedIds;
  }

  async delete(tableName, query) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table not found: ${tableName}`);
    }

    const records = await this.select(tableName, query);
    const deletedIds = [];

    for (const record of records) {
      // Remove from data store
      table.data.delete(record.id);

      // Remove from indexes
      this.removeFromIndexes(table, record.id, record);

      // Remove from cache
      this.cache.delete(`${tableName}:${record.id}`);

      deletedIds.push(record.id);
    }

    this.stats.writes++;
    return deletedIds;
  }

  // ---- Index Management -------------------------------------------

  updateIndexes(table, recordId, record) {
    for (const [field, index] of table.indexes) {
      const value = record[field];

      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(recordId);
      }
    }
  }

  removeFromIndexes(table, recordId, record) {
    for (const [field, index] of table.indexes) {
      const value = record[field];

      if (value !== undefined && index.has(value)) {
        index.get(value).delete(recordId);

        // Clean up empty index entries
        if (index.get(value).size === 0) {
          index.delete(value);
        }
      }
    }
  }

  async createIndex(tableName, field) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table not found: ${tableName}`);
    }

    if (table.indexes.has(field)) {
      throw new Error(`Index already exists: ${field}`);
    }

    const index = new Map();

    // Build index from existing data
    for (const [id, record] of table.data) {
      const value = record[field];
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(id);
      }
    }

    table.indexes.set(field, index);
    console.log(`✅ Created index: ${tableName}.${field}`);
  }

  // ---- Encryption System ------------------------------------------

  async initializeEncryption(password) {
    try {
      // Generate encryption key from password
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('asx-ram-db-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      this.isEncrypted = true;
      console.log('🔐 Database encryption initialized');

      // Re-encrypt all existing data
      await this.reencryptAllData();

    } catch (error) {
      console.error('❌ Encryption initialization failed:', error);
      throw error;
    }
  }

  async encryptRecord(record) {
    if (!this.isEncrypted) {
      return record;
    }

    const encryptedRecord = { ...record };

    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'object' && value !== null) {
        // Encrypt object fields
        const encrypted = await this.encryptData(JSON.stringify(value));
        encryptedRecord[key] = {
          encrypted: true,
          data: encrypted
        };
      } else if (key.includes('secret') || key.includes('password') || key.includes('token')) {
        // Encrypt sensitive string fields
        const encrypted = await this.encryptData(String(value));
        encryptedRecord[key] = {
          encrypted: true,
          data: encrypted
        };
      }
    }

    this.stats.encryptionOps++;
    return encryptedRecord;
  }

  async decryptRecord(record) {
    if (!this.isEncrypted) {
      return record;
    }

    const decryptedRecord = { ...record };

    for (const [key, value] of Object.entries(record)) {
      if (value && typeof value === 'object' && value.encrypted) {
        // Decrypt encrypted fields
        try {
          const decrypted = await this.decryptData(value.data);

          // Try to parse as JSON, otherwise use as string
          try {
            decryptedRecord[key] = JSON.parse(decrypted);
          } catch {
            decryptedRecord[key] = decrypted;
          }
        } catch (error) {
          console.warn(`Failed to decrypt field ${key}:`, error);
          decryptedRecord[key] = null;
        }
      }
    }

    this.stats.encryptionOps++;
    return decryptedRecord;
  }

  async encryptData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...result));
  }

  async decryptData(encryptedData) {
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const iv = encryptedBuffer.slice(0, 12);
    const data = encryptedBuffer.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  async reencryptAllData() {
    if (!this.isEncrypted) return;

    console.log('🔄 Re-encrypting all data with new key...');

    for (const [tableName, table] of this.tables) {
      const newData = new Map();

      for (const [id, record] of table.data) {
        const decrypted = await this.decryptRecord(record);
        const reencrypted = await this.encryptRecord(decrypted);
        newData.set(id, reencrypted);
      }

      table.data = newData;
    }

    console.log('✅ All data re-encrypted');
  }

  // ---- Backup & Recovery ------------------------------------------

  async backup() {
    const backup = {
      meta: {
        name: this.name,
        version: this.version,
        timestamp: Date.now(),
        recordCount: this.getTotalRecords()
      },
      tables: {}
    };

    for (const [tableName, table] of this.tables) {
      backup.tables[tableName] = {
        schema: table.schema,
        data: Array.from(table.data.entries())
      };
    }

    this.stats.lastBackup = Date.now();

    // Encrypt backup if encryption is enabled
    if (this.isEncrypted) {
      const encryptedBackup = await this.encryptData(JSON.stringify(backup));
      return { encrypted: true, data: encryptedBackup };
    }

    return { encrypted: false, data: backup };
  }

  async restore(backupData) {
    let data;

    if (backupData.encrypted) {
      if (!this.isEncrypted) {
        throw new Error('Cannot restore encrypted backup without encryption key');
      }
      data = JSON.parse(await this.decryptData(backupData.data));
    } else {
      data = backupData.data;
    }

    // Clear existing data
    this.tables.clear();
    this.cache.clear();
    this.indexes.clear();

    // Restore tables
    for (const [tableName, tableData] of Object.entries(data.tables)) {
      await this.createTable(tableName, tableData.schema);

      const table = this.tables.get(tableName);
      table.data = new Map(tableData.data);

      // Rebuild indexes
      for (const [id, record] of table.data) {
        this.updateIndexes(table, id, record);
      }
    }

    console.log(`✅ Database restored from backup: ${data.meta.recordCount} records`);
  }

  setupAutoBackup() {
    setInterval(async () => {
      try {
        await this.backup();
        console.log('💾 Auto-backup completed');
      } catch (error) {
        console.error('❌ Auto-backup failed:', error);
      }
    }, this.config.backupInterval);
  }

  // ---- Utility Methods --------------------------------------------

  validateRecord(schema, record) {
    for (const [field, type] of Object.entries(schema)) {
      if (field === 'id' && !record[field]) {
        throw new Error(`Missing required field: ${field}`);
      }

      if (record[field] !== undefined) {
        const expectedType = type.replace('?', ''); // Remove optional marker

        if (expectedType === 'json' && typeof record[field] !== 'object') {
          throw new Error(`Field ${field} must be an object`);
        } else if (expectedType === 'timestamp' && typeof record[field] !== 'number') {
          throw new Error(`Field ${field} must be a timestamp`);
        } else if (expectedType === 'string' && typeof record[field] !== 'string') {
          throw new Error(`Field ${field} must be a string`);
        }
      }
    }
  }

  matchesQuery(record, query) {
    for (const [field, value] of Object.entries(query)) {
      if (record[field] !== value) {
        return false;
      }
    }
    return true;
  }

  generateId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTotalRecords() {
    let count = 0;
    for (const table of this.tables.values()) {
      count += table.data.size;
    }
    return count;
  }

  // ---- Statistics & Monitoring ------------------------------------

  getStats() {
    return {
      ...this.stats,
      tables: Array.from(this.tables.keys()),
      totalRecords: this.getTotalRecords(),
      cacheSize: this.cache.size,
      isEncrypted: this.isEncrypted,
      memoryUsage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    // Estimate memory usage
    let size = 0;

    for (const table of this.tables.values()) {
      for (const record of table.data.values()) {
        size += JSON.stringify(record).length;
      }
    }

    for (const item of this.cache.values()) {
      size += JSON.stringify(item).length;
    }

    return {
      estimatedBytes: size,
      estimatedMB: (size / 1024 / 1024).toFixed(2)
    };
  }

  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache cleared: ${size} items removed`);
  }

  // ---- Export/Import ----------------------------------------------

  async exportData(format = 'json') {
    const data = {};

    for (const [tableName, table] of this.tables) {
      const records = [];

      for (const [id, encryptedRecord] of table.data) {
        const record = await this.decryptRecord(encryptedRecord);
        records.push(record);
      }

      data[tableName] = records;
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  convertToCSV(data) {
    let csv = '';

    for (const [tableName, records] of Object.entries(data)) {
      csv += `Table: ${tableName}\n`;

      if (records.length > 0) {
        const headers = Object.keys(records[0]);
        csv += headers.join(',') + '\n';

        for (const record of records) {
          const row = headers.map(header => {
            const value = record[header];
            if (typeof value === 'object') {
              return JSON.stringify(value).replace(/"/g, '""');
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csv += row.join(',') + '\n';
        }
      }

      csv += '\n';
    }

    return csv;
  }
}

export default ASXRAMDatabase;

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { dateToString, stringToDate, serialize, deserialize } from './utils';

// Define the database name
const DB_NAME = 'adhd_secondbrain.db';

// Define the database schema version
const SCHEMA_VERSION = 1;

// Define table names as constants
export const TABLES = {
  USER: 'User',
  TASK: 'Task',
  SUBTASK: 'SubTask',
  CALENDAR_EVENT: 'CalendarEvent',
  METADATA: 'Metadata',
};

// Define interfaces for each table
export interface BaseEntity {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserEntity extends BaseEntity {
  userId: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  timeZone?: string;
  notificationsEnabled?: boolean;
}

export interface TaskEntity extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  checkInFrequency: 'daily' | 'weekly' | 'none';
}

export interface SubTaskEntity extends BaseEntity {
  taskId: string;
  title: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  timeEstimate?: number;
  orderIndex: number;
}

export interface CalendarEventEntity extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  category: 'work' | 'personal' | 'health' | 'education' | 'social' | 'other';
  color: string;
  googleEventId?: string;
}

// Create a web-compatible implementation of SQLite for Expo Web
// Using a simplified version that meets the needs of our app
const createWebSQLiteImplementation = (dbName: string): SQLite.SQLiteDatabase => {
  // In-memory storage for tables
  const tables: { [tableName: string]: any[] } = {};
  let isInitialized = false;
  
  // Initialize tables with empty arrays
  Object.values(TABLES).forEach(tableName => {
    tables[tableName] = [];
  });
  
  // Initialize tables from localStorage
  const initialize = async (): Promise<void> => {
    if (isInitialized) return;
    
    try {
      for (const tableName of Object.values(TABLES)) {
        const storedData = localStorage.getItem(`${dbName}_${tableName}`);
        if (storedData) {
          tables[tableName] = JSON.parse(storedData);
        }
      }
    } catch (error) {
      console.error('Failed to initialize web database:', error);
    }
    
    isInitialized = true;
  };
  
  // Save tables to localStorage
  const persist = async (): Promise<void> => {
    try {
      for (const tableName of Object.values(TABLES)) {
        localStorage.setItem(
          `${dbName}_${tableName}`, 
          JSON.stringify(tables[tableName])
        );
      }
    } catch (error) {
      console.error('Failed to persist web database:', error);
    }
  };
  
  // Extract query results from in-memory tables
  const queryTables = <T>(sql: string, params?: any[]): T[] => {
    // Try to extract table name from the SQL
    const fromMatch = sql.match(/FROM (\w+)/i);
    if (!fromMatch) return [];
    
    const tableName = fromMatch[1];
    if (!tables[tableName]) return [];
    
    // Check if there's a WHERE clause
    const whereMatch = sql.match(/WHERE (.+)$/i);
    if (!whereMatch) {
      // If no WHERE clause, return all records from the table
      return [...tables[tableName]] as unknown as T[];
    }
    
    // Simple WHERE processing (very limited)
    const whereClause = whereMatch ? whereMatch[1] : null;
    if (whereClause) {
      // Handle "key = value" pattern
      const keyValueMatch = whereClause.match(/(\w+)\s*=\s*[?'"]?([^'"]*)['"]?/);
      if (keyValueMatch) {
        const key = keyValueMatch[1];
        const value = params && params.length > 0 ? params[0] : keyValueMatch[2];
        
        return tables[tableName].filter(item => 
          item[key] === value
        ) as unknown as T[];
      }
    }
    
    return [];
  };

  // Return a minimal implementation that satisfies the interface
  return {
    // Core SQLite methods required by our app
    async execAsync(sql: string): Promise<void> {
      await initialize();
      console.log('Web SQLite exec:', sql);
      
      // We don't actually execute SQL in the browser, just log it
      // The actual data manipulation happens through our higher-level functions
    },
    
    async closeAsync(): Promise<void> {
      await persist();
    },
    
    // Support for queries
    getAllAsync<T>(sql: string, params: Record<string, SQLite.SQLiteBindValue> | SQLite.SQLiteBindValue[]): Promise<T[]> {
      return initialize().then(() => {
        console.log('Web SQLite getAllAsync:', sql, params);
        const paramsArray = Array.isArray(params) ? params : Object.values(params);
        return queryTables<T>(sql, paramsArray);
      });
    },
    
    // Stub implementation for other required methods
    get databasePath(): string { return dbName; },
    get options(): SQLite.SQLiteOptions { return {}; },
    get nativeDatabase(): any { return null; },
    
    // Add more method stubs to satisfy the interface
    isInTransactionAsync(): Promise<boolean> { return Promise.resolve(false); },
    transactionAsync(): Promise<void> { return Promise.resolve(); },
    getFirstAsync(): Promise<any> { return Promise.resolve(null); },
    runAsync(): Promise<void> { return Promise.resolve(); },
    prepareAsync(): Promise<SQLite.SQLitePreparedStatement> { 
      throw new Error('prepareAsync not implemented for web'); 
    },
    prepareStatementAsync(): Promise<SQLite.SQLitePreparedStatement> { 
      throw new Error('prepareStatementAsync not implemented for web'); 
    },
    getBlobAsync(): Promise<Blob> { 
      throw new Error('getBlobAsync not implemented for web'); 
    },
    deleteAsync(): Promise<void> { return Promise.resolve(); },
    
    // Additional required properties
    name: dbName,
    version: "1",
    transaction(): any { throw new Error('transaction not implemented for web'); },
    exec(): any { throw new Error('exec not implemented for web'); },
    prepare(): any { throw new Error('prepare not implemented for web'); },
    executeSql(): any { throw new Error('executeSql not implemented for web'); }
  } as SQLite.SQLiteDatabase;
};

// Open the database
export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (Platform.OS === 'web') {
    return createWebSQLiteImplementation(DB_NAME);
  }

  return SQLite.openDatabaseSync(DB_NAME);
};

// Helper function to format SQL with parameters
const formatSqlWithParams = (sql: string, params?: any[]): string => {
  if (!params || params.length === 0) {
    return sql;
  }
  
  // Replace ? with actual values
  let formattedSql = sql;
  params.forEach((param, index) => {
    let value = param;
    if (typeof param === 'string') {
      value = `'${param.replace(/'/g, "''")}'`; // Escape single quotes
    } else if (param === null) {
      value = 'NULL';
    } else if (param === undefined) {
      value = 'NULL';
    }
    formattedSql = formattedSql.replace('?', String(value));
  });
  
  return formattedSql;
};

// Initialize the database
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    // Open the database
    const db = openDatabase();
    
    // Create the metadata table to track schema version
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS ${TABLES.METADATA} (
        key TEXT PRIMARY KEY,
        value TEXT
      )`
    );

    // Check the schema version
    const version = await getSchemaVersion(db);
    
    if (version < SCHEMA_VERSION) {
      // Create or upgrade the tables
      await createTables(db);
      
      // Update the schema version
      await setSchemaVersion(db, SCHEMA_VERSION);
    }

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get the schema version from the metadata table
const getSchemaVersion = async (db: SQLite.SQLiteDatabase): Promise<number> => {
  try {
    const result = await db.getAllAsync<{ value: string }>(
      `SELECT value FROM ${TABLES.METADATA} WHERE key = 'schema_version'`
    );
    
    if (result.length > 0) {
      return parseInt(result[0].value, 10);
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting schema version:', error);
    return 0;
  }
};

// Set the schema version in the metadata table
const setSchemaVersion = async (db: SQLite.SQLiteDatabase, version: number): Promise<void> => {
  try {
    await db.execAsync(
      `INSERT OR REPLACE INTO ${TABLES.METADATA} (key, value) VALUES ('schema_version', '${version.toString()}')`
    );
  } catch (error) {
    console.error('Error setting schema version:', error);
    throw error;
  }
};

// Create the database tables
const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Create User table
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS ${TABLES.USER} (
        _id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        timeZone TEXT,
        notificationsEnabled INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`
    );

    // Create Task table
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS ${TABLES.TASK} (
        _id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        priority TEXT NOT NULL,
        completed INTEGER NOT NULL,
        checkInFrequency TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`
    );

    // Create SubTask table
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS ${TABLES.SUBTASK} (
        _id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL,
        priority TEXT,
        timeEstimate INTEGER,
        orderIndex INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (taskId) REFERENCES ${TABLES.TASK} (_id) ON DELETE CASCADE
      )`
    );

    // Create CalendarEvent table
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS ${TABLES.CALENDAR_EVENT} (
        _id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        allDay INTEGER,
        location TEXT,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        googleEventId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`
    );
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Execute a transaction (multiple SQL statements)
export const executeTransaction = async (
  db: SQLite.SQLiteDatabase,
  statements: string[]
): Promise<void> => {
  try {
    for (const statement of statements) {
      await db.execAsync(statement);
    }
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw error;
  }
};

// Generic function to execute a SQL query
export const executeQuery = async <T>(
  db: SQLite.SQLiteDatabase,
  query: string,
  params: any[] = []
): Promise<T[]> => {
  try {
    const formattedQuery = formatSqlWithParams(query, params);
    const results = await db.getAllAsync<any>(formattedQuery);
    
    // Convert date strings to Date objects and boolean integers to booleans
    return results.map(item => {
      const convertedItem: any = {};
      for (const key in item) {
        if (key.includes('Date') || key === 'start' || key === 'end' || key === 'createdAt' || key === 'updatedAt') {
          convertedItem[key] = stringToDate(item[key]);
        } else if (key === 'completed' || key === 'notificationsEnabled' || key === 'allDay') {
          convertedItem[key] = !!item[key];
        } else {
          convertedItem[key] = item[key];
        }
      }
      return convertedItem as T;
    });
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Generic function to insert an object into a table
export const insertObject = async <T extends { _id: string }>(
  db: SQLite.SQLiteDatabase,
  table: string,
  object: T
): Promise<T> => {
  try {
    const keys = Object.keys(object);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => {
      const value = (object as any)[key];
      if (value instanceof Date) {
        return dateToString(value);
      } else if (typeof value === 'boolean') {
        return value ? 1 : 0;
      } else if (typeof value === 'object' && value !== null) {
        return serialize(value);
      }
      return value;
    });

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const formattedQuery = formatSqlWithParams(query, values);
    await db.execAsync(formattedQuery);
    
    return object;
  } catch (error) {
    console.error('Error inserting object:', error);
    throw error;
  }
};

// Generic function to update an object in a table
export const updateObject = async <T extends { _id: string }>(
  db: SQLite.SQLiteDatabase,
  table: string,
  object: T
): Promise<T> => {
  try {
    const keys = Object.keys(object).filter(key => key !== '_id');
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => {
      const value = (object as any)[key];
      if (value instanceof Date) {
        return dateToString(value);
      } else if (typeof value === 'boolean') {
        return value ? 1 : 0;
      } else if (typeof value === 'object' && value !== null) {
        return serialize(value);
      }
      return value;
    });

    const query = `UPDATE ${table} SET ${setClause} WHERE _id = ?`;
    const formattedQuery = formatSqlWithParams(query, [...values, object._id]);
    await db.execAsync(formattedQuery);
    
    return object;
  } catch (error) {
    console.error('Error updating object:', error);
    throw error;
  }
};

// Generic function to delete an object from a table
export const deleteObject = async (
  db: SQLite.SQLiteDatabase,
  table: string,
  id: string
): Promise<void> => {
  try {
    const query = `DELETE FROM ${table} WHERE _id = ?`;
    const formattedQuery = formatSqlWithParams(query, [id]);
    await db.execAsync(formattedQuery);
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};

// Function to get an object by ID
export const getObjectById = async <T>(
  db: SQLite.SQLiteDatabase,
  table: string,
  id: string
): Promise<T | null> => {
  try {
    const query = `SELECT * FROM ${table} WHERE _id = ?`;
    const results = await executeQuery<T>(db, query, [id]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error getting object by ID:', error);
    throw error;
  }
};

// Function to get all objects from a table
export const getAllObjects = async <T>(
  db: SQLite.SQLiteDatabase,
  table: string
): Promise<T[]> => {
  try {
    const query = `SELECT * FROM ${table}`;
    return executeQuery<T>(db, query);
  } catch (error) {
    console.error('Error getting all objects:', error);
    throw error;
  }
};

// Function to get objects by a filter
export const getObjectsByFilter = async <T>(
  db: SQLite.SQLiteDatabase,
  table: string,
  filterKey: string,
  filterValue: any
): Promise<T[]> => {
  try {
    const query = `SELECT * FROM ${table} WHERE ${filterKey} = ?`;
    return executeQuery<T>(db, query, [filterValue]);
  } catch (error) {
    console.error('Error getting objects by filter:', error);
    throw error;
  }
};

// Function to get subtasks for a task
export const getSubtasksForTask = async (
  db: SQLite.SQLiteDatabase,
  taskId: string
): Promise<any[]> => {
  try {
    const query = `SELECT * FROM ${TABLES.SUBTASK} WHERE taskId = ? ORDER BY orderIndex ASC`;
    return executeQuery(db, query, [taskId]);
  } catch (error) {
    console.error('Error getting subtasks for task:', error);
    throw error;
  }
};
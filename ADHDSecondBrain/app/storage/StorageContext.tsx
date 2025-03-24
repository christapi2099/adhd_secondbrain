import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { useAuth } from '@/contexts/AuthContext';
import { 
  openDatabase, 
  initDatabase, 
  TABLES,
  executeQuery,
  executeTransaction,
  insertObject,
  updateObject,
  deleteObject,
  getObjectById,
  getAllObjects,
  getObjectsByFilter,
  getSubtasksForTask,
  BaseEntity,
  UserEntity,
  TaskEntity,
  SubTaskEntity,
  CalendarEventEntity
} from './database';
import { createObjectId, getCurrentTimestamp } from './utils';

// Type mapping for tables to their entity types
export type TableEntityMap = {
  [TABLES.USER]: UserEntity;
  [TABLES.TASK]: TaskEntity;
  [TABLES.SUBTASK]: SubTaskEntity;
  [TABLES.CALENDAR_EVENT]: CalendarEventEntity;
};

// Helper type to get entity type from table name
export type EntityType<T extends keyof TableEntityMap> = TableEntityMap[T];

// Interface for the StorageContext value
interface StorageContextValue {
  db: SQLite.SQLiteDatabase | null;
  isStorageReady: boolean;
}

// Create a context for managing Storage initialization state
const StorageInitContext = createContext<StorageContextValue>({
  db: null,
  isStorageReady: false,
});

// Props for the StorageManager component
interface StorageManagerProps {
  children: ReactNode;
}

// StorageManager component to handle database initialization
const StorageManager: React.FC<StorageManagerProps> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
        setIsStorageReady(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();

    return () => {
      // Close the database when the component unmounts
      if (db) {
        db.closeAsync();
      }
    };
  }, []);

  return (
    <StorageInitContext.Provider value={{ db, isStorageReady }}>
      {children}
    </StorageInitContext.Provider>
  );
};

// Props for the AppStorageProvider component
interface AppStorageProviderProps {
  children: ReactNode;
}

// Main Storage provider component
export const AppStorageProvider: React.FC<AppStorageProviderProps> = ({ children }) => {
  return (
    <StorageManager>
      {children}
    </StorageManager>
  );
};

// Custom hook to use the Storage context
export const useStorageContext = () => useContext(StorageInitContext);

// Hook to access the database instance
export const useStorage = () => {
  const { db, isStorageReady } = useStorageContext();
  const { user } = useAuth();

  // Function to write to the database (similar to realm.write)
  const write = async <T,>(callback: () => Promise<T>): Promise<T> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    // Execute the callback directly without using executeTransaction
    // since we can't wrap it in a transaction anymore
    return callback();
  };

  // Function to create an object
  const create = async <T extends keyof TableEntityMap>(
    tableName: T,
    data: Omit<TableEntityMap[T], '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }
  ): Promise<TableEntityMap[T]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    const now = getCurrentTimestamp();
    const object = {
      _id: data._id || createObjectId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    } as TableEntityMap[T];

    return insertObject(db, tableName.toString(), object);
  };

  // Function to update an object
  const update = async <T extends keyof TableEntityMap>(
    tableName: T,
    id: string,
    data: Partial<Omit<TableEntityMap[T], '_id' | 'createdAt'>>
  ): Promise<TableEntityMap[T]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    const existingObject = await getObjectById<TableEntityMap[T]>(db, tableName.toString(), id);
    if (!existingObject) {
      throw new Error(`Object with id ${id} not found in ${tableName}`);
    }

    const updatedObject = {
      ...existingObject,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    return updateObject(db, tableName.toString(), updatedObject);
  };

  // Function to delete an object
  const deleteById = async <T extends keyof TableEntityMap>(
    tableName: T,
    id: string
  ): Promise<void> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return deleteObject(db, tableName.toString(), id);
  };

  // Function to get all objects from a table
  const getAll = async <T extends keyof TableEntityMap>(
    tableName: T
  ): Promise<TableEntityMap[T][]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return getAllObjects<TableEntityMap[T]>(db, tableName.toString());
  };

  // Function to get an object by ID
  const getById = async <T extends keyof TableEntityMap>(
    tableName: T,
    id: string
  ): Promise<TableEntityMap[T] | null> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return getObjectById<TableEntityMap[T]>(db, tableName.toString(), id);
  };

  // Function to get objects by a filter
  const getByFilter = async <T extends keyof TableEntityMap>(
    tableName: T,
    filterKey: string,
    filterValue: any
  ): Promise<TableEntityMap[T][]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return getObjectsByFilter<TableEntityMap[T]>(db, tableName.toString(), filterKey, filterValue);
  };

  // Function to execute a custom query
  const query = async <T,>(sql: string, params: any[] = []): Promise<T[]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return executeQuery<T>(db, sql, params);
  };

  // Function to get subtasks for a task
  const getSubtasks = async (taskId: string): Promise<SubTaskEntity[]> => {
    if (!db) {
      throw new Error('Database is not initialized');
    }

    return getSubtasksForTask(db, taskId);
  };

  return {
    db,
    isReady: isStorageReady,
    write,
    create,
    update,
    delete: deleteById,
    getAll,
    getById,
    getByFilter,
    query,
    getSubtasks,
    userId: user?.id,
  };
};

// Hook to access a specific object by ID
export const useObject = <T extends keyof TableEntityMap>(
  tableName: T,
  id: string | null
) => {
  const storage = useStorage();
  const [object, setObject] = useState<TableEntityMap[T] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObject = async () => {
      if (!id || !storage.isReady) {
        setObject(null);
        setIsLoading(false);
        return;
      }

      try {
        const result = await storage.getById(tableName, id);
        setObject(result);
      } catch (error) {
        console.error(`Error fetching ${tableName} with id ${id}:`, error);
        setObject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObject();
  }, [tableName, id, storage.isReady]);

  return { object, isLoading };
};

// Hook to query objects from a table
export const useQuery = <T extends keyof TableEntityMap>(
  tableName: T,
  options?: {
    filter?: { key: string; value: any };
    sort?: { key: string; ascending?: boolean }[];
  }
) => {
  const storage = useStorage();
  const [results, setResults] = useState<TableEntityMap[T][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!storage.isReady) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        let data: TableEntityMap[T][];

        if (options?.filter) {
          data = await storage.getByFilter(tableName, options.filter.key, options.filter.value);
        } else {
          data = await storage.getAll(tableName);
        }

        // Apply sorting if specified
        if (options?.sort && options.sort.length > 0) {
          data.sort((a: any, b: any) => {
            for (const sortOption of options.sort!) {
              const key = sortOption.key;
              const ascending = sortOption.ascending !== false;
              
              if (a[key] < b[key]) return ascending ? -1 : 1;
              if (a[key] > b[key]) return ascending ? 1 : -1;
            }
            return 0;
          });
        }

        setResults(data);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [tableName, options?.filter?.key, options?.filter?.value, storage.isReady]);

  // Function to filter results (similar to Realm's filtered method)
  const filtered = (filterFn: (item: TableEntityMap[T]) => boolean): TableEntityMap[T][] => {
    return results.filter(filterFn);
  };

  // Function to sort results (similar to Realm's sorted method)
  const sorted = (sortOptions: { key: string; ascending?: boolean }[]): TableEntityMap[T][] => {
    return [...results].sort((a: any, b: any) => {
      for (const sortOption of sortOptions) {
        const key = sortOption.key;
        const ascending = sortOption.ascending !== false;
        
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
      }
      return 0;
    });
  };

  return {
    results,
    isLoading,
    filtered,
    sorted,
  };
};
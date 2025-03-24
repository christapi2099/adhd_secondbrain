/**
 * Utility functions for the SQLite implementation
 */

/**
 * Creates a new ObjectId for database objects
 * @returns A new UUID string
 */
export const createObjectId = (): string => {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Gets the current timestamp for object creation/updates
 * @returns Current date
 */
export const getCurrentTimestamp = (): Date => {
  return new Date();
};

/**
 * Converts a Date object to an ISO string for SQLite storage
 * @param date The date to convert
 * @returns ISO string representation of the date
 */
export const dateToString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Converts an ISO string from SQLite to a Date object
 * @param dateString The ISO string to convert
 * @returns Date object
 */
export const stringToDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Serializes an object to JSON for storage
 * @param obj The object to serialize
 * @returns JSON string
 */
export const serialize = <T>(obj: T): string => {
  return JSON.stringify(obj, (key, value) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

/**
 * Deserializes a JSON string to an object
 * @param json The JSON string to deserialize
 * @returns Deserialized object
 */
export const deserialize = <T>(json: string): T => {
  return JSON.parse(json, (key, value) => {
    // Convert ISO strings back to Date objects
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
};
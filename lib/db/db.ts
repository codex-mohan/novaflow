import { Surreal, RecordId } from "surrealdb";

// Singleton Database Instance
let db: Surreal | null = null;

export class Database {
  /**
   * Initialize the singleton SurrealDB instance
   */
  public static async initialize(
    namespace: string,
    database: string
  ): Promise<void> {
    if (db === null) {
      console.log("Initializing SurrealDB connection...");

      // Connect to the database
      const surreal = new Surreal();
      await surreal.connect(`http://127.0.0.1:8877`);
      await surreal.use({ namespace, database });

      db = surreal;
      console.log("SurrealDB connection initialized.");
    } else {
      console.log("SurrealDB connection already initialized.");
    }
  }

  /**
   * Get the singleton instance of the database
   */
  public static getConnection(): Surreal {
    if (db === null) {
      throw new Error("Database must be initialized before use!");
    }
    return db;
  }
}

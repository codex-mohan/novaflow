import { Database } from './db';
import { User } from './types';
import { Surreal, RecordId } from 'surrealdb';

export class UserDatabase {
    /**
     * Initialize the database and set up schemas for the `user` table
     */
    public static async initialize(): Promise<void> {
        // Initialize the database connection if not already done
        await Database.initialize("novaflow", "users");

        const db = Database.getConnection();

        // Define user table schema
        await db.query("DEFINE TABLE user SCHEMAFULL");
        await db.query("DEFINE FIELD first_name ON user TYPE string");
        await db.query("DEFINE FIELD last_name ON user TYPE string");
        await db.query(
            "DEFINE FIELD username ON user TYPE string ASSERT $value != NONE AND $value != ''"
        );
        await db.query("DEFINE FIELD email ON user TYPE string");
        await db.query("DEFINE FIELD pass ON user TYPE string");
        await db.query("DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now()");
        await db.query("DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now()");

        // Define indexes for unique constraints
        await db.query("DEFINE INDEX idx_username ON user FIELDS username UNIQUE");

        console.log("Schema definition for `user` table is set up.");
    }

    /**
     * Create a new user with Argon2 password hashing
     */
    public static async createUser(
        first_name: string,
        last_name: string,
        username: string,
        pass: string,
        email: string,
    ): Promise<void> {
        const db = Database.getConnection();

        const query = `
            CREATE user SET
            first_name = $first_name,
            last_name = $last_name,
            username = $username,
            pass = crypto::argon2::generate($pass),
            email = $email,
            created_at = time::now(),
            updated_at = time::now()
        `;

        const vars = {
            first_name,
            last_name,
            username,
            pass,
            email
        };

        const result: any = await db.query(query, vars);
        console.log(result);
    }

    /**
     * Retrieve a user by their username
     */
    public static async getUserByUsername(username: string): Promise<User | null> {
        const db = Database.getConnection();

        const query = "SELECT * FROM user WHERE username = $username";
        const vars = { username };

        const result: any = await db.query(query, vars);
        const user: User[] = result[0].result;

        return user.length > 0 ? user[0] : null;
    }

    public static async verifyPassword(username: string, password: string): Promise<User | null> {
        await UserDatabase.initialize();
        const db = Database.getConnection();

        const query =
            "SELECT username, first_name, last_name, email, created_at, updated_at FROM user WHERE username = $username AND crypto::argon2::compare(pass, $pass)";

        const vars = { username, pass: password };

        // Execute the query
        const result: any = await db.query(query, vars);
        const user: User[] = result[0].result;

        return user.length > 0 ? user[0] : null;
    }
}
import { Database } from "./db";
import { Conversation, Message, MessageContent, Image } from "./types";
import { Surreal, RecordId } from "surrealdb";

export class ConversationDatabase {
  /**
   * Initialize the database and define schemas for `conversation` and `message`
   */
  public static async initialize(): Promise<void> {
    // Initialize the database connection if not already done
    await Database.initialize("novaflow", "conversations");

    const db = Database.getConnection();

    // Define the conversation table with relation to user
    await db.query("DEFINE TABLE conversation SCHEMAFUL;");
    await db.query("DEFINE FIELD user_id ON conversation TYPE record<user>;");
    await db.query(
      "DEFINE FIELD title ON conversation TYPE string ASSERT $value != NONE AND $value != ''"
    );
    await db.query(
      "DEFINE INDEX idx_title ON conversation FIELDS title UNIQUE"
    );
    await db.query("DEFINE FIELD created_at ON conversation TYPE datetime;");
    await db.query("DEFINE FIELD updated_at ON conversation TYPE datetime;");

    // Define the message table with relation to conversation
    await db.query("DEFINE TABLE message SCHEMAFUL;");
    await db.query(
      "DEFINE FIELD conversation_id ON message TYPE record<conversation>;"
    );
    await db.query("DEFINE FIELD role ON message TYPE string;");
    // Modify the content field to be an array of objects
    await db.query("DEFINE FIELD content ON message TYPE array<object>;");
    await db.query("DEFINE FIELD timestamp ON message TYPE datetime;");

    console.log(
      "Schema definitions for `conversation` and `message` are set up."
    );
  }

  /**
   * Create a new conversation and return its ID
   */
  public static async createConversation(
    user_id: string,
    title: string
  ): Promise<string> {
    const db = Database.getConnection();

    const query = `
            CREATE conversation SET user_id = user:${user_id}, title = '${title}', created_at = time::now(), updated_at = time::now()
        `;

    const result: any = await db.query(query);
    const conversation = result[0].result as Conversation[];

    if (!conversation || conversation.length === 0) {
      throw new Error("Failed to create conversation");
    }

    // Assuming the ID is in the format 'table:id'
    return conversation[0].id.toString();
  }

  /**
   * Add a message to a specific conversation
   */
  public static async addMessage(
    conversation_id: string,
    message: Message
  ): Promise<void> {
    const db = Database.getConnection();

    // Prepare the content as a JSON array (list of objects)
    const content_json = JSON.stringify(message.content);

    // Create the message entry with content as an array of objects
    const query = `
            CREATE message SET conversation_id = conversation:${conversation_id}, role = '${message.role}', content = ${content_json}, timestamp = time::now()
        `;

    await db.query(query);
  }

  /**
   * Retrieve all messages for a given conversation ID
   */
  public static async getConversationMessages(
    conversation_id: string
  ): Promise<Message[]> {
    const db = Database.getConnection();

    const query = `
            SELECT * FROM message WHERE conversation_id = conversation:${conversation_id} ORDER BY timestamp ASC
        `;

    const result: any = await db.query(query);
    const messages = result[0].result as Message[];

    return messages || [];
  }

  /**
   * Retrieve all conversations for a given user ID
   */
  public static async getUserConversations(
    user_id: string
  ): Promise<Conversation[]> {
    const db = Database.getConnection();

    const query = `
            SELECT * FROM conversation WHERE user_id = user:${user_id} ORDER BY created_at ASC
        `;

    const result: any = await db.query(query);
    const conversations = result[0].result as Conversation[];

    return conversations || [];
  }
}

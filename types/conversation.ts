interface RecordId {
  tb: string;
  id: {
    String: string;
  };
}

export interface Conversation {
  id: RecordId;
  user_id: RecordId;
  title: string;
  created_at: string;
  updated_at: string;
}

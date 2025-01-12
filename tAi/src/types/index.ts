export interface User {
    id: number;
    email: string;
    name: string;
  }
  
  export interface UserProgress {
    current_level: string;
    mastered_topics: string[];
    learning_goals: string[];
    streak?: number;
  }
  
  export interface StudySession {
    id: number;
    start_time: string;
    end_time?: string;
    planned_duration: number;
    actual_duration?: number;
    status: 'active' | 'completed' | 'cancelled';
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }
  
  export interface StudyMaterial {
    id: number;
    filename: string;
    drive_file_id: string;
    topics: string[];
    difficulty_level: string;
    content_summary?: string;
    last_accessed?: string;
    times_accessed: number;
  }
  
  export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
  }
  
  export interface Timer {
    minutes: number;
    seconds: number;
  }
  
  export interface APIError {
    error: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    name: string;
  }
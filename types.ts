
export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64 string
  previewUrl?: string; // URL for image preview or icon
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  attachment?: Attachment;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  hasStarted: boolean;
  therapyMode: boolean;
}

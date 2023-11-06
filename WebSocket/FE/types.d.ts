type UpdateType =
  | "ADD_MESSAGE"
  | "EDIT_MESSAGE"
  | "DELETE_MESSAGE"
  | "USER_JOIN"
  | "USER_LEAVE"
  | "UpFile";

interface Update {
  type: UpdateType;
  user?: User;
  message?: Message | null;
}

interface Message {
  id: number;
  uid: number;
  time: string;
  username: string;
  message: string | null;
  file?: FileData;
}

interface User {
  id: number;
  userName: string;
  remoteAddr: string;
  createAt: Date;
  photo:
    | string
    | "https://i1.sndcdn.com/avatars-RRGLShuXxo0UaNkq-Ccb9yg-t500x500.jpg";
  messages?: Message[];
}

export interface FileData {
  mime_type: string;
  file_name: string;
  link?: string | null;
  data: string | ArrayBuffer | null | undefined;
}



export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  jobTitle: string;
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CustomField {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  assignee: User | null;
  status: Status;
  tags: Tag[];
  dueDate: string | null;
  priority: Priority;
  dateAdded: string;
  addedBy: User;
  timeLogged: number; // in milliseconds
  description?: string;
  customFields?: Record<string, string | null>;
  parentId: string | null;
}

export interface ActiveTimer {
  taskId: string;
  startTime: number;
}
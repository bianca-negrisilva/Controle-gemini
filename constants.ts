import { User, Tag, Task, Status, Priority, CustomField } from './types';

export const MOCK_USERS: User[] = [
  { id: 'U-1', name: 'Alex Doe', avatarUrl: 'https://i.pravatar.cc/150?u=alex', jobTitle: 'Product Manager' },
  { id: 'U-2', name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=jane', jobTitle: 'Frontend Developer' },
  { id: 'U-3', name: 'Sam Wilson', avatarUrl: 'https://i.pravatar.cc/150?u=sam', jobTitle: 'Backend Developer' },
  { id: 'U-4', name: 'Maria Garcia', avatarUrl: 'https://i.pravatar.cc/150?u=maria', jobTitle: 'UX Designer' },
];

export const MOCK_TAGS: Tag[] = [
  { id: 'T-1', name: 'design', color: 'bg-rose-100 text-rose-800' },
  { id: 'T-2', name: 'bug', color: 'bg-orange-100 text-orange-800' },
  { id: 'T-3', name: 'meeting', color: 'bg-violet-100 text-violet-800' },
  { id: 'T-4', name: 'frontend', color: 'bg-sky-100 text-sky-800' },
  { id: 'T-5', name: 'backend', color: 'bg-teal-100 text-teal-800' },
];

export const MOCK_CUSTOM_FIELDS: CustomField[] = [];

export const MOCK_TASKS: Task[] = [
  {
    id: 'TSK-1',
    name: 'Finalize branding guidelines for Q3 campaign',
    assignee: MOCK_USERS[0],
    status: Status.InProgress,
    tags: [MOCK_TAGS[0], MOCK_TAGS[3]],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    priority: Priority.High,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    addedBy: MOCK_USERS[1],
    timeLogged: 3600000, // 1h (parent only)
    description: 'A detailed description of the branding guidelines task.',
    customFields: {},
    parentId: null,
  },
   {
    id: 'TSK-1-1',
    name: 'Choose primary font',
    assignee: MOCK_USERS[3],
    status: Status.Done,
    tags: [MOCK_TAGS[0]],
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    priority: Priority.Medium,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    addedBy: MOCK_USERS[0],
    timeLogged: 900000, // 15m
    parentId: 'TSK-1',
  },
  {
    id: 'TSK-1-2',
    name: 'Define color palette',
    assignee: MOCK_USERS[3],
    status: Status.InProgress,
    tags: [MOCK_TAGS[0]],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    priority: Priority.High,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    addedBy: MOCK_USERS[0],
    timeLogged: 900000, // 15m
    parentId: 'TSK-1',
  },
  {
    id: 'TSK-2',
    name: 'Fix authentication flow bug on mobile',
    assignee: MOCK_USERS[2],
    status: Status.ToDo,
    tags: [MOCK_TAGS[1], MOCK_TAGS[4]],
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    priority: Priority.Urgent,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    addedBy: MOCK_USERS[0],
    timeLogged: 0,
    description: 'Users are reporting being logged out unexpectedly on iOS devices.',
    customFields: {},
    parentId: null,
  },
  {
    id: 'TSK-3',
    name: 'Prepare slides for weekly sync meeting',
    assignee: MOCK_USERS[1],
    status: Status.Done,
    tags: [MOCK_TAGS[2]],
    dueDate: null,
    priority: Priority.Medium,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    addedBy: MOCK_USERS[1],
    timeLogged: 1800000, // 30m
    customFields: {},
    parentId: null,
  },
  {
    id: 'TSK-4',
    name: 'Setup new staging environment on AWS',
    assignee: MOCK_USERS[3],
    status: Status.InReview,
    tags: [MOCK_TAGS[4]],
    dueDate: new Date().toISOString(),
    priority: Priority.High,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    addedBy: MOCK_USERS[2],
    timeLogged: 10800000, // 3h
    customFields: {},
    parentId: null,
  },
    {
    id: 'TSK-5',
    name: 'User research for new calendar feature',
    assignee: MOCK_USERS[0],
    status: Status.ToDo,
    tags: [MOCK_TAGS[0]],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    priority: Priority.Medium,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    addedBy: MOCK_USERS[3],
    timeLogged: 0,
    customFields: {},
    parentId: null,
  },
];

export const STATUS_OPTIONS = {
    [Status.ToDo]: { label: 'To Do', color: 'bg-stone-200 text-stone-700' },
    [Status.InProgress]: { label: 'In Progress', color: 'bg-sky-200 text-sky-800' },
    [Status.InReview]: { label: 'In Review', color: 'bg-amber-200 text-amber-800' },
    [Status.Done]: { label: 'Done', color: 'bg-teal-200 text-teal-800' },
};

export const PRIORITY_OPTIONS = {
    [Priority.Low]: { label: 'Low', color: 'text-stone-500', bgColor: 'bg-stone-100' },
    [Priority.Medium]: { label: 'Medium', color: 'text-sky-600', bgColor: 'bg-sky-100' },
    [Priority.High]: { label: 'High', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    [Priority.Urgent]: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const TAG_COLORS = [
    { name: 'Rose', value: 'bg-rose-100 text-rose-800' },
    { name: 'Orange', value: 'bg-orange-100 text-orange-800' },
    { name: 'Violet', value: 'bg-violet-100 text-violet-800' },
    { name: 'Sky', value: 'bg-sky-100 text-sky-800' },
    { name: 'Teal', value: 'bg-teal-100 text-teal-800' },
    { name: 'Amber', value: 'bg-amber-100 text-amber-800' },
    { name: 'Lime', value: 'bg-lime-100 text-lime-800' },
];
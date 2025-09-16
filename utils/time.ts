import { Task } from '../types';

export const formatTime = (ms: number): string => {
  if (ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatTimer = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDueDateColor = (dueDate: string | null): string => {
    if (!dueDate) return 'text-stone-500';

    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
     due.setHours(0,0,0,0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'text-red-600'; // Overdue
    }
    if (diffDays === 0) {
        return 'text-amber-600'; // Due today
    }
    return 'text-stone-500'; // Upcoming
};

export const calculateTotalTaskTime = (task: Task, allTasks: Task[]): number => {
  const children = allTasks.filter(t => t.parentId === task.id);
  const childrenTime = children.reduce((acc, child) => acc + calculateTotalTaskTime(child, allTasks), 0);
  return task.timeLogged + childrenTime;
};
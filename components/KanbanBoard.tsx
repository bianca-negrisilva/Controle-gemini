import React from 'react';
import { Task, User, ActiveTimer, Status } from '../types';
import { STATUS_OPTIONS } from '../constants';
import { PlayIcon, PauseIcon, PriorityIcon, TrashIcon } from './icons/Icons';
import { formatTime, formatDate, getDueDateColor, calculateTotalTaskTime } from '../utils/time';
import Pill from './ui/Pill';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onUpdateTask: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  activeTimer: ActiveTimer | null;
  onSelectTask: (task: Task) => void;
}

const KanbanColumn: React.FC<{
  status: Status;
  tasks: Task[];
  children: React.ReactNode;
}> = ({ status, tasks, children }) => {
  return (
    <div className="flex-shrink-0 w-80 bg-stone-100 rounded-lg p-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${STATUS_OPTIONS[status].color}`}></span>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-stone-600">{status}</h3>
        </div>
        <span className="text-sm font-bold text-stone-500 bg-stone-200 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div className="space-y-3 h-full overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ 
    task: Task; 
    allTasks: Task[];
    onStartTimer: (taskId: string) => void; 
    onDeleteTask: (taskId: string) => void;
    onSelectTask: (task: Task) => void;
    isActive: boolean;
}> = ({ task, allTasks, onStartTimer, onDeleteTask, onSelectTask, isActive }) => (
  <div 
    onClick={() => onSelectTask(task)}
    className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-stone-800 flex-1 pr-2">{task.name}</p>
        {task.assignee && (
            <img 
                src={task.assignee.avatarUrl} 
                alt={task.assignee.name} 
                className="h-7 w-7 rounded-full border-2 border-white -mt-1 flex-shrink-0" 
                title={task.assignee.name} 
            />
        )}
    </div>
    <div className="flex flex-wrap gap-1.5 mb-3">
      {task.tags.map(tag => (
        <Pill key={tag.id} colorClass={tag.color}>#{tag.name}</Pill>
      ))}
    </div>
    <div className="flex justify-between items-center text-xs text-stone-500">
      <span className={`font-medium ${getDueDateColor(task.dueDate)}`}>{task.dueDate ? formatDate(task.dueDate) : ''}</span>
      <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
        <PriorityIcon priority={task.priority} className="h-4 w-4" />
        <span className="font-mono">{formatTime(calculateTotalTaskTime(task, allTasks))}</span>
        <button onClick={() => onStartTimer(task.id)} className="p-1.5 rounded-full text-stone-500 hover:bg-stone-200" aria-label={isActive ? 'Pause timer' : 'Start timer'}>
          {isActive ? <PauseIcon className="h-4 w-4 text-amber-600" /> : <PlayIcon className="h-4 w-4 text-teal-600" />}
        </button>
        <button onClick={() => onDeleteTask(task.id)} className="p-1.5 rounded-full text-stone-500 hover:bg-red-100 hover:text-red-600" aria-label="Delete task">
            <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const KanbanBoard: React.FC<KanbanBoardProps> = (props) => {
  const { tasks, activeTimer, onStartTimer, onDeleteTask, onSelectTask } = props;
  const columns = Object.values(Status).map(status => ({
    status,
    tasks: tasks.filter(task => task.status === status)
  }));

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columns.map(({ status, tasks: columnTasks }) => (
        <KanbanColumn key={status} status={status} tasks={columnTasks}>
          {columnTasks.map(task => (
            <TaskCard 
                key={task.id} 
                task={task} 
                allTasks={tasks}
                onStartTimer={onStartTimer}
                onDeleteTask={onDeleteTask}
                onSelectTask={onSelectTask}
                isActive={activeTimer?.taskId === task.id}
            />
          ))}
        </KanbanColumn>
      ))}
    </div>
  );
};

export default KanbanBoard;
import React, { useState, useRef, useEffect } from 'react';
import { Task, User, ActiveTimer, CustomField, Status, Priority } from '../types';
import TaskTableRow from './TaskTableRow';
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, TrashIcon, DragHandleIcon } from './icons/Icons';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants';

type SortConfig = { key: string; direction: 'ascending' | 'descending' } | null;

interface TaskTableProps {
  tasks: { task: Task, level: number }[];
  allTasks: Task[];
  users: User[];
  customFields: CustomField[];
  onUpdateTask: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  activeTimer: ActiveTimer | null;
  onSelectTask: (task: Task) => void;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  filters: Record<string, string | string[]>;
  onFilterChange: (key: string, value: string | string[]) => void;
  onAddCustomField: (name: string) => void;
  onDeleteCustomField: (fieldId: string) => void;
  columnOrder: string[];
  onColumnOrderChange: (newOrder: string[]) => void;
  onReorderTasks: (draggedId: string, targetId: string) => void;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
}

const columnHeaders: Record<string, string> = {
  'name': 'Task',
  'assignee.name': 'Assignee',
  'status': 'Status',
  'priority': 'Priority',
  'tags': 'Tags',
  'dueDate': 'Due Date',
  'timeLogged': 'Time Logged'
};

const TaskTable: React.FC<TaskTableProps> = (props) => {
  const { tasks, customFields, filters, onFilterChange, users, onAddCustomField, onDeleteCustomField, onSort, sortConfig, columnOrder, onColumnOrderChange } = props;
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const newColumnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popupRef]);
  
  useEffect(() => {
    if (isAddingColumn) {
      newColumnInputRef.current?.focus();
    }
  }, [isAddingColumn]);

  const handleMultiSelectChange = (key: string, value: string) => {
      const currentValues = (filters[key] as string[] | undefined) || [];
      const newValues = currentValues.includes(value) 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
      onFilterChange(key, newValues);
  }
  
  const getButtonText = (selected: string[] | undefined, defaultText: string) => {
    if (!selected || selected.length === 0) return defaultText;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  }
  
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddCustomField(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleColumnDragStart = (e: React.DragEvent<HTMLTableCellElement>, columnKey: string) => {
    e.dataTransfer.setData('columnKey', columnKey);
  };
  
  const handleColumnDrop = (e: React.DragEvent<HTMLTableCellElement>, targetKey: string) => {
    const draggedKey = e.dataTransfer.getData('columnKey');
    if (draggedKey && draggedKey !== targetKey) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedKey);
      const targetIndex = newOrder.indexOf(targetKey);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedKey);
      onColumnOrderChange(newOrder);
    }
     document.querySelectorAll('.column-drag-over').forEach(el => el.classList.remove('column-drag-over'));
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    document.querySelectorAll('.column-drag-over').forEach(el => el.classList.remove('column-drag-over'));
    e.currentTarget.classList.add('column-drag-over');
  };

  const renderFilter = (columnKey: string) => {
    if (columnKey === 'assignee.name') {
       return (
         <div ref={activeFilter === 'assignee.name' ? popupRef : null}>
           <button onClick={() => setActiveFilter(activeFilter === 'assignee.name' ? null : 'assignee.name')} className="w-full text-left px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-700 hover:border-teal-500">
               {getButtonText((filters['assignee.name'] as string[]), 'Filter...')}
           </button>
           {activeFilter === 'assignee.name' && (
             <div className="absolute z-20 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-stone-200 p-2 space-y-1 max-h-60 overflow-y-auto">
                 {users.map(user => (
                   <label key={user.id} className="flex items-center space-x-2 text-sm font-normal text-stone-700 cursor-pointer p-1 rounded hover:bg-stone-100">
                     <input type="checkbox" className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" checked={((filters['assignee.name'] as string[]) || []).includes(user.name)} onChange={() => handleMultiSelectChange('assignee.name', user.name)} />
                     <span>{user.name}</span>
                   </label>
                 ))}
                 {((filters['assignee.name'] as string[]) || []).length > 0 && <button onClick={() => onFilterChange('assignee.name', [])} className="w-full text-center text-xs mt-1 text-stone-500 hover:text-red-600">Clear</button>}
             </div>
           )}
         </div>
       );
    }
    if(columnKey === 'status') {
      return (
        <div ref={activeFilter === 'status' ? popupRef : null}>
          <button onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')} className="w-full text-left px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-700 hover:border-teal-500">
              {getButtonText((filters.status as string[]), 'Filter...')}
          </button>
          {activeFilter === 'status' && (
            <div className="absolute z-20 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-stone-200 p-2 space-y-1">
                {Object.values(Status).map(s => (
                  <label key={s} className="flex items-center space-x-2 text-sm font-normal text-stone-700 cursor-pointer p-1 rounded hover:bg-stone-100">
                    <input type="checkbox" className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" checked={((filters.status as string[]) || []).includes(s)} onChange={() => handleMultiSelectChange('status', s)} />
                    <span>{STATUS_OPTIONS[s].label}</span>
                  </label>
                ))}
                {((filters.status as string[]) || []).length > 0 && <button onClick={() => onFilterChange('status', [])} className="w-full text-center text-xs mt-1 text-stone-500 hover:text-red-600">Clear</button>}
            </div>
          )}
        </div>
      );
    }
     if(columnKey === 'priority') {
      return (
        <div ref={activeFilter === 'priority' ? popupRef : null}>
          <button onClick={() => setActiveFilter(activeFilter === 'priority' ? null : 'priority')} className="w-full text-left px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-700 hover:border-teal-500">
              {getButtonText((filters.priority as string[]), 'Filter...')}
          </button>
          {activeFilter === 'priority' && (
            <div className="absolute z-20 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-stone-200 p-2 space-y-1">
                {Object.values(Priority).map(p => (
                  <label key={p} className="flex items-center space-x-2 text-sm font-normal text-stone-700 cursor-pointer p-1 rounded hover:bg-stone-100">
                    <input type="checkbox" className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" checked={((filters.priority as string[]) || []).includes(p)} onChange={() => handleMultiSelectChange('priority', p)} />
                    <span>{PRIORITY_OPTIONS[p].label}</span>
                  </label>
                ))}
                {((filters.priority as string[]) || []).length > 0 && <button onClick={() => onFilterChange('priority', [])} className="w-full text-center text-xs mt-1 text-stone-500 hover:text-red-600">Clear</button>}
            </div>
          )}
        </div>
      );
    }
    
    // Default text input filter
    return (
        <input
            type="text"
            placeholder={'Filter...'}
            value={(filters[columnKey] as string) || ''}
            onChange={(e) => onFilterChange(columnKey, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-stone-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            onClick={(e) => e.stopPropagation()}
        />
    )
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-stone-500">
          <thead className="text-xs text-stone-700 uppercase bg-stone-100 border-b-2 border-stone-200">
            <tr>
              <th scope="col" className="px-2 py-3 w-10"></th>
              {columnOrder.map(columnKey => {
                const field = customFields.find(f => `customFields.${f.id}` === columnKey);
                const title = field ? field.name : columnHeaders[columnKey];
                const isSorted = sortConfig?.key === columnKey;
                const direction = sortConfig?.direction;

                return (
                  <th scope="col" key={columnKey} className="px-6 py-3 group whitespace-nowrap cursor-grab" 
                    draggable 
                    onDragStart={(e) => handleColumnDragStart(e, columnKey)} 
                    onDrop={(e) => handleColumnDrop(e, columnKey)}
                    onDragOver={handleColumnDragOver}
                    onDragLeave={(e) => e.currentTarget.classList.remove('column-drag-over')}
                  >
                    <div className="flex items-center justify-between">
                      <button onClick={() => onSort(columnKey)} className="flex items-center gap-1">
                        {title}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {isSorted ? (
                                direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            ) : (
                                <ArrowUpIcon className="h-4 w-4 text-stone-400" />
                            )}
                        </span>
                      </button>
                       {field && (
                        <button onClick={() => onDeleteCustomField(field.id)} className="p-1 -mr-2 rounded-full text-stone-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600">
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                       )}
                    </div>
                  </th>
                );
              })}
              <th scope="col" className="px-6 py-3 text-center">Timer</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
               <th scope="col" className="px-2 py-3 w-10">
                {isAddingColumn ? (
                    <div className="flex items-center gap-1">
                        <input
                            ref={newColumnInputRef}
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onBlur={handleAddColumn}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                            className="w-28 px-2 py-1 text-xs border border-teal-500 rounded-md ring-1 ring-teal-500"
                            placeholder="Column Name"
                        />
                    </div>
                ) : (
                    <button onClick={() => setIsAddingColumn(true)} className="p-1.5 text-stone-400 hover:text-teal-600 hover:bg-stone-200 rounded-md">
                        <PlusIcon className="h-4 w-4" />
                    </button>
                )}
            </th>
            </tr>
            <tr className="bg-stone-50">
                <th className="p-1"></th>
                {columnOrder.map(key => (
                  <th key={key} className="p-1 font-normal relative">
                    {renderFilter(key)}
                  </th>
                ))}
                <th className="p-1"></th>
                <th className="p-1"></th>
                <th className="p-1"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(taskWithLevel => (
              <TaskTableRow key={taskWithLevel.task.id} task={taskWithLevel} {...props} />
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default TaskTable;
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Task, User, Status, Priority, ActiveTimer, CustomField } from '../types';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants';
import { formatTime, formatDate, getDueDateColor, calculateTotalTaskTime } from '../utils/time';
import { PlayIcon, PauseIcon, PriorityIcon, TrashIcon, DragHandleIcon, ArrowDownIcon, ArrowUpIcon } from './icons/Icons';
import Pill from './ui/Pill';

interface TaskTableRowProps {
  task: { task: Task; level: number };
  allTasks: Task[];
  users: User[];
  customFields: CustomField[];
  onUpdateTask: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  activeTimer: ActiveTimer | null;
  onSelectTask: (task: Task) => void;
  columnOrder: string[];
  onReorderTasks: (draggedId: string, targetId: string) => void;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = (props) => {
  const { task: taskWithLevel, allTasks, users, customFields, onUpdateTask, onStartTimer, onDeleteTask, activeTimer, onSelectTask, columnOrder, onReorderTasks, expandedTasks, onToggleExpand } = props;
  const { task, level } = taskWithLevel;
  const isTimerRunning = activeTimer?.taskId === task.id;
  const [editingField, setEditingField] = useState<null | 'status' | 'priority' | 'assignee' | 'dueDate' | string>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [editedCustomFieldValue, setEditedCustomFieldValue] = useState('');
  const customFieldInputRef = useRef<HTMLInputElement>(null);
  
  const hasChildren = useMemo(() => allTasks.some(t => t.parentId === task.id), [allTasks, task.id]);
  const isExpanded = expandedTasks.has(task.id);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setEditingField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupRef]);
  
  useEffect(() => {
    if (isEditingName) {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (editingField && editingField.startsWith('cf-')) {
        customFieldInputRef.current?.focus();
        customFieldInputRef.current?.select();
    }
  }, [editingField]);
  
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.currentTarget.style.opacity = '0.4';
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.drag-over-indicator').forEach(el => el.classList.remove('drag-over-indicator'));
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    document.querySelectorAll('.drag-over-indicator').forEach(el => el.classList.remove('drag-over-indicator'));
    e.currentTarget.classList.add('drag-over-indicator');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('drag-over-indicator');
  };
  
  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('taskId');
    const targetId = task.id;
    if (draggedId && targetId && draggedId !== targetId) {
        onReorderTasks(draggedId, targetId);
    }
    e.currentTarget.classList.remove('drag-over-indicator');
  };


  const renderCellContent = (columnKey: string) => {
    // Name Cell
    if (columnKey === 'name') {
      return (
         <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
          {hasChildren ? (
            <button onClick={() => onToggleExpand(task.id)} className="p-1 -ml-6 mr-1 rounded-full hover:bg-stone-200">
               {isExpanded ? <ArrowUpIcon className="h-3 w-3 text-stone-500" /> : <ArrowDownIcon className="h-3 w-3 text-stone-500" />}
            </button>
          ) : (
            <span className="w-4 inline-block -ml-5"></span>
          )}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={() => {
                if (editedName.trim() && editedName !== task.name) onUpdateTask({ ...task, name: editedName.trim() });
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              className="font-semibold text-stone-900 bg-white border border-stone-300 rounded-md px-1 py-0.5 w-full"
            />
          ) : (
            <button onClick={() => { setEditedName(task.name); setIsEditingName(true); }} className="text-left font-semibold hover:text-teal-600 transition-colors">
              {task.name}
            </button>
          )}
        </div>
      );
    }

    // Assignee Cell
    if (columnKey === 'assignee.name') {
      return (
        <div className="relative">
            <button onClick={() => setEditingField(editingField === 'assignee' ? null : 'assignee')} className="flex items-center w-full text-left p-1 -m-1 rounded hover:bg-stone-100 transition-colors">
              {task.assignee ? (
                <>
                  <img className="h-6 w-6 rounded-full mr-2" src={task.assignee.avatarUrl} alt={task.assignee.name} />
                  <span>{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-stone-400">Unassigned</span>
              )}
            </button>
            {editingField === 'assignee' && (
               <div ref={popupRef} className="absolute z-10 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-stone-200 p-1 max-h-60 overflow-y-auto">
                 <button onClick={() => { onUpdateTask({ ...task, assignee: null }); setEditingField(null); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100 text-stone-500">Unassigned</button>
                 {users.map(user => (
                   <button
                     key={user.id}
                     onClick={() => { onUpdateTask({ ...task, assignee: user }); setEditingField(null); }}
                     className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100 flex items-center"
                   >
                     <img src={user.avatarUrl} className="h-5 w-5 rounded-full mr-2" />
                     {user.name}
                   </button>
                 ))}
               </div>
            )}
        </div>
      );
    }

    // Status Cell
    if (columnKey === 'status') {
      return (
        <div className="relative">
          <button onClick={() => setEditingField(editingField === 'status' ? null : 'status')} className="w-full text-left">
            <Pill colorClass={STATUS_OPTIONS[task.status].color}>
              {STATUS_OPTIONS[task.status].label}
            </Pill>
          </button>
          {editingField === 'status' && (
            <div ref={popupRef} className="absolute z-10 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-stone-200 p-1">
              {Object.values(Status).map(s => (
                <button
                  key={s}
                  onClick={() => { onUpdateTask({ ...task, status: s }); setEditingField(null); }}
                  className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100 flex items-center"
                >
                  <span className={`h-2.5 w-2.5 rounded-full mr-2 ${STATUS_OPTIONS[s].color}`}></span>
                  {STATUS_OPTIONS[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Priority Cell
    if (columnKey === 'priority') {
        return (
             <div className="relative">
                <button onClick={() => setEditingField(editingField === 'priority' ? null : 'priority')} className="w-full">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_OPTIONS[task.priority].bgColor} ${PRIORITY_OPTIONS[task.priority].color}`}>
                        <PriorityIcon priority={task.priority} className="h-4 w-4 mr-1"/>
                        {PRIORITY_OPTIONS[task.priority].label}
                    </div>
                </button>
                {editingField === 'priority' && (
                    <div ref={popupRef} className="absolute z-10 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-stone-200 p-1">
                    {Object.values(Priority).map(p => (
                        <button key={p} onClick={() => { onUpdateTask({ ...task, priority: p }); setEditingField(null); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100 flex items-center">
                            <PriorityIcon priority={p} className={`h-4 w-4 mr-2 ${PRIORITY_OPTIONS[p].color}`}/>
                            {PRIORITY_OPTIONS[p].label}
                        </button>
                    ))}
                    </div>
                )}
            </div>
        );
    }

    // Tags Cell
    if (columnKey === 'tags') {
      return (
        <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <Pill key={tag.id} colorClass={tag.color}>#{tag.name}</Pill>
            ))}
        </div>
      );
    }

    // Due Date Cell
    if (columnKey === 'dueDate') {
      return (
        <div className="relative">
          <button onClick={() => setEditingField(editingField === 'dueDate' ? null : 'dueDate')} className={`w-full text-left p-1 -m-1 rounded hover:bg-stone-100 transition-colors ${getDueDateColor(task.dueDate)}`}>
              {task.dueDate ? formatDate(task.dueDate) : <span className="text-stone-400">-</span>}
          </button>
           {editingField === 'dueDate' && (
             <div ref={popupRef} className="absolute z-10 top-full mt-1 bg-white rounded-md shadow-lg border border-stone-200 p-2">
               <input
                 type="date"
                 value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                 onChange={(e) => {
                    const newDueDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                    onUpdateTask({ ...task, dueDate: newDueDate });
                    setEditingField(null);
                 }}
                 className="block w-full text-sm border-stone-300 rounded-md"
               />
               <button onClick={() => { onUpdateTask({ ...task, dueDate: null }); setEditingField(null); }} className="w-full text-center text-xs mt-2 text-stone-500 hover:text-red-600">
                 Clear date
               </button>
             </div>
          )}
        </div>
      );
    }

    // Time Logged Cell
    if (columnKey === 'timeLogged') {
        return formatTime(calculateTotalTaskTime(task, allTasks));
    }
    
    // Custom Fields
    if (columnKey.startsWith('customFields.')) {
        const fieldId = columnKey.split('.')[1];
        return editingField === `cf-${fieldId}` ? (
             <input
                ref={customFieldInputRef}
                type="text"
                value={editedCustomFieldValue}
                onChange={(e) => setEditedCustomFieldValue(e.target.value)}
                onBlur={() => {
                    const newCustomFields = { ...task.customFields, [fieldId]: editedCustomFieldValue };
                    onUpdateTask({ ...task, customFields: newCustomFields });
                    setEditingField(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setEditingField(null);
                }}
                className="text-stone-900 bg-white border border-stone-300 rounded-md px-1 py-0.5 -m-1 w-full"
            />
        ) : (
            <button onClick={() => { setEditingField(`cf-${fieldId}`); setEditedCustomFieldValue(task.customFields?.[fieldId] || ''); }} className="w-full text-left p-1 -m-1 rounded hover:bg-stone-100 transition-colors min-h-[24px]">
                {task.customFields?.[fieldId] || <span className="text-stone-400">-</span>}
            </button>
        );
    }
    
    return null;
  };

  return (
    <tr 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-b border-stone-200 transition-colors cursor-grab ${level > 0 ? 'bg-stone-200 hover:bg-stone-300' : 'bg-white hover:bg-stone-50'}`}
    >
        <td className="px-2 py-4 text-center text-stone-400 w-10">
            <DragHandleIcon className="h-5 w-5" />
        </td>
      
        {columnOrder.map(key => (
            <td key={key} className="px-6 py-4 font-medium text-stone-900 align-top">
                {renderCellContent(key)}
            </td>
        ))}
      
        <td className="px-6 py-4 text-center align-top">
            <button
            onClick={() => onStartTimer(task.id)}
            className={`p-2 rounded-full transition-colors ${
                isTimerRunning
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
            }`}
            aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
            {isTimerRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
        </td>
        <td className="px-6 py-4 text-center align-top">
            <button
            onClick={() => onSelectTask(task)}
            className="p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors mr-1"
            aria-label="View task details"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            </button>
            <button
            onClick={() => onDeleteTask(task.id)}
            className="p-2 rounded-full text-stone-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            aria-label="Delete task"
            >
            <TrashIcon className="h-5 w-5" />
            </button>
        </td>
        <td className="w-10"></td>
    </tr>
  );
};

export default TaskTableRow;
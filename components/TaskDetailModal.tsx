import React, { useState, useEffect, useRef } from 'react';
import { Task, Tag, User, Status, Priority, CustomField, ActiveTimer } from '../types';
import Modal from './ui/Modal';
import { PlusIcon, PlayIcon, PauseIcon, TrashIcon } from './icons/Icons';
import { TAG_COLORS } from '../constants';
import { formatDate, formatTime } from '../utils/time';

interface TaskDetailModalProps {
  task: Task | null;
  allTasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'dateAdded' | 'addedBy' | 'timeLogged'>) => void;
  onAddTag: (tag: Omit<Tag, 'id'>) => Tag;
  allTags: Tag[];
  allUsers: User[];
  customFields: CustomField[];
  onStartTimer: (taskId: string) => void;
  activeTimer: ActiveTimer | null;
}

const TagCreator: React.FC<{
  onTagCreate: (name: string, color: string) => void;
  onCancel: () => void;
}> = ({ onTagCreate, onCancel }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0].value);

  const handleCreate = () => {
    if (name.trim()) {
      onTagCreate(name, color);
    }
  };

  return (
    <div className="p-2 border-t border-stone-200 space-y-2">
      <input type="text" placeholder="New tag name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm" autoFocus />
      <select value={color} onChange={e => setColor(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm bg-white">
        {TAG_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
      </select>
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-3 py-1 text-xs font-semibold rounded-md hover:bg-stone-100">Cancel</button>
        <button onClick={handleCreate} className="px-3 py-1 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700">Add</button>
      </div>
    </div>
  );
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = (props) => {
    const { task, allTasks, isOpen, onClose, onUpdateTask, onAddTask, onAddTag, allTags, allUsers, customFields, onStartTimer, activeTimer } = props;
    const [editedTask, setEditedTask] = useState<Task | null>(task);
    const tagDropdownRef = useRef<HTMLDivElement>(null);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newSubtaskName, setNewSubtaskName] = useState('');

    const subtasks = allTasks.filter(t => t.parentId === task?.id);

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
                setIsTagDropdownOpen(false);
                setIsCreatingTag(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [tagDropdownRef]);

    if (!isOpen || !editedTask) return null;

    const handleFieldChange = (field: keyof Task, value: any) => {
        const updatedTask = { ...editedTask, [field]: value };
        setEditedTask(updatedTask);
        onUpdateTask(updatedTask); // Update immediately for responsiveness
    };

    const handleCustomFieldChange = (fieldId: string, value: string) => {
        const newCustomFields = { ...editedTask.customFields, [fieldId]: value };
        handleFieldChange('customFields', newCustomFields);
    }

    const handleAssigneeChange = (userId: string) => {
        const user = allUsers.find(u => u.id === userId) || null;
        handleFieldChange('assignee', user);
    }
    
    const handleDueDateChange = (date: string) => {
        const isoString = date ? new Date(date).toISOString() : null;
        handleFieldChange('dueDate', isoString);
    }

    const handleTagRemove = (tagId: string) => {
        handleFieldChange('tags', editedTask.tags.filter(t => t.id !== tagId));
    };

    const handleTagAdd = (tag: Tag) => {
        handleFieldChange('tags', [...editedTask.tags, tag]);
        setIsTagDropdownOpen(false);
    };

    const handleTagCreate = (name: string, color: string) => {
        const newTag = onAddTag({ name: name.toLowerCase(), color });
        handleTagAdd(newTag);
        setIsCreatingTag(false);
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskName.trim()) return;
        onAddTask({
            name: newSubtaskName.trim(),
            status: Status.ToDo,
            priority: editedTask.priority,
            parentId: editedTask.id,
            assignee: null,
            dueDate: null,
            tags: [],
        });
        setNewSubtaskName('');
    };

    const availableTags = allTags.filter(tag => !editedTask.tags.some(t => t.id === tag.id));
    const formattedDueDate = editedTask.dueDate ? editedTask.dueDate.split('T')[0] : '';


    return (
        <Modal onClose={onClose} title="Task Details">
            <div className="space-y-6">
                <input type="text" value={editedTask.name} onChange={e => handleFieldChange('name', e.target.value)} className="w-full text-2xl font-bold font-serif text-stone-800 border-none p-0 focus:ring-0" />
                
                <textarea value={editedTask.description || ''} onChange={e => handleFieldChange('description', e.target.value)} rows={4} className="w-full p-2 border border-stone-300 rounded-md" placeholder="Add a description..."></textarea>
                
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="text-sm font-medium text-stone-600">Assignee</label>
                        <select value={editedTask.assignee?.id ?? ''} onChange={e => handleAssigneeChange(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white">
                            <option value="">Unassigned</option>
                            {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-600">Due Date</label>
                        <input type="date" value={formattedDueDate} onChange={e => handleDueDateChange(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="text-sm font-medium text-stone-600">Status</label>
                        <select value={editedTask.status} onChange={e => handleFieldChange('status', e.target.value as Status)} className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white">
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-600">Priority</label>
                         <select value={editedTask.priority} onChange={e => handleFieldChange('priority', e.target.value as Priority)} className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-stone-600">Tags</label>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {editedTask.tags.map(tag => (
                            <div key={tag.id} className={`flex items-center pl-2.5 pr-1 py-0.5 text-xs font-semibold rounded-full ${tag.color}`}>
                                #{tag.name}
                                <button onClick={() => handleTagRemove(tag.id)} className="ml-1.5 opacity-50 hover:opacity-100">&times;</button>
                            </div>
                        ))}
                        <div className="relative" ref={tagDropdownRef}>
                            <button onClick={() => setIsTagDropdownOpen(p => !p)} type="button" className="flex items-center px-2 py-1 text-xs font-semibold rounded-full border border-stone-300 hover:bg-stone-100 transition-colors">
                                <PlusIcon className="h-4 w-4 mr-0.5" /> Add
                            </button>
                            {isTagDropdownOpen && (
                                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-stone-200 z-10">
                                    <div className="p-1 max-h-40 overflow-y-auto">
                                        {availableTags.length > 0 ? availableTags.map(tag => (
                                            <button key={tag.id} onClick={() => handleTagAdd(tag)} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100">
                                                {tag.name}
                                            </button>
                                        )) : <p className="text-xs text-stone-400 px-2 py-1">No other tags</p>}
                                    </div>
                                    {isCreatingTag ? (
                                        <TagCreator onTagCreate={handleTagCreate} onCancel={() => setIsCreatingTag(false)} />
                                    ) : (
                                        <div className="border-t border-stone-200 p-1">
                                            <button onClick={() => setIsCreatingTag(true)} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100 font-semibold text-teal-600">
                                                Create new tag...
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200">
                    <label className="text-sm font-medium text-stone-600">Subtasks</label>
                    <div className="space-y-2">
                         {subtasks.map(subtask => {
                             const isSubtaskTimerRunning = activeTimer?.taskId === subtask.id;
                             return (
                                <div key={subtask.id} className="flex items-center p-2 rounded-md hover:bg-stone-50 group">
                                    <span className={`flex-grow ${subtask.status === Status.Done ? 'line-through text-stone-400' : ''}`}>{subtask.name}</span>
                                    <span className="text-xs font-mono text-stone-500 mr-2">{formatTime(subtask.timeLogged)}</span>
                                     <button
                                        onClick={() => onStartTimer(subtask.id)}
                                        className={`p-1.5 rounded-full transition-colors ${
                                            isSubtaskTimerRunning
                                            ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                                            : 'text-teal-600 hover:bg-teal-100'
                                        }`}
                                    >
                                        {isSubtaskTimerRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                             )
                        })}
                    </div>
                     <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2">
                        <input 
                            type="text" 
                            placeholder="Add a new subtask..." 
                            value={newSubtaskName}
                            onChange={e => setNewSubtaskName(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded-md text-sm" 
                        />
                        <button type="submit" className="flex-shrink-0 bg-stone-200 text-stone-600 font-semibold px-3 py-2 rounded-lg hover:bg-stone-300 transition-colors">
                           Add
                        </button>
                    </form>
                </div>
                
                {customFields.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                        {customFields.map(field => (
                            <div key={field.id}>
                                <label className="text-sm font-medium text-stone-600">{field.name}</label>
                                <input
                                    type="text"
                                    value={editedTask.customFields?.[field.id] || ''}
                                    onChange={e => handleCustomFieldChange(field.id, e.target.value)}
                                    className="w-full mt-1 p-2 border border-stone-300 rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                )}


                <div className="text-xs text-stone-500 pt-4 border-t border-stone-200">
                    Added by {editedTask.addedBy.name} on {formatDate(editedTask.dateAdded)}
                </div>

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-stone-100">Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailModal;
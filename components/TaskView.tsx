import React, { useState, useMemo, useEffect } from 'react';
import { Task, User, ActiveTimer, Status, Priority, Tag, CustomField } from '../types';
import { TableIcon, KanbanIcon, CalendarIcon, PlusIcon } from './icons/Icons';
import TaskTable from './TaskTable';
import KanbanBoard from './KanbanBoard';
import ConfirmationModal from './ui/ConfirmationModal';
import Modal from './ui/Modal';
import { formatDate } from '../utils/time';

type SortConfig = { key: string; direction: 'ascending' | 'descending' } | null;

const DEFAULT_COLUMNS = ['name', 'assignee.name', 'status', 'priority', 'tags', 'dueDate', 'timeLogged'];

interface TaskViewProps {
  tasks: Task[];
  users: User[];
  tags: Tag[];
  customFields: CustomField[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'dateAdded' | 'addedBy' | 'timeLogged'>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => User;
  onStartTimer: (taskId: string) => void;
  activeTimer: ActiveTimer | null;
  onSelectTask: (task: Task) => void;
  onAddCustomField: (name: string) => void;
  onDeleteCustomField: (fieldId: string) => void;
  onReorderTasks: (draggedId: string, targetId: string) => void;
}

interface AddUserModalProps {
    onClose: () => void;
    onAddUser: (user: Omit<User, 'id'>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
    const [name, setName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !jobTitle.trim()) {
            alert('Name and job title are required.');
            return;
        }
        onAddUser({
            name,
            jobTitle,
            avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-serif text-stone-800 mb-4">Add New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="text-sm font-medium text-stone-600">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-stone-600">Job Title</label>
                        <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-600">Avatar URL (Optional)</label>
                        <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-stone-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700">Add User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface NewTaskModalProps {
    onClose: () => void;
    onAddTask: (task: Omit<Task, 'id' | 'dateAdded' | 'addedBy' | 'timeLogged'>) => void;
    onAddUser: (user: Omit<User, 'id'>) => User;
    users: User[];
    tags: Tag[];
    customFields: CustomField[];
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onAddTask, onAddUser, users, tags, customFields }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>(Status.ToDo);
    const [priority, setPriority] = useState<Priority>(Priority.Medium);
    const [dueDate, setDueDate] = useState<string>('');
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);


    const handleTagToggle = (tagId: string) => {
        const newSelected = new Set(selectedTagIds);
        if (newSelected.has(tagId)) {
            newSelected.delete(tagId);
        } else {
            newSelected.add(tagId);
        }
        setSelectedTagIds(newSelected);
    }
    
    const handleCustomFieldChange = (fieldId: string, value: string) => {
        setCustomFieldValues(prev => ({...prev, [fieldId]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Task name is required.');
            return;
        }

        const assignee = users.find(u => u.id === assigneeId) || null;
        const selectedTags = tags.filter(t => selectedTagIds.has(t.id));
        
        onAddTask({
            name,
            description,
            assignee,
            status,
            priority,
            dueDate: dueDate || null,
            tags: selectedTags,
            customFields: customFieldValues,
            parentId: null
        });

        onClose();
    };
    
    const handleUserAdded = (user: Omit<User, 'id'>) => {
        const newUser = onAddUser(user);
        setAssigneeId(newUser.id);
        setIsAddUserModalOpen(false);
    }

    return (
        <Modal onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-stone-600">Task Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-stone-600">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-stone-300 rounded-md"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium text-stone-600">Assignee</label>
                        <select 
                            value={assigneeId ?? ''}
                            onChange={e => {
                                if (e.target.value === 'add-new-user') {
                                    setIsAddUserModalOpen(true);
                                } else {
                                    setAssigneeId(e.target.value || null);
                                }
                            }}
                            className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white"
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            <option value="add-new-user" className="font-semibold text-teal-600">-- Add new user... --</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-600">Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium text-stone-600">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Status)} className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white">
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-600">Priority</label>
                         <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full mt-1 p-2 border border-stone-300 rounded-md bg-white">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-stone-600">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                            <button
                                type="button"
                                key={tag.id}
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                    selectedTagIds.has(tag.id)
                                        ? `${tag.color} border-transparent`
                                        : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                                }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
                 {customFields.length > 0 && <div className="space-y-4 pt-2 border-t border-stone-200">
                    {customFields.map(field => (
                        <div key={field.id}>
                            <label className="text-sm font-medium text-stone-600">{field.name}</label>
                            <input type="text" value={customFieldValues[field.id] || ''} onChange={e => handleCustomFieldChange(field.id, e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md"/>
                        </div>
                    ))}
                </div>}
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-stone-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700">Create Task</button>
                </div>
            </form>
            {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                    onAddUser={handleUserAdded}
                />
            )}
        </Modal>
    );
};


const TaskView: React.FC<TaskViewProps> = (props) => {
  const { tasks, onDeleteTask, customFields, onReorderTasks } = props;
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string | string[]>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const [columnOrder, setColumnOrder] = useState<string[]>(() => [
    ...DEFAULT_COLUMNS,
    ...customFields.map(f => `customFields.${f.id}`)
  ]);
  
  const tasksById = useMemo(() => tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, Task>), [tasks]);

  useEffect(() => {
    setColumnOrder(currentOrder => {
      const customFieldKeys = customFields.map(f => `customFields.${f.id}`);
      const allPossibleKeys = new Set([...DEFAULT_COLUMNS, ...customFieldKeys]);
      
      const filteredOrder = currentOrder.filter(key => allPossibleKeys.has(key));
      const newKeys = customFieldKeys.filter(key => !currentOrder.includes(key));
      
      return [...filteredOrder, ...newKeys];
    });
  }, [customFields]);


  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let displayTasks = [...tasks]; 

    // Filtering logic
    const filtered = displayTasks.filter(task => {
      const passesFilter = Object.entries(filters).every(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return true;

        if (key === 'tags') {
            const lowerCaseValue = String(value).toLowerCase();
            return task.tags.some(tag => tag.name.toLowerCase().includes(lowerCaseValue));
        }

        if (key.startsWith('customFields.')) {
            const fieldId = key.split('.')[1];
            const taskValue = task.customFields?.[fieldId];
            return taskValue?.toLowerCase().includes(String(value).toLowerCase());
        }

        const taskValue = getNestedValue(task, key);
        
        if (Array.isArray(value)) {
            return value.includes(taskValue);
        }

        if (taskValue === null || taskValue === undefined) return false;

        const lowerCaseValue = String(value).toLowerCase();
        
        switch (key) {
          case 'assignee.name':
            return taskValue.toLowerCase().includes(lowerCaseValue);
          case 'dueDate':
            return formatDate(taskValue).toLowerCase().includes(lowerCaseValue);
          default:
            return String(taskValue).toLowerCase().includes(lowerCaseValue);
        }
      });
      // If a task passes, we also want to keep its ancestors so the hierarchy is not broken
      if (passesFilter) {
        return true;
      }
      // Check if any ancestor passes the filter to keep the child visible
      let current = task;
      while (current.parentId) {
        current = tasksById[current.parentId];
        if (!current) return false;
         if (Object.entries(filters).every(([key, value]) => {
           if (!value || (Array.isArray(value) && value.length === 0)) return true;
           const parentValue = getNestedValue(current, key);
           return String(parentValue).toLowerCase().includes(String(value).toLowerCase());
         })) {
           // For simplicity, we don't handle all filter types for parents.
           // This is a basic implementation to keep hierarchy.
         }
      }

      return false; // Exclude if neither task nor its parents match
    });
    
    // Create a set of filtered task IDs for quick lookup
    const filteredIds = new Set(filtered.map(t => t.id));
    
    // Ensure all parents of filtered tasks are included
    filtered.forEach(task => {
      let current = task;
      while (current.parentId && !filteredIds.has(current.parentId)) {
        const parent = tasksById[current.parentId];
        if (parent) {
          filtered.push(parent);
          filteredIds.add(parent.id);
          current = parent;
        } else {
          break;
        }
      }
    });


    // Sorting logic
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        // Keep children with their parents during sort
        if (a.parentId !== b.parentId) {
          return 0;
        }

        let aValue: any, bValue: any;
        if(sortConfig.key === 'tags') {
            aValue = a.tags.map(t => t.name).sort().join(', ');
            bValue = b.tags.map(t => t.name).sort().join(', ');
        } else if (sortConfig.key.startsWith('customFields.')) {
            const fieldId = sortConfig.key.split('.')[1];
            aValue = a.customFields?.[fieldId] || null;
            bValue = b.customFields?.[fieldId] || null;
        } else {
            aValue = getNestedValue(a, sortConfig.key);
            bValue = getNestedValue(b, sortConfig.key);
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;

  }, [tasks, filters, sortConfig, tasksById]);
  
  const visibleTasksForTable = useMemo(() => {
    const visible: {task: Task, level: number}[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const addChildren = (parentId: string | null, level: number) => {
        const children = filteredAndSortedTasks.filter(t => t.parentId === parentId);
        for(const task of children) {
            visible.push({ task, level });
            if(expandedTasks.has(task.id)) {
                addChildren(task.id, level + 1);
            }
        }
    }
    
    addChildren(null, 0);
    return visible;
  }, [filteredAndSortedTasks, expandedTasks, tasks]);


  const handleRequestDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      onDeleteTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingTaskId(null);
  };
  
  const handleReorder = (draggedId: string, targetId: string) => {
    onReorderTasks(draggedId, targetId);
    setSortConfig(null);
  }

  const taskTableProps = { 
      ...props, 
      tasks: visibleTasksForTable,
      allTasks: tasks,
      onDeleteTask: handleRequestDelete, 
      sortConfig, 
      onSort: handleSort,
      filters,
      onFilterChange: handleFilterChange,
      columnOrder,
      onColumnOrderChange: setColumnOrder,
      onReorderTasks: handleReorder,
      expandedTasks,
      onToggleExpand: toggleExpand,
  };
  const kanbanBoardProps = { ...props, tasks: filteredAndSortedTasks.filter(t => t.parentId === null), onDeleteTask: handleRequestDelete };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-800">My Tasks</h2>
            <p className="text-stone-500">Organize and track your work flow.</p>
          </div>
          <div className="flex items-center space-x-2">
              <div className="p-1 bg-stone-200 rounded-lg flex items-center">
                  <ViewButton icon={<TableIcon />} label="Table" isActive={viewMode === 'table'} onClick={() => setViewMode('table')} />
                  <ViewButton icon={<KanbanIcon />} label="Board" isActive={viewMode === 'kanban'} onClick={() => setViewMode('kanban')} />
                  <ViewButton icon={<CalendarIcon />} label="Calendar" isActive={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} />
              </div>
              <button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                  <PlusIcon className="h-5 w-5 mr-1" />
                  New Task
              </button>
          </div>
        </div>
        
        <div className="flex items-center bg-white p-2 rounded-lg border border-stone-200">
          <input 
            type="text" 
            placeholder="Search tasks by name..." 
            className="w-full bg-transparent outline-none px-2 text-sm" 
            value={(filters['name'] as string) || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>
        
        <div>
          {viewMode === 'table' && <TaskTable {...taskTableProps} />}
          {viewMode === 'kanban' && <KanbanBoard {...kanbanBoardProps} />}
          {viewMode === 'calendar' && <div className="text-center p-10 bg-white rounded-lg border border-stone-200">Calendar View Coming Soon</div>}
        </div>
      </div>
      {isNewTaskModalOpen && (
        <NewTaskModal 
            onClose={() => setIsNewTaskModalOpen(false)}
            onAddTask={props.onAddTask}
            onAddUser={props.onAddUser}
            users={props.users}
            tags={props.tags}
            customFields={props.customFields}
        />
      )}
      <ConfirmationModal
        isOpen={!!deletingTaskId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </>
  );
};

const ViewButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center transition-colors ${isActive ? 'bg-white shadow-sm text-teal-700' : 'text-stone-600 hover:bg-stone-100'}`}>
        <span className="mr-1.5 text-lg">{icon}</span>
        {label}
    </button>
);

export default TaskView;
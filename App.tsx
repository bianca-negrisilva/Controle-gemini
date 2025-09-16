import React, { useState, useEffect, useCallback } from 'react';
import { Task, ActiveTimer, User, Tag, CustomField } from './types';
import { MOCK_TASKS, MOCK_USERS, MOCK_TAGS, MOCK_CUSTOM_FIELDS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskView from './components/TaskView';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import TaskDetailModal from './components/TaskDetailModal';
import { calculateTotalTaskTime } from './utils/time';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [customFields, setCustomFields] = useState<CustomField[]>(MOCK_CUSTOM_FIELDS);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeView, setActiveView] = useState('tasks');
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  useEffect(() => {
    // If the current user was deleted, select the first one from the list.
    if (!users.find(u => u.id === currentUser.id)) {
      setCurrentUser(users[0] || null);
    }
  }, [users, currentUser]);

  useEffect(() => {
    let interval: number | undefined;
    if (activeTimer) {
      interval = window.setInterval(() => {
        setElapsedTime(Date.now() - activeTimer.startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const logTimeToTask = useCallback((taskId: string, timeToAdd: number) => {
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId 
        ? { ...t, timeLogged: t.timeLogged + timeToAdd }
        : t
    ));
  }, []);

  const handleStartTimer = useCallback((taskId: string) => {
    setActiveTimer(current => {
      if (current?.taskId === taskId) { // Pause timer
        logTimeToTask(taskId, elapsedTime);
        return null;
      } else { // Start new or switch timer
        if (current) { // Stop previous timer before starting new one
          logTimeToTask(current.taskId, Date.now() - current.startTime);
        }
        setElapsedTime(0);
        return { taskId, startTime: Date.now() };
      }
    });
  }, [elapsedTime, logTimeToTask]);

  const handleStopTimer = useCallback(() => {
    if (activeTimer) {
      logTimeToTask(activeTimer.taskId, elapsedTime);
      setActiveTimer(null);
      setElapsedTime(0);
    }
  }, [activeTimer, elapsedTime, logTimeToTask]);

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
    }
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'dateAdded' | 'addedBy' | 'timeLogged'>) => {
    const taskToAdd: Task = {
        id: `T-${Math.random().toString(36).substr(2, 9)}`,
        dateAdded: new Date().toISOString(),
        addedBy: currentUser,
        timeLogged: 0,
        customFields: {},
        ...newTask
    };
    setTasks(prevTasks => [taskToAdd, ...prevTasks]);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const tasksToDelete = new Set<string>([taskId]);
      let changed = true;
      while(changed) {
        changed = false;
        const tasksCount = tasksToDelete.size;
        prevTasks.forEach(task => {
          if(task.parentId && tasksToDelete.has(task.parentId)) {
            tasksToDelete.add(task.id);
          }
        });
        if(tasksToDelete.size > tasksCount) {
          changed = true;
        }
      }
      return prevTasks.filter(task => !tasksToDelete.has(task.id));
    });
  };
  
  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };
  
  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleAddUser = (user: Omit<User, 'id'>): User => {
    const newUser = { ...user, id: `U-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    // Unassign tasks from deleted user
    setTasks(prevTasks => prevTasks.map(t => t.assignee?.id === userId ? { ...t, assignee: null } : t));
  };

  const handleAddTag = (tag: Omit<Tag, 'id'>): Tag => {
    const newTag = { ...tag, id: `TAG-${Date.now()}` };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    // Remove deleted tag from all tasks
    setTasks(prevTasks => prevTasks.map(task => ({
        ...task,
        tags: task.tags.filter(tag => tag.id !== tagId)
    })));
  };

  const handleAddCustomField = (name: string) => {
    const newField: CustomField = { id: `CF-${Date.now()}`, name };
    setCustomFields(prev => [...prev, newField]);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    // Remove deleted field data from all tasks
    setTasks(prevTasks => prevTasks.map(task => {
        const newCustomFields = { ...task.customFields };
        delete newCustomFields[fieldId];
        return { ...task, customFields: newCustomFields };
    }));
  };

  const handleReorderTasks = (draggedId: string, targetId: string) => {
    setTasks(prevTasks => {
        const draggedIndex = prevTasks.findIndex(t => t.id === draggedId);
        const targetIndex = prevTasks.findIndex(t => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prevTasks;
        
        const draggedTask = prevTasks[draggedIndex];
        const targetTask = prevTasks[targetIndex];

        const newTasks = [...prevTasks];
        
        // Simple reorder if items have the same parent
        if (draggedTask.parentId === targetTask.parentId) {
          const [draggedItem] = newTasks.splice(draggedIndex, 1);
          const newTargetIndex = newTasks.findIndex(t => t.id === targetId);
          newTasks.splice(newTargetIndex, 0, draggedItem);
          return newTasks;
        }

        // Handle reparenting (optional, for now just log it)
        console.log(`Reparenting logic not implemented. Dragged ${draggedId} to ${targetId}`);

        return prevTasks; // Return original if complex reorder
    });
  };

  const activeTask = activeTimer ? tasks.find(t => t.id === activeTimer.taskId) : null;
  const activeTaskWithSubtasks = activeTask ? tasks.find(t => t.id === activeTask.id) : null;
  const totalTimeForActiveTask = activeTaskWithSubtasks ? calculateTotalTaskTime(activeTaskWithSubtasks, tasks) : 0;


  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          activeTask={activeTask} 
          elapsedTime={elapsedTime} 
          onStopTimer={handleStopTimer}
          isTimerRunning={!!activeTimer}
          totalTimeLogged={totalTimeForActiveTask}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-stone-50 p-6">
          {activeView === 'dashboard' && <Dashboard tasks={tasks} users={users}/>}
          {activeView === 'tasks' && (
            <TaskView 
              tasks={tasks}
              users={users}
              tags={tags}
              customFields={customFields}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onAddUser={handleAddUser}
              onStartTimer={handleStartTimer}
              activeTimer={activeTimer}
              onSelectTask={handleSelectTask}
              onAddCustomField={handleAddCustomField}
              onDeleteCustomField={handleDeleteCustomField}
              onReorderTasks={handleReorderTasks}
            />
          )}
          {activeView === 'reports' && <div className="text-center p-10">Reports Coming Soon</div>}
          {activeView === 'settings' && (
            <Settings 
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                tags={tags}
                onAddTag={handleAddTag}
                onDeleteTag={handleDeleteTag}
            />
          )}
        </main>
      </div>
       <TaskDetailModal
        task={selectedTask}
        allTasks={tasks}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
        onUpdateTask={handleUpdateTask}
        onAddTask={handleAddTask}
        onAddTag={handleAddTag}
        allTags={tags}
        allUsers={users}
        customFields={customFields}
        onStartTimer={handleStartTimer}
        activeTimer={activeTimer}
      />
    </div>
  );
};

export default App;
import React from 'react';
import { DashboardIcon, TasksIcon, ReportsIcon, SettingsIcon, LogoIcon } from './icons/Icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-teal-100 text-teal-700'
        : 'text-stone-600 hover:bg-stone-200'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-stone-100 border-r border-stone-200 p-4 flex flex-col">
      <div className="flex items-center mb-8 px-2">
        <LogoIcon className="h-8 w-8 text-teal-600" />
        <span className="text-xl font-bold font-serif ml-2 text-stone-800">Focus Flow</span>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem
          icon={<DashboardIcon className="h-5 w-5" />}
          label="Dashboard"
          isActive={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          icon={<TasksIcon className="h-5 w-5" />}
          label="Tasks"
          isActive={activeView === 'tasks'}
          onClick={() => setActiveView('tasks')}
        />
        <NavItem
          icon={<ReportsIcon className="h-5 w-5" />}
          label="Reports"
          isActive={activeView === 'reports'}
          onClick={() => setActiveView('reports')}
        />
      </nav>
      <div className="mt-auto">
        <NavItem
            icon={<SettingsIcon className="h-5 w-5" />}
            label="Settings"
            isActive={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
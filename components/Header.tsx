import React, { useState } from 'react';
import { Task, User } from '../types';
import { formatTime, formatTimer } from '../utils/time';
import { PlayIcon, PauseIcon, StopIcon } from './icons/Icons';

interface HeaderProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  activeTask: Task | null;
  elapsedTime: number;
  onStopTimer: () => void;
  isTimerRunning: boolean;
  totalTimeLogged: number;
}

const ProfileEditor: React.FC<{
  user: User;
  onUpdate: (user: User) => void;
  onClose: () => void;
}> = ({ user, onUpdate, onClose }) => {
  const [name, setName] = useState(user.name);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const handleSave = () => {
    onUpdate({ ...user, name, jobTitle, avatarUrl });
    onClose();
  };

  return (
    <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-stone-200 p-4 w-72 z-10">
        <h3 className="font-semibold text-stone-700 mb-3">Edit Profile</h3>
        <div className="space-y-3">
            <div>
                <label className="text-xs font-medium text-stone-500">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md text-sm" />
            </div>
            <div>
                <label className="text-xs font-medium text-stone-500">Job Title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md text-sm" />
            </div>
            <div>
                <label className="text-xs font-medium text-stone-500">Avatar URL</label>
                <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full mt-1 p-2 border border-stone-300 rounded-md text-sm" />
            </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-stone-100">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700">Save</button>
        </div>
    </div>
  );
}


const Header: React.FC<HeaderProps> = ({ currentUser, onUpdateUser, activeTask, elapsedTime, onStopTimer, isTimerRunning, totalTimeLogged }) => {
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  
  const displayTime = formatTimer(totalTimeLogged + elapsedTime);

  return (
    <header className="flex-shrink-0 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200 p-4 flex items-center justify-between relative">
      <div>
        {isTimerRunning && activeTask ? (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 flex items-center p-2">
            <div className="bg-teal-500 rounded-full h-3 w-3 mr-3 animate-pulse"></div>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-stone-800 truncate max-w-xs">{activeTask.name}</p>
              <p className="text-xs text-stone-500">Total time: {formatTime(totalTimeLogged + elapsedTime)}</p>
            </div>
            <div className="font-mono text-lg font-semibold text-stone-800 mx-4 w-28 text-center">
              {formatTimer(elapsedTime)}
            </div>
            <button onClick={onStopTimer} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
              <StopIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
             <h1 className="text-lg font-semibold text-stone-600">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        )}
      </div>
      <div className="flex items-center">
        <button onClick={() => setIsProfileEditorOpen(prev => !prev)} className="flex items-center text-right cursor-pointer p-1 rounded-md hover:bg-stone-200 transition-colors">
          <div className="mr-3">
            <p className="font-semibold text-sm">{currentUser.name}</p>
            <p className="text-xs text-stone-500">{currentUser.jobTitle}</p>
          </div>
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full" />
        </button>
         {isProfileEditorOpen && (
          <ProfileEditor user={currentUser} onUpdate={onUpdateUser} onClose={() => setIsProfileEditorOpen(false)} />
        )}
      </div>
    </header>
  );
};

export default Header;
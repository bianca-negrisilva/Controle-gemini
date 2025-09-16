import React, { useState } from 'react';
import { User, Tag } from '../types';
import { TrashIcon, PlusIcon } from './icons/Icons';
import Pill from './ui/Pill';
import { TAG_COLORS } from '../constants';

interface SettingsProps {
    users: User[];
    onAddUser: (user: Omit<User, 'id'>) => User;
    onDeleteUser: (userId: string) => void;
    tags: Tag[];
    onAddTag: (tag: Omit<Tag, 'id'>) => Tag;
    onDeleteTag: (tagId: string) => void;
}

const SettingsCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg border border-stone-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-bold font-serif text-stone-800 mb-4">{title}</h3>
        {children}
    </div>
);

const Settings: React.FC<SettingsProps> = (props) => {
    const { 
        users, onAddUser, onDeleteUser, 
        tags, onAddTag, onDeleteTag,
    } = props;
    
    const [newUserName, setNewUserName] = useState('');
    const [newUserJob, setNewUserJob] = useState('');
    const [newUserAvatar, setNewUserAvatar] = useState('');

    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim() || !newUserJob.trim()) {
            alert('Please provide a name and job title.');
            return;
        }
        onAddUser({ name: newUserName, jobTitle: newUserJob, avatarUrl: newUserAvatar || `https://i.pravatar.cc/150?u=${Date.now()}` });
        setNewUserName('');
        setNewUserJob('');
        setNewUserAvatar('');
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) {
            alert('Please provide a tag name.');
            return;
        }
        onAddTag({ name: newTagName.toLowerCase(), color: newTagColor });
        setNewTagName('');
    };
    

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-stone-800">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <SettingsCard title="Manage Users" className="lg:col-span-1">
                    <ul className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                        {users.map(user => (
                            <li key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-stone-50">
                                <div className="flex items-center">
                                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <p className="font-semibold text-sm text-stone-800">{user.name}</p>
                                        <p className="text-xs text-stone-500">{user.jobTitle}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteUser(user.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleAddUser} className="space-y-3 pt-4 border-t border-stone-200">
                        <input type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm" required />
                        <input type="text" placeholder="Job Title" value={newUserJob} onChange={e => setNewUserJob(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm" required />
                        <input type="text" placeholder="Avatar URL (optional)" value={newUserAvatar} onChange={e => setNewUserAvatar(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm" />
                        <button type="submit" className="w-full flex items-center justify-center bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                            <PlusIcon className="h-5 w-5 mr-1" /> Add User
                        </button>
                    </form>
                </SettingsCard>

                <SettingsCard title="Manage Tags" className="lg:col-span-1">
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[4rem]">
                        {tags.map(tag => (
                            <div key={tag.id} className="flex items-center bg-stone-100 rounded-full">
                                <Pill colorClass={tag.color}>#{tag.name}</Pill>
                                <button onClick={() => onDeleteTag(tag.id)} className="mr-1 p-0.5 text-stone-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                     <form onSubmit={handleAddTag} className="space-y-3 pt-4 border-t border-stone-200">
                         <div className="flex gap-3">
                            <input type="text" placeholder="New tag name" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm" required />
                            <select value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md text-sm bg-white">
                                {TAG_COLORS.map(color => (
                                    <option key={color.value} value={color.value}>{color.name}</option>
                                ))}
                            </select>
                        </div>
                         <button type="submit" className="w-full flex items-center justify-center bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                            <PlusIcon className="h-5 w-5 mr-1" /> Add Tag
                        </button>
                    </form>
                </SettingsCard>
            </div>
        </div>
    );
};

export default Settings;
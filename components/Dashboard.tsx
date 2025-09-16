import React from 'react';
import { Task, User, Status } from '../types';
import { CheckCircleIcon, ClockIcon, ListIcon, FireIcon } from './icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    tasks: Task[];
    users: User[];
}

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm flex items-center">
        <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-stone-500">{title}</p>
            <p className="text-2xl font-bold text-stone-800">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ tasks, users }) => {
    const today = new Date().toISOString().split('T')[0];
    const tasksDueToday = tasks.filter(t => t.dueDate && t.dueDate.startsWith(today)).length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== Status.Done).length;
    const completedTasks = tasks.filter(t => t.status === Status.Done).length;
    const inProgressTasks = tasks.filter(t => t.status === Status.InProgress).length;

    const data = users.map(user => ({
        name: user.name.split(' ')[0],
        'To Do': tasks.filter(t => t.assignee?.id === user.id && t.status === Status.ToDo).length,
        'In Progress': tasks.filter(t => t.assignee?.id === user.id && t.status === Status.InProgress).length,
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-stone-800">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="In Progress" value={inProgressTasks} icon={<ClockIcon className="h-6 w-6"/>} />
                <StatCard title="Due Today" value={tasksDueToday} icon={<ListIcon className="h-6 w-6"/>} />
                <StatCard title="Overdue" value={overdueTasks} icon={<FireIcon className="h-6 w-6"/>} />
                <StatCard title="Completed" value={completedTasks} icon={<CheckCircleIcon className="h-6 w-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                    <h3 className="font-semibold text-stone-800 mb-4">Team Workload</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}}/>
                            <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                            <Tooltip />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="To Do" stackId="a" fill="#e7e5e4" />
                            <Bar dataKey="In Progress" stackId="a" fill="#bae6fd" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                     <h3 className="font-semibold text-stone-800 mb-4">Recent Activity</h3>
                     <ul className="space-y-4">
                        {tasks.slice(0, 5).map(task => (
                             <li key={task.id} className="text-sm flex items-start">
                                <img src={task.addedBy.avatarUrl} alt={task.addedBy.name} className="h-8 w-8 rounded-full mr-3 mt-1"/>
                                <div>
                                    <p><span className="font-semibold">{task.addedBy.name}</span> added a new task</p>
                                    <p className="text-stone-600 font-medium">"{task.name}"</p>
                                </div>
                             </li>
                        ))}
                     </ul>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
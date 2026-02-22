import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, CheckCircle, Clock, Calendar, Type, Users, Trash2 } from 'lucide-react';

export default function TaskManagement() {
    const { tasks, addTask, updateTask, deleteTask, accounts, user } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: new Date().toISOString().split('T')[0],
        expected_tat: ''
    });

    const [filterStatus, setFilterStatus] = useState('All');

    const filteredTasks = tasks.filter(task => {
        if (filterStatus !== 'All' && task.status !== filterStatus) return false;
        // Admins see all tasks, users see tasks created by them or assigned to them
        if (user?.role === 'admin' || user?.role === 'super_admin') return true;
        return task.assigned_to === user?.email || task.created_by === user?.name;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const success = await addTask({
                ...formData,
                created_by: user?.name || user?.email || 'Unknown'
            });
            if (success) {
                setShowForm(false);
                setFormData({
                    title: '',
                    description: '',
                    assigned_to: '',
                    due_date: new Date().toISOString().split('T')[0],
                    expected_tat: ''
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (taskId, currentStatus) => {
        const statuses = ['Todo', 'In Progress', 'Done'];
        const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const nextStatus = statuses[nextIdx];

        const task = tasks.find(t => t.id === taskId);
        if (task) {
            await updateTask(taskId, { ...task, status: nextStatus });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                    <p className="text-gray-600">Track and assign daily operational tasks</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-4 py-2"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center gap-2 px-4 py-2"
                    >
                        <Plus size={18} /> Add Task
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4">Assign New Task</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Task Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Description</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Assign To</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold"
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                required
                            >
                                <option value="">Select Employee</option>
                                {accounts.map(acc => (
                                    <option key={acc.email} value={acc.email}>{acc.name} ({acc.role})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Due Date</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Expected TAT</label>
                            <input
                                type="text"
                                placeholder="e.g. 48 Hours, 2 Days"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold"
                                value={formData.expected_tat}
                                onChange={(e) => setFormData({ ...formData, expected_tat: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2 pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-black text-white hover:bg-gray-800 transition-colors py-3 rounded-xl font-bold flex items-center justify-center"
                            >
                                {isSubmitting ? 'Saving...' : 'Create Task'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors py-3 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                        <button
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete this task?")) {
                                    await deleteTask(task.id);
                                }
                            }}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-3 pr-6">
                            <button
                                onClick={() => handleStatusChange(task.id, task.status)}
                                className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-100 text-green-600' :
                                    task.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                                        'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                title="Click to toggle status"
                            >
                                {task.status === 'Done' ? <CheckCircle size={14} /> :
                                    task.status === 'In Progress' ? <Clock size={14} /> :
                                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-300"></div>}
                            </button>
                            <h4 className={`font-bold ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.title}
                            </h4>
                        </div>

                        {task.description && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="mb-4">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Feedback & Notes</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2 text-xs resize-none"
                                rows="2"
                                placeholder="Add feedback..."
                                defaultValue={task.feedback || ''}
                                onBlur={async (e) => {
                                    if (e.target.value !== task.feedback) {
                                        await updateTask(task.id, { ...task, feedback: e.target.value });
                                    }
                                }}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <Users size={14} />
                                Assigned to: <span className="text-black">{task.assigned_to}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <Calendar size={14} />
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                    {task.expected_tat && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-vayu-green">
                                            <Clock size={12} />
                                            TAT: {task.expected_tat}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${task.status === 'Done' ? 'bg-green-50 text-green-700' :
                                    task.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <CheckCircle size={48} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No tasks found</h3>
                    <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                </div>
            )}
        </div>
    );
}

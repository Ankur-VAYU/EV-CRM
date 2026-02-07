import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Clock, Calendar, Search, Filter, MapPin, Camera, X, ExternalLink } from 'lucide-react'

function AttendanceManagement() {
    const { attendance, fetchAttendance } = useStore()
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [viewRecord, setViewRecord] = useState(null)

    useEffect(() => {
        fetchAttendance(selectedDate)
    }, [selectedDate, fetchAttendance])

    const filteredAttendance = attendance.filter(record =>
        record.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Calculate stats
    const presentCount = attendance.filter(r => r.status === 'Present').length
    const totalHours = attendance.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Attendance Monitor</h2>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-vayu-green" /> Staff Time & Presence Tracking
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-xs font-bold text-gray-900 outline-none uppercase bg-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-8 -mt-8 rounded-full blur-3xl opacity-50"></div>
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-2">Staff Present Today</p>
                    <h3 className="text-3xl font-black text-blue-600">{presentCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 -mr-8 -mt-8 rounded-full blur-3xl opacity-50"></div>
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-2">Total Hours Logged</p>
                    <h3 className="text-3xl font-black text-green-600">{totalHours.toFixed(1)} <span className="text-sm text-gray-400 font-bold">hrs</span></h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 -mr-8 -mt-8 rounded-full blur-3xl opacity-50"></div>
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-2">Average Shift</p>
                    <h3 className="text-3xl font-black text-purple-600">{presentCount > 0 ? (totalHours / presentCount).toFixed(1) : 0} <span className="text-sm text-gray-400 font-bold">hrs</span></h3>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900">Daily Logs</h3>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64">
                        <Search size={14} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="bg-transparent text-xs font-bold outline-none w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Employee</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Designation</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Clock In</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Clock Out</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Hours</th>
                                <th className="text-center py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Verification</th>
                                <th className="text-right py-4 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttendance.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <p className="font-bold text-sm text-gray-900">{record.employee_name || `Unknown (ID: ${record.employee_id})`}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{record.designation}</span>
                                    </td>
                                    <td className="py-4 px-4 text-sm font-bold text-gray-700">
                                        {new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4 px-4 text-sm font-bold text-gray-700">
                                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="py-4 px-4 text-sm font-bold text-gray-900">
                                        {record.total_hours || '-'}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {(record.clock_in_photo || record.clock_in_location) && (
                                            <button
                                                onClick={() => setViewRecord(record)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600"
                                            >
                                                <MapPin size={16} />
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${record.clock_out ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                            {record.clock_out ? 'Completed' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredAttendance.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        No attendance records found for this date
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {
                viewRecord && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setViewRecord(null)}
                                className="absolute top-4 right-4 z-10 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                            >
                                <X size={20} className="text-black" />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-gray-900">{viewRecord.employee_name}</h3>
                                <p className="text-gray-500 font-medium">Attendance Verification • {new Date(viewRecord.date).toLocaleDateString()}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Clock In Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <h4 className="font-black uppercase tracking-widest text-xs">Clock In</h4>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-600">
                                            {new Date(viewRecord.clock_in).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group">
                                        {viewRecord.clock_in_photo ? (
                                            <img src={viewRecord.clock_in_photo} alt="Clock In" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase">No Photo</div>
                                        )}
                                    </div>
                                    {viewRecord.clock_in_location && (
                                        <a
                                            href={`https://www.google.com/maps?q=${viewRecord.clock_in_location}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                                        >
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold truncate">{viewRecord.clock_in_location}</span>
                                            <ExternalLink size={12} className="ml-auto" />
                                        </a>
                                    )}
                                </div>

                                {/* Clock Out Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <h4 className="font-black uppercase tracking-widest text-xs">Clock Out</h4>
                                        {viewRecord.clock_out ? (
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-600">
                                                {new Date(viewRecord.clock_out).toLocaleTimeString()}
                                            </span>
                                        ) : <span className="text-[10px] text-gray-400 italic">Not yet</span>}
                                    </div>
                                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                        {viewRecord.clock_out_photo ? (
                                            <img src={viewRecord.clock_out_photo} alt="Clock Out" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase">No Photo</div>
                                        )}
                                    </div>
                                    {viewRecord.clock_out_location && (
                                        <a
                                            href={`https://www.google.com/maps?q=${viewRecord.clock_out_location}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                                        >
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold truncate">{viewRecord.clock_out_location}</span>
                                            <ExternalLink size={12} className="ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default AttendanceManagement

import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Clock, Download, Filter } from 'lucide-react'

function RawLeads() {
    const { user, rawLeads, fetchRawLeads } = useStore()
    const [filterDate, setFilterDate] = useState('')

    const isAdmin = ['admin', 'super_admin'].includes(user?.role)

    useEffect(() => {
        fetchRawLeads()
    }, [])

    // Filter by single date just for quick lookup
    const filtered = filterDate
        ? rawLeads.filter(l => l.timestamp.startsWith(filterDate))
        : rawLeads

    const downloadCSV = () => {
        const headers = ['Timestamp', 'Name', 'Phone', 'Source', 'Showroom', 'Filled By', 'Assigned To', 'Referral Code']
        const rows = filtered.map(l => [
            new Date(l.timestamp).toLocaleString(),
            l.name,
            l.phone,
            l.source,
            l.showroom,
            l.lead_filled_by || '-',
            l.assigned_to || '-',
            l.referral_code || '-'
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `raw_leads_dump_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="text-gray-400" /> Raw Lead Timeline
                    </h2>
                    <p className="text-gray-600">Complete historical log of every lead inquiry (including duplicates)</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Simple Filter Bar */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                        <Filter size={14} /> Filter Date:
                    </div>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-black"
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="text-xs text-red-500 font-bold hover:underline"
                        >
                            Clear
                        </button>
                    )}
                    <div className="ml-auto text-xs font-bold text-gray-400">
                        Total Records: {filtered.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showroom</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filled By</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referral</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(lead => (
                                <tr key={lead.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 text-xs font-mono text-gray-500">
                                        {new Date(lead.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-bold text-gray-900">
                                        {lead.name}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-600 font-mono">
                                        {lead.phone}
                                    </td>
                                    <td className="px-6 py-3 text-xs font-bold">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md capitalize border border-blue-100">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-500 font-medium">
                                        {lead.showroom || '-'}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-500 font-medium font-bold">
                                        {lead.lead_filled_by || '-'}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-400 font-medium italic">
                                        {lead.assigned_to || '-'}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-500 font-mono font-bold tracking-tight">
                                        {lead.referral_code || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                        No raw records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RawLeads

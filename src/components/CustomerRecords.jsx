import React from 'react'
import { useStore } from '../store'
import { User, Zap } from 'lucide-react'

function CustomerRecords() {
    const { customers, serviceRecords } = useStore()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Customer Records</h2>
                <p className="text-gray-600">{customers.length} total customers</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Purchase Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Uptime Pass</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Services</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => {
                            const customerServices = serviceRecords.filter(s => s.customer_id === customer.id)
                            return (
                                <tr key={customer.id} className="table-row">
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{customer.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{customer.vehicle_registration}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{customer.purchase_date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`badge badge-${customer.uptime_pass_status}`}>
                                            {customer.uptime_pass_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{customerServices.length}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerRecords

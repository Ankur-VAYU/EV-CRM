import React, { useEffect } from 'react'
import { useStore } from '../store'
import AdminDashboard from './dashboards/AdminDashboard'
import EmployeeDashboard from './dashboards/EmployeeDashboard'
import CustomerDashboard from './dashboards/CustomerDashboard'

function Dashboard() {
    const { user } = useStore()

    if (user?.role === 'admin' || user?.role === 'super_admin') {
        return <AdminDashboard />
    }

    if (user?.role === 'employee') {
        return <EmployeeDashboard />
    }

    if (user?.role === 'customer') {
        return <CustomerDashboard />
    }

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No dashboard available for your role.</p>
        </div>
    )
}

export default Dashboard

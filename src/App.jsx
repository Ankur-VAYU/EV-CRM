import React, { useState } from 'react'
import { useStore } from './store'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  UserCircle,
  Wrench,
  MapPin,
  FileText,
  Zap,
  LogOut,
  ShieldAlert,
  Inbox,
  UserPlus,
  Wallet,
  Receipt,
  Clock,
  Menu,
  CheckSquare,
  Bell
} from 'lucide-react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import LeadManagement from './components/LeadManagement'
import SalesManagement from './components/SalesManagement'
import InventoryManagement from './components/InventoryManagement'
import CustomerRecords from './components/CustomerRecords'
import ServiceRecords from './components/ServiceRecords'
import RSATracking from './components/RSATracking'
import Reports from './components/Reports'
import AccessControl from './components/AccessControl'
import ReferralManagement from './components/ReferralManagement'
import EmployeeManagement from './components/EmployeeManagement'

import UnifiedCustomerProfile from './components/UnifiedCustomerProfile'
import RawLeads from './components/RawLeads'
import PublicLeadForm from './components/PublicLeadForm'
import PaymentManagement from './components/PaymentManagement'
import ExpenseManagement from './components/ExpenseManagement'
import AttendanceManagement from './components/AttendanceManagement'
import TaskManagement from './components/TaskManagement'

function App() {
  const { user, logout, init, permissions, notifications, markNotificationRead } = useStore()
  const [activeTab, setActiveTab] = useState(user?.role === 'customer' ? 'customers' : 'dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const initialized = React.useRef(false)

  React.useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true
      init()
    } else if (!user) {
      initialized.current = false
    }
  }, [user, init])

  if (window.location.pathname === '/fill-lead') {
    return <PublicLeadForm />
  }

  if (!user) {
    return <Auth />
  }

  const allTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'raw_leads', name: 'Raw Leads', icon: Inbox },
    { id: 'sales', name: 'Sales', icon: ShoppingCart },
    { id: 'payments', name: 'Payments', icon: Wallet },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'customers', name: 'Rider Profiles', icon: UserCircle },
    { id: 'service', name: 'Service', icon: Wrench },
    { id: 'rsa', name: 'RSA Track', icon: MapPin },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'referrals', name: 'Referral Network', icon: UserPlus },
    { id: 'employees', name: 'Team Directory', icon: UserCircle },
    { id: 'attendance', name: 'Attendance', icon: Clock },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'access', name: 'Team Access', icon: ShieldAlert },
  ]

  const safePermissions = permissions || {}
  const tabs = (user.role === 'super_admin' || user.role === 'admin')
    ? allTabs
    : user.role === 'customer'
      ? allTabs.filter(tab => ['customers', 'service'].includes(tab.id))
      : allTabs.filter(tab => safePermissions[tab.id]?.view === true)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'leads': return <LeadManagement />
      case 'raw_leads': return <RawLeads />
      case 'sales': return <SalesManagement />
      case 'payments': return <PaymentManagement />
      case 'expenses': return <ExpenseManagement />
      case 'inventory': return <InventoryManagement />
      case 'customers': return <UnifiedCustomerProfile />
      case 'service': return <ServiceRecords />
      case 'rsa': return <RSATracking />
      case 'reports': return <Reports />
      case 'referrals': return <ReferralManagement />
      case 'employees': return <EmployeeManagement />
      case 'attendance': return <AttendanceManagement />
      case 'tasks': return <TaskManagement />
      case 'access': return <AccessControl />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-700">
              <Menu size={24} />
            </button>
            <div className="w-12 h-12">
              <img src="/vayu_logo.svg" alt="VAYU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black text-vayu-green leading-tight italic">VAYU EV</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{(user.role || 'Guest')} Control Panel | A.S. Enterprises</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-r pr-4 border-gray-100">
              <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
              <button
                onClick={logout}
                className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1 hover:text-red-700"
              >
                <LogOut size={10} /> Logout
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-vayu-green transition-colors"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-black text-sm uppercase tracking-wider">Notifications</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-xs italic text-center py-4">You have no new notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${n.is_read ? 'bg-gray-50 border-transparent opacity-60' : 'bg-vayu-yellow/10 border-vayu-yellow/30'}`}
                          onClick={() => {
                            if (!n.is_read) markNotificationRead(n.id);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-xs text-black">{n.title}</h4>
                            <span className="text-[8px] text-gray-400 font-bold">{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-600 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Icon */}
            <div className="w-10 h-10 bg-vayu-green rounded-xl flex items-center justify-center text-vayu-yellow font-bold text-lg shadow-inner">
              {(user.name ? user.name[0] : 'U')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:sticky top-[73px] z-40 w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)] overflow-y-auto pb-10`}>
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-black text-white shadow-xl translate-x-2'
                  : 'text-black/60 hover:text-black hover:bg-gray-100/50'
                  }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-vayu-yellow' : 'text-black/30'} />
                {tab.name}
              </button>
            ))}
            {tabs.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Access Assigned</p>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App

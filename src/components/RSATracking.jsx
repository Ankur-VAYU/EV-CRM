import React from 'react'
import { useStore } from '../store'
import { MapPin, Clock, CheckCircle } from 'lucide-react'

function RSATracking() {
    const { rsaTracking, serviceRecords } = useStore()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">RSA Tracking</h2>
                <p className="text-gray-600">Real-time roadside assistance monitoring</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rsaTracking.map(rsa => {
                    const service = serviceRecords.find(s => s.id === rsa.service_record_id)
                    const dispatchTime = new Date(rsa.dispatch_time)
                    const arrivalTime = rsa.arrival_time ? new Date(rsa.arrival_time) : null
                    const responseTime = arrivalTime ? Math.round((arrivalTime - dispatchTime) / 60000) : null

                    return (
                        <div key={rsa.id} className="bg-white rounded-xl border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{service?.customer_name || 'Customer'}</h3>
                                    <p className="text-sm text-gray-600">{service?.vehicle_registration}</p>
                                    <p className="text-[10px] font-black text-vayu-green uppercase tracking-widest mt-1">{rsa.showroom}</p>
                                </div>
                                <span className={`badge badge-${rsa.status}`}>{rsa.status}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="text-gray-700">{rsa.customer_location}</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-gray-700">
                                        Dispatched: {dispatchTime.toLocaleTimeString()}
                                    </span>
                                </div>

                                {responseTime && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <CheckCircle size={16} className={responseTime < 30 ? 'text-green-600' : 'text-orange-600'} />
                                        <span className={responseTime < 30 ? 'text-green-700 font-semibold' : 'text-orange-700 font-semibold'}>
                                            Response Time: {responseTime} minutes
                                        </span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Serviceman: <span className="font-semibold text-gray-700">{rsa.serviceman_name}</span></p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default RSATracking

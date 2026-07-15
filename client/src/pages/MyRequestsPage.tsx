import React, { useState, useEffect } from 'react';
import { 
  Typography, Tabs, List, Empty, 
  Spin, Divider 
} from 'antd';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Truck, 
  FileText, 
  Download,
  Activity,
  ArrowRight
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const { Title, Text, Paragraph } = Typography;

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [vehicleAccepts, setVehicleAccepts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [fleetRequests, setFleetRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchMyData(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchMyData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [visitRes, docRes, fleetRes] = await Promise.all([
        api.get('/mobility/my-visits', { signal }),
        api.get('/upload/my-documents', { signal }),
        api.get('/mobility/my-fleet-requests', { signal })
      ]);
      setSiteVisits(visitRes.data);
      setDocuments(docRes.data);
      setFleetRequests(fleetRes.data);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) return;
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: any = {
    'PENDING': { color: 'text-orange-500', icon: <Clock size={14} /> },
    'APPROVED': { color: 'text-success-green', icon: <CheckCircle2 size={14} /> },
    'REJECTED': { color: 'text-red-500', icon: <XCircle size={14} /> },
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    try {
      const origin = new URL(baseURL).origin;
      return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
    } catch {
      return path;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary">
      <UnifiedHeader title="My Requests" />
      {/* Header */}
      <header className="p-8 lg:p-12 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-accent-primary mb-6">
             <Activity size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operation Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tighter uppercase">
            Sovereign <span className="text-accent-primary">Activity</span>
          </h1>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
            Orchestrating infrastructure engagements, managing digital assets, and monitoring logistics missions.
          </p>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <Activity size={400} className="text-accent-primary" />
        </div>
      </header>

      {/* Tabs / Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-5xl mx-auto">
          <Tabs 
            defaultActiveKey="1" 
            className="custom-tabs"
            items={[
              {
                key: '1',
                label: (
                  <span className="flex items-center gap-2 py-2">
                    <MapPin size={16} /> Site Visits
                  </span>
                ),
                children: (
                  <div className="py-6">
                    {loading ? (
                      <div className="flex justify-center py-12"><Spin /></div>
                    ) : (
                      <List
                        dataSource={siteVisits}
                        locale={{ emptyText: <Empty description={<span className="text-text-tertiary">No site visit requests found</span>} /> }}
                        renderItem={visit => (
                          <div key={visit.id} className="feed-card mb-6 group hover:border-accent-primary/20 transition-all p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{visit.project.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                   <Clock size={12} className="text-text-tertiary" />
                                   <span className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
                                     Initialized: {new Date(visit.createdAt).toLocaleDateString()}
                                   </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md bg-bg-primary border border-border-subtle text-[10px] font-black uppercase tracking-[0.15em] ${statusMap[visit.status]?.color}`}>
                                {statusMap[visit.status]?.icon}
                                {visit.status}
                              </div>
                            </div>
                            <Divider className="border-border-subtle my-6 opacity-30" />
                            <div className="flex items-center justify-between">
                               <p className="text-xs text-text-secondary">
                                 <span className="text-accent-primary font-black uppercase tracking-widest text-[9px] mr-3">Assigned Architect:</span> 
                                 <span className="font-bold text-text-primary uppercase">{visit.project.engineerProfile?.user?.name || 'In Evaluation'}</span>
                               </p>
                               <button className="text-accent-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                  Full Schematics <ArrowRight size={14} />
                                </button>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  </div>
                )
              },
              {
                key: '2',
                label: (
                  <span className="flex items-center gap-2 py-2">
                    <Truck size={16} /> Logistics
                  </span>
                ),
                children: (
                  <div className="py-6">
                    <List
                      dataSource={vehicleAccepts}
                      locale={{ emptyText: <Empty description={<span className="text-text-tertiary">No logistics activity found</span>} /> }}
                      renderItem={item => (
                        <div className="feed-card mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{item.location}</h3>
                            <p className="text-[10px] text-accent-primary font-bold uppercase tracking-widest">{item.duration} Mission</p>
                          </div>
                          <div className="text-2xl font-black text-white">
                             <span className="text-accent-primary text-sm font-normal mr-1">$</span>{item.price}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )
              },
              {
                key: '3',
                label: (
                  <span className="flex items-center gap-2 py-2">
                    <FileText size={16} /> Digital Vault
                  </span>
                ),
                children: (
                  <div className="py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                       <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Secured Documents</h4>
                       <button className="qsi-button primary py-2 px-6 text-xs">Upload Document</button>
                    </div>
                    <List
                      dataSource={documents}
                      locale={{ emptyText: <Empty description={<span className="text-text-tertiary">Your digital vault is empty</span>} /> }}
                      renderItem={doc => (
                         <div className="sidebar-item p-6 flex items-center justify-between mb-4 group">
                            <div className="flex items-center gap-5">
                               <div className="w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center text-accent-primary border border-accent-primary/10 shadow-inner group-hover:bg-accent-primary group-hover:text-black transition-all">
                                  <FileText size={24} />
                               </div>
                               <div>
                                  <h5 className="font-bold text-white text-base tracking-tight mb-1">{doc.originalName}</h5>
                                  <p className="text-[10px] text-text-tertiary font-black uppercase tracking-[0.15em]">Vault Sync: {new Date(doc.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                           <a 
                             href={getServerUrl(doc.filePath.startsWith('/uploads') ? doc.filePath : (doc.fileName ? `/uploads/${doc.fileName}` : doc.filePath))} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-3 rounded-xl bg-bg-primary text-text-secondary hover:text-accent-primary border border-border-subtle transition-all"
                           >
                              <Download size={18} />
                           </a>
                        </div>
                      )}
                    />
                  </div>
                )
              },
              {
                key: '4',
                label: (
                  <span className="flex items-center gap-2 py-2">
                    <Truck size={16} /> Fleet Rides
                  </span>
                ),
                children: (
                  <div className="py-6">
                    {loading ? (
                      <div className="flex justify-center py-12"><Spin /></div>
                    ) : (
                      <List
                        dataSource={fleetRequests}
                        locale={{ emptyText: <Empty description={<span className="text-text-tertiary">No fleet requests found</span>} /> }}
                        renderItem={req => (
                          <div key={req.id} className="feed-card mb-6 group hover:border-accent-primary/20 transition-all p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{req.pickupLocation} ➔ {req.dropoffLocation}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                   <Clock size={12} className="text-text-tertiary" />
                                   <span className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
                                     {new Date(req.rideDate).toLocaleDateString()} at {req.rideTime}
                                   </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md bg-bg-primary border border-border-subtle text-[10px] font-black uppercase tracking-[0.15em] ${statusMap[req.status]?.color || 'text-orange-500'}`}>
                                {req.status}
                              </div>
                            </div>
                            <Divider className="border-border-subtle my-6 opacity-30" />
                            <div className="flex items-center justify-between">
                               <p className="text-xs text-text-secondary">
                                 <span className="text-accent-primary font-black uppercase tracking-widest text-[9px] mr-3">Assigned Driver:</span> 
                                 <span className="font-bold text-text-primary uppercase">{req.assignedDriver?.name || 'Pending Assignment'}</span>
                               </p>
                               <span className="text-xl font-black text-white">
                                  <span className="text-accent-primary text-sm font-normal mr-1">$</span>{req.finalPrice || req.offerPrice}
                               </span>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MyRequestsPage;

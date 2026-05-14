import React, { useState, useEffect } from 'react';
import {
  Typography,
  Tag,
  Spin,
  Empty,
  App as AntApp,
  theme,
  Grid
} from "antd";
import {
  Download,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  FileDigit,
  Receipt,
  ArrowRight,
  ExternalLink,
  CreditCard
} from "lucide-react";
import api from "../api";

const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const GREEN = '#10B981';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { message } = AntApp.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoicing/my-invoices");
        setInvoices(response.data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        message.error("Failed to load your invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [message]);

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoicing/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);
      message.error("Could not download PDF.");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PAID":
        return { 
          color: GREEN, 
          label: 'Paid', 
          icon: <CheckCircle2 size={12} />,
          bg: 'rgba(16,185,129,0.1)'
        };
      case "PENDING":
      case "QUOTATION":
        return { 
          color: '#F59E0B', 
          label: 'Pending', 
          icon: <Clock size={12} />,
          bg: 'rgba(245,158,11,0.1)'
        };
      case "CANCELLED":
        return { 
          color: 'rgba(255,255,255,0.4)', 
          label: 'Cancelled', 
          icon: <AlertCircle size={12} />,
          bg: 'rgba(255,255,255,0.05)'
        };
      default:
        return { 
          color: 'rgba(255,255,255,0.4)', 
          label: status, 
          icon: <FileDigit size={12} />,
          bg: 'rgba(255,255,255,0.05)'
        };
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            <Receipt size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              FINANCE
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Quoted & Invoiced
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Statistics or Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Invoices', value: invoices.length, icon: <FileText size={18} /> },
            { label: 'Pending Payment', value: invoices.filter(i => i.status === 'PENDING' || i.status === 'QUOTATION').length, icon: <Clock size={18} />, color: '#F59E0B' },
            { label: 'Completed', value: invoices.filter(i => i.status === 'PAID').length, icon: <CheckCircle2 size={18} />, color: GREEN },
          ].map((stat, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', 
              borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px'
            }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color || 'rgba(255,255,255,0.5)' 
              }}>
                {stat.icon}
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{stat.label}</span>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice List */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Documents</h3>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Displaying {invoices.length} entries</span>
          </div>

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}><Spin /></div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
               <Empty description={<span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>No documents found</span>} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '20px 32px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Reference</th>
                    {!isMobile && <th style={{ padding: '20px 32px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Issue Date</th>}
                    <th style={{ padding: '20px 32px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '20px 32px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '20px 32px', textAlign: 'right', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const status = getStatusDisplay(inv.status);
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '24px 32px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                              <FileText size={14} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{inv.invoiceNumber}</span>
                          </div>
                        </td>
                        {!isMobile && (
                          <td style={{ padding: '24px 32px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>{new Date(inv.issueDate).toLocaleDateString()}</span>
                          </td>
                        )}
                        <td style={{ padding: '24px 32px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 900, color: 'white' }}>${inv.totalAmount.toFixed(2)}</span>
                        </td>
                        <td style={{ padding: '24px 32px' }}>
                          <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                            padding: '4px 10px', borderRadius: '8px', background: status.bg, 
                            color: status.color, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' 
                          }}>
                            {status.icon} {status.label}
                          </div>
                        </td>
                        <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                              style={{ 
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: '8px', padding: '8px 14px', color: 'white', 
                                cursor: 'pointer', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px'
                              }}
                            >
                              <Download size={13} /> PDF
                            </button>
                            {(inv.status === 'PENDING' || inv.status === 'QUOTATION') && (
                              <button 
                                onClick={() => message.info("Online payment integration coming soon. Please pay via bank transfer.")}
                                style={{ 
                                  background: GREEN, border: 'none', 
                                  borderRadius: '8px', padding: '8px 14px', color: 'white', 
                                  cursor: 'pointer', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                              >
                                <CreditCard size={13} /> Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bank Details Hint */}
        <div style={{ 
          marginTop: '32px', padding: '24px', borderRadius: '20px', 
          background: 'rgba(16,185,129,0.05)', border: `1px solid ${GREEN}20`,
          display: 'flex', alignItems: 'start', gap: '20px'
        }}>
          <div style={{ color: GREEN, marginTop: '2px' }}><DollarSign size={20} /></div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '4px', textTransform: 'uppercase' }}>Financial Synchronization</h4>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
              All invoices contain specific bank transfer details for operational settlement. Please ensure reference numbers are included in all transactions for automated coherence verification.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        tbody tr:hover { background: rgba(255,255,255,0.015); }
      `}</style>
    </div>
  );
};

export default InvoicesPage;
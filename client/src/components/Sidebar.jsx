import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  PlayCircle, 
  Database, 
  AlertTriangle, 
  FileCheck, 
  Code2, 
  Server, 
  ShieldCheck, 
  User,
  ExternalLink,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  badgeCounts, 
  telemetry,
  theme,
  onToggleTheme,
  onGenerate10k,
  isProcessing
}) {
  const lastRC = telemetry?.metrics?.lastReturnCode || 'RC = 0000';
  const jobClass = telemetry?.jobClass || 'CLASS A';

  const menuItems = [
    { 
      id: 'banking', 
      label: 'Banking Dashboard', 
      sub: 'Overview & Liquidity',
      icon: LayoutDashboard 
    },
    { 
      id: 'accounts', 
      label: 'Customer Accounts', 
      sub: 'VSAM KSDS Ledgers',
      icon: CreditCard, 
      count: badgeCounts?.accounts 
    },
    { 
      id: 'spool', 
      label: 'Batch Operations', 
      sub: 'JES2 Spool & Execution',
      icon: PlayCircle, 
      pulse: badgeCounts?.isProcessing 
    },
    { 
      id: 'database', 
      label: 'Dataset Explorer', 
      sub: 'VSAM & QSAM Catalog',
      icon: Database 
    },
    { 
      id: 'exceptions', 
      label: 'Suspense Queue', 
      sub: 'Rejected Overdrafts',
      icon: AlertTriangle, 
      count: badgeCounts?.exceptions, 
      isDanger: badgeCounts?.exceptions > 0 
    },
    { 
      id: 'reconciliation', 
      label: 'Reconciliation', 
      sub: 'Audit Proof & Reports',
      icon: FileCheck 
    },
    { 
      id: 'code', 
      label: 'Mainframe Studio', 
      sub: 'COBOL & JCL Editor',
      icon: Code2 
    }
  ];

  return (
    <aside style={{
      width: '268px',
      minWidth: '268px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px 18px 20px',
        borderBottom: '1px solid var(--border-hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(30, 64, 175, 0.28)',
          flexShrink: 0
        }}>
          <Server size={20} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '15px', 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>IBM z/FinCore</span>
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-muted)', 
            fontWeight: 600,
            letterSpacing: '0.02em'
          }}>
            Institutional Net Banking
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          padding: '4px 10px 8px 10px' 
        }}>
          Navigation
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                background: isActive ? 'var(--brand-navy-pale)' : 'transparent',
                border: isActive ? '1px solid var(--brand-navy-border)' : '1px solid transparent',
                color: isActive ? 'var(--brand-navy-mid)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                position: 'relative',
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.08)' : 'none'
              }}
              className="sidebar-nav-btn"
            >
              {/* Left active accent bar */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '18%',
                  bottom: '18%',
                  width: '3.5px',
                  borderRadius: '0 4px 4px 0',
                  background: 'var(--brand-navy-light)'
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon 
                  size={18} 
                  color={isActive ? 'var(--brand-navy-light)' : 'var(--text-muted)'} 
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
                <div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: isActive ? 700 : 500, 
                    lineHeight: 1.25,
                    fontFamily: 'var(--font-ui)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-muted)', 
                    fontWeight: 500 
                  }}>
                    {item.sub}
                  </div>
                </div>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  background: item.isDanger ? 'var(--crimson-bg)' : 'var(--emerald-bg)',
                  color: item.isDanger ? 'var(--crimson-danger)' : 'var(--emerald-success)',
                  border: item.isDanger ? '1px solid var(--crimson-border)' : '1px solid var(--emerald-border)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {item.count}
                </span>
              )}

              {item.pulse && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--brand-navy-light)',
                  boxShadow: '0 0 8px var(--brand-navy-light)',
                  animation: 'pulseGlow 1s infinite'
                }} />
              )}
            </button>
          );
        })}

        {/* 10K Dataset Generator Widget inside Sidebar */}
        <div style={{
          marginTop: '16px',
          padding: '12px 14px',
          background: 'var(--brand-gold-bg)',
          border: '1px solid var(--brand-gold-border)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(217, 119, 6, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-gold)', fontWeight: 700, fontSize: '11px' }}>
            <Sparkles size={13} />
            <span>ENTERPRISE BATCH BENCHMARK</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            Stress test with 10,000 transactions across 500 accounts.
          </div>
          <button
            onClick={onGenerate10k}
            disabled={isProcessing}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isProcessing ? 'PROVISIONING...' : '⚡ GENERATE 10K ROWS'}
          </button>
        </div>
      </div>

      {/* Sidebar Footer: System Health & Operator */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-hairline)',
        background: 'var(--bg-tertiary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* System Health */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--emerald-success)',
              boxShadow: '0 0 6px var(--emerald-success)'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JES2 SPOOL ONLINE</span>
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '10px', 
            fontWeight: 700,
            color: 'var(--brand-navy-light)',
            background: 'var(--brand-navy-pale)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {lastRC}
          </span>
        </div>

        {/* Operator Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}>
              KG
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Kiran Ghotekar
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Financial & COBOL Lead
              </div>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Banking Theme' : 'Switch to Dark Mode'}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {theme === 'dark' ? <Sun size={14} color="#F59E0B" /> : <Moon size={14} color="#2563EB" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

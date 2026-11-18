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
      width: '260px',
      minWidth: '260px',
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
        padding: '20px 20px 16px 20px',
        borderBottom: '1px solid var(--border-hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-header)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(26, 43, 107, 0.25)',
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
            Core Banking & Batch Portal
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div style={{ flex: 1, padding: '14px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          padding: '4px 10px 8px 10px' 
        }}>
          Main Menu
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'accounts' && activeTab === 'accounts');

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--brand-navy-pale)' : 'transparent',
                border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                color: isActive ? 'var(--brand-navy-mid)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none'
              }}
              className="sidebar-nav-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon 
                  size={17} 
                  color={isActive ? 'var(--brand-navy-mid)' : 'var(--text-muted)'} 
                />
                <div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: isActive ? 700 : 500, 
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-ui)'
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
                  background: item.isDanger ? 'var(--crimson-bg)' : 'var(--bg-tertiary)',
                  color: item.isDanger ? 'var(--crimson-danger)' : 'var(--brand-navy-mid)',
                  border: item.isDanger ? '1px solid var(--crimson-border)' : '1px solid var(--border-hairline)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
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
          padding: '12px',
          background: 'var(--brand-gold-bg)',
          border: '1px solid rgba(201, 147, 58, 0.25)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-gold)', fontWeight: 700, fontSize: '11px' }}>
            <Sparkles size={13} />
            <span>ENTERPRISE SCALE</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            Stress test with 10,000 transactions across 500 accounts.
          </div>
          <button
            onClick={onGenerate10k}
            disabled={isProcessing}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'var(--brand-gold)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {isProcessing ? 'GENERATING...' : 'LOAD 10K ROWS'}
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
              background: 'var(--brand-teal)',
              boxShadow: '0 0 6px var(--brand-teal)'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JES2 ONLINE</span>
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '10px', 
            fontWeight: 700,
            color: 'var(--brand-navy-light)'
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
          borderTop: '1px solid var(--border-hairline)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--brand-navy-pale)',
              color: 'var(--brand-navy-mid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}>
              KG
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kiran Ghotekar
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Batch Ops & COBOL Lead
              </div>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            {theme === 'dark' ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} color="var(--brand-navy-mid)" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

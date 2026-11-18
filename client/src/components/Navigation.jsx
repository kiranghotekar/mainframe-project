import React from 'react';
import { CreditCard, Terminal, Database, AlertTriangle, FileCheck, Code2 } from 'lucide-react';

export default function Navigation({ activeTab, onTabChange, badgeCounts }) {
  const tabs = [
    { id: 'banking', label: '01. CORE BANKING & VSAM', icon: CreditCard, count: badgeCounts?.accounts },
    { id: 'spool', label: '02. JES2 SPOOL & RUNNER', icon: Terminal, pulse: badgeCounts?.isProcessing },
    { id: 'database', label: '03. DATASET INSPECTOR', icon: Database },
    { id: 'exceptions', label: '04. EXCEPTION SUSPENSE', icon: AlertTriangle, count: badgeCounts?.exceptions, isDanger: badgeCounts?.exceptions > 0 },
    { id: 'reconciliation', label: '05. RECONCILIATION', icon: FileCheck },
    { id: 'code', label: '06. COBOL & JCL STUDIO', icon: Code2 }
  ];

  return (
    <nav style={{
      margin: '0 24px 16px 24px',
      display: 'flex',
      gap: '8px',
      borderBottom: '1px solid var(--border-subtle)',
      paddingBottom: '10px',
      overflowX: 'auto'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--brand-navy-pale)' : 'transparent',
              border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
              color: isActive ? 'var(--brand-navy-mid)' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 600,
              fontSize: '12px',
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <Icon 
              size={15} 
              color={isActive ? 'var(--brand-navy-mid)' : 'var(--text-muted)'} 
            />
            <span>{tab.label}</span>

            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: tab.isDanger ? 'var(--crimson-bg)' : 'var(--bg-tertiary)',
                color: tab.isDanger ? 'var(--crimson-danger)' : 'var(--brand-navy-mid)',
                border: tab.isDanger ? '1px solid var(--crimson-border)' : '1px solid var(--border-hairline)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

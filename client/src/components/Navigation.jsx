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
      gap: '6px',
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
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'var(--matrix-green-bg)' : 'transparent',
              border: isActive ? '1px solid var(--matrix-green-border)' : '1px solid transparent',
              color: isActive ? 'var(--matrix-green)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em'
            }}
          >
            <Icon 
              size={14} 
              color={isActive ? 'var(--matrix-green)' : 'var(--text-muted)'} 
            />
            <span>{tab.label}</span>

            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: tab.isDanger ? 'var(--crimson-bg)' : 'rgba(45, 181, 138, 0.15)',
                color: tab.isDanger ? 'var(--crimson-danger)' : 'var(--matrix-green)',
                border: tab.isDanger ? '1px solid var(--crimson-border)' : '1px solid var(--matrix-green-border)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)'
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

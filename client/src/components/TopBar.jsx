import React from 'react';
import { 
  Play, 
  RotateCcw, 
  PlusCircle, 
  UserPlus, 
  Search, 
  Bell, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function TopBar({
  activeTab,
  onRunBatch,
  onReset,
  onOpenTxnModal,
  onOpenAccModal,
  isProcessing,
  pendingCount = 0
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'banking': return { title: 'Core Banking Dashboard', breadcrumb: 'Overview & Liquidity' };
      case 'accounts': return { title: 'Customer Accounts Master', breadcrumb: 'VSAM KSDS Accounts' };
      case 'spool': return { title: 'Batch Operations Console', breadcrumb: 'JES2 Spool & Execution' };
      case 'database': return { title: 'Mainframe Dataset Explorer', breadcrumb: 'Cataloged Datasets' };
      case 'exceptions': return { title: 'Exception Suspense Queue', breadcrumb: 'Rejected Transactions' };
      case 'reconciliation': return { title: 'Batch Audit & Reconciliation', breadcrumb: 'Financial Proof' };
      case 'code': return { title: 'COBOL & JCL Studio', breadcrumb: 'Mainframe Engine Source' };
      default: return { title: 'Core Banking Dashboard', breadcrumb: 'Overview' };
    }
  };

  const current = getTabTitle(activeTab);

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Title & Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>IBM z/OS Banking</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--brand-navy-light)', fontWeight: 600 }}>{current.breadcrumb}</span>
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '17px', 
          fontWeight: 800, 
          color: 'var(--text-primary)', 
          letterSpacing: '-0.02em',
          marginTop: '1px'
        }}>
          {current.title}
        </h1>
      </div>

      {/* Global Action CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          onClick={onOpenAccModal}
          style={{ fontSize: '12px', padding: '7px 12px' }}
          title="Onboard a new customer account"
        >
          <UserPlus size={14} />
          <span>New Account</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenTxnModal}
          style={{ fontSize: '12px', padding: '7px 12px' }}
          title="Stage a new transaction into transactions.dat"
        >
          <PlusCircle size={14} />
          <span>Stage Transfer</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          style={{ fontSize: '12px', padding: '7px 12px' }}
          title="Reset to 5 accounts / 12 transactions demo baseline"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Primary Batch Action CTA */}
        <button
          className="btn btn-mainframe"
          onClick={onRunBatch}
          disabled={isProcessing}
          style={{ 
            fontSize: '12px', 
            padding: '8px 18px',
            boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)'
          }}
          title="Submit batch transaction clearing to JES2 queue"
        >
          <Play size={13} fill="currentColor" />
          <span>{isProcessing ? 'Executing...' : 'Run Batch Clearing'}</span>
          {pendingCount > 0 && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10px',
              fontWeight: 800,
              marginLeft: '4px'
            }}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

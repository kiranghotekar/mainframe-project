import React from 'react';
import { 
  Play, 
  RotateCcw, 
  PlusCircle, 
  UserPlus, 
  ChevronRight,
  Sparkles
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
      height: '66px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
    }}>
      {/* Title & Contextual Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>IBM z/OS Net Banking</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--brand-navy-light)', fontWeight: 600 }}>{current.breadcrumb}</span>
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '18px', 
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
          style={{ fontSize: '12px', padding: '8px 14px' }}
          title="Onboard a new customer account"
        >
          <UserPlus size={14} color="var(--brand-navy-light)" />
          <span>New Account</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenTxnModal}
          style={{ fontSize: '12px', padding: '8px 14px' }}
          title="Stage a new transaction into transactions.dat"
        >
          <PlusCircle size={14} color="var(--emerald-success)" />
          <span>Stage Transfer</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          style={{ fontSize: '12px', padding: '8px 12px' }}
          title="Reset to 5 accounts / 12 transactions demo baseline"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Prominent Primary Batch Action CTA */}
        <button
          className="btn btn-mainframe"
          onClick={onRunBatch}
          disabled={isProcessing}
          style={{ 
            fontSize: '12px', 
            padding: '9px 18px',
            borderRadius: '10px'
          }}
          title="Submit batch transaction clearing to JES2 queue"
        >
          <Play size={13} fill="currentColor" />
          <span>{isProcessing ? 'Clearing Batch...' : 'Run Batch Clearing'}</span>
          {pendingCount > 0 && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10px',
              fontWeight: 800,
              marginLeft: '4px'
            }}>
              {pendingCount} Staged
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

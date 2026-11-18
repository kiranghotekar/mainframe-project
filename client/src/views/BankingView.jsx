import React, { useMemo } from 'react';
import { 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Play, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Layers,
  ChevronRight,
  Database,
  CheckCircle2
} from 'lucide-react';

export default function BankingView({
  accounts,
  transactions,
  processed,
  exceptions,
  onQuickTxn,
  onRunBatch,
  onOpenTxnModal,
  onNavigateTab,
  onGenerate10k,
  isProcessing
}) {
  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Liquidity aggregations
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const avgBalance = useMemo(() => {
    return accounts.length ? totalBalance / accounts.length : 0;
  }, [accounts, totalBalance]);

  const pendingCredits = useMemo(() => {
    return transactions.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);

  const pendingDebits = useMemo(() => {
    return transactions.filter(t => t.type === 'DEBIT').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);

  // Featured Accounts: Top 6 accounts for quick customer service
  const featuredAccounts = useMemo(() => {
    return accounts.slice(0, 6);
  }, [accounts]);

  // Recent transactions stream (latest 6 staged transactions or processed transactions)
  const recentActivity = useMemo(() => {
    const list = [];
    if (transactions.length > 0) {
      list.push(...transactions.slice(0, 5).map(t => ({ ...t, statusLabel: 'PENDING_CLEARING', isPending: true })));
    }
    if (processed.length > 0 && list.length < 6) {
      list.push(...processed.slice(-4).map(p => ({ ...p, statusLabel: 'CLEARED_POSTED', isPending: false })));
    }
    return list.slice(0, 6);
  }, [transactions, processed]);

  return (
    <div style={{ padding: '26px 30px' }}>

      {/* Hero Banner: Institutional Net Worth */}
      <div className="balance-hero-banner" style={{ marginBottom: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.16)', 
                backdropFilter: 'blur(8px)',
                padding: '4px 12px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '11px', 
                fontWeight: 700, 
                letterSpacing: '0.04em',
                border: '1px solid rgba(255, 255, 255, 0.22)'
              }}>
                🏦 CORE SYSTEM LEDGER
              </span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>VSAM KSDS Cluster Active</span>
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, fontWeight: 700 }}>
              TOTAL POSTED SYSTEM LIQUIDITY
            </div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.8rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              marginTop: '4px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              {formatCurrency(totalBalance)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '6px' }}>
              Across {accounts.length.toLocaleString()} customer accounts • Avg balance: {formatCurrency(avgBalance)}
            </div>
          </div>

          {/* Quick Overview Cards with faint positive highlights */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.32)',
              borderRadius: '14px',
              padding: '14px 18px',
              minWidth: '155px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                STAGED INFLOW (CR)
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-display)', marginTop: '3px' }}>
                +{formatCurrency(pendingCredits)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                {transactions.filter(t => t.type === 'CREDIT').length} deposit batches
              </div>
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.14)',
              border: '1px solid rgba(244, 63, 94, 0.32)',
              borderRadius: '14px',
              padding: '14px 18px',
              minWidth: '155px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                STAGED OUTFLOW (DR)
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#F87171', fontFamily: 'var(--font-display)', marginTop: '3px' }}>
                -{formatCurrency(pendingDebits)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                {transactions.filter(t => t.type === 'DEBIT').length} withdrawal batches
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.32)',
              borderRadius: '14px',
              padding: '14px 18px',
              minWidth: '140px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                SUSPENSE REJECTS
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FDE047', fontFamily: 'var(--font-display)', marginTop: '3px' }}>
                {exceptions.length} REJECTS
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                Overdraft protection active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)', gap: '24px' }}>

        {/* LEFT COLUMN: Featured Customer Accounts & Quick Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Section: Featured Accounts */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Customer Master Accounts
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Frequently accessed core banking customer ledgers with one-click transfer actions
                </p>
              </div>
              
              <button
                className="btn btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('accounts')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                <span>View All {accounts.length} Accounts</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Grid of 6 Featured Accounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {featuredAccounts.map(acc => {
                const initials = acc.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                return (
                  <div 
                    key={acc.id} 
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'var(--brand-navy-pale)',
                            color: 'var(--brand-navy-light)',
                            fontWeight: 700,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-display)',
                            border: '1px solid var(--brand-navy-border)'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{acc.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACCT-{acc.id}</div>
                          </div>
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '9px', padding: '2px 7px' }}>
                          {acc.type}
                        </span>
                      </div>

                      <div style={{ marginTop: '10px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>POSTED BALANCE</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {formatCurrency(acc.balance)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        className="btn btn-credit-action"
                        style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}
                        onClick={() => onQuickTxn(acc.id, 'CREDIT')}
                      >
                        <ArrowDownLeft size={12} />
                        <span>Credit</span>
                      </button>
                      <button
                        className="btn btn-debit-action"
                        style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}
                        onClick={() => onQuickTxn(acc.id, 'DEBIT')}
                      >
                        <ArrowUpRight size={12} />
                        <span>Debit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Live Activity / Transaction Feed */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Transaction Queue & Activity
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Live sequential records awaiting overnight batch settlement
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('database')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                <span>View Full Dataset</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No pending or processed transactions recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentActivity.map((txn, idx) => (
                  <div
                    key={txn.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 16px',
                      background: 'var(--bg-primary)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '9px',
                        background: txn.type === 'CREDIT' ? 'var(--brand-teal-light)' : 'var(--brand-coral-light)',
                        color: txn.type === 'CREDIT' ? 'var(--brand-teal-dark)' : 'var(--brand-coral-dark)',
                        border: `1px solid ${txn.type === 'CREDIT' ? 'var(--brand-teal-border)' : 'var(--brand-coral-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {txn.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {txn.description || 'ONLINE_BATCH_ENTRY'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {txn.id} • ACCT-{txn.accountId}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontSize: '14px', 
                        fontWeight: 800,
                        color: txn.type === 'CREDIT' ? 'var(--emerald-success)' : 'var(--crimson-danger)'
                      }}>
                        {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                      <span className={`badge ${txn.isPending ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '9px', padding: '2px 7px', marginTop: '2px' }}>
                        {txn.isPending ? 'PENDING BATCH' : 'CLEARED & POSTED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Batch Clearing Control Hub & System Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Batch Clearing Operations Card */}
          <div className="glass-panel" style={{ 
            padding: '24px', 
            borderRadius: '16px',
            borderTop: '4px solid var(--brand-navy-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={18} color="var(--brand-navy-light)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Overnight Batch Clearing Center
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Executes JCL Job <code>//BATCHJOB</code> with COBOL <code>TRANPROC</code>. Reads staged QSAM records and posts balances to the VSAM Master.
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Staged Transaction Queue:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--brand-navy-light)' }}>
                  {transactions.length.toLocaleString()} records
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Net Settlement Spread:</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(pendingCredits - pendingDebits)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-mainframe"
              onClick={onRunBatch}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                marginBottom: '12px'
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>{isProcessing ? 'Executing Mainframe Batch...' : 'Execute Batch Clearing (JCL)'}</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={onOpenTxnModal}
                style={{ flex: 1, fontSize: '12px', padding: '8px' }}
              >
                + Stage Transfer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('spool')}
                style={{ flex: 1, fontSize: '12px', padding: '8px' }}
              >
                Inspect Spool
              </button>
            </div>
          </div>

          {/* 10,000 Transaction Simulator Card */}
          <div className="glass-panel" style={{ 
            padding: '22px', 
            borderRadius: '16px',
            background: 'var(--brand-gold-bg)',
            border: '1px solid var(--brand-gold-border)',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="var(--brand-gold)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--brand-gold)' }}>
                10K Transaction Stress Simulator
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Load an institutional volume dataset with 500 accounts and 10,000 realistic transactions with paise fractions and overdraft scenarios.
            </p>
            <button
              onClick={onGenerate10k}
              disabled={isProcessing}
              style={{ 
                width: '100%', 
                fontSize: '12px', 
                padding: '10px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {isProcessing ? 'Generating 10,000 Rows...' : '⚡ Generate 10K Row Dataset'}
            </button>
          </div>

          {/* System Telemetry Specs Card */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              System Specifications & Telemetry
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mainframe Platform</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>IBM z/OS JES2 V2R5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Engine</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-navy-light)' }}>COBOL TRANPROC.cbl</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Master Database</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>VSAM KSDS Indexed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Math Precision</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald-success)' }}>Fixed-Point PIC 9(10)V99</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audit Proof Equation</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald-success)' }}>Balanced (RC=0000)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useMemo } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
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
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const avgBalance = accounts.length ? (totalBalance / accounts.length) : 0;

  const pendingCredits = useMemo(() => {
    return transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const pendingDebits = useMemo(() => {
    return transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Top 6 featured accounts for the dashboard preview
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
    <div style={{ padding: '24px 28px' }}>

      {/* Hero Banner: Institutional Net Worth */}
      <div className="balance-hero-banner" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.16)', 
                padding: '4px 12px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '11px', 
                fontWeight: 700, 
                letterSpacing: '0.04em' 
              }}>
                🏦 CORE SYSTEM LEDGER
              </span>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>VSAM KSDS Cluster Active</span>
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, fontWeight: 600 }}>
              TOTAL POSTED SYSTEM LIQUIDITY
            </div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.6rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              marginTop: '4px' 
            }}>
              {formatCurrency(totalBalance)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              Across {accounts.length.toLocaleString()} customer accounts • Avg balance: {formatCurrency(avgBalance)}
            </div>
          </div>

          {/* Quick Overview Cards */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              minWidth: '150px',
              backdropFilter: 'blur(6px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>STAGED INFLOW (CR)</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#6EE7B7', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                +{formatCurrency(pendingCredits)}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                {transactions.filter(t => t.type === 'CREDIT').length} deposit requests
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              minWidth: '150px',
              backdropFilter: 'blur(6px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>STAGED OUTFLOW (DR)</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FCA5A5', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                -{formatCurrency(pendingDebits)}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                {transactions.filter(t => t.type === 'DEBIT').length} withdrawal requests
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              minWidth: '130px',
              backdropFilter: 'blur(6px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>SUSPENSE REJECTS</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FDE047', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                {exceptions.length} REJECTED
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                Overdraft protection active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)', gap: '22px' }}>

        {/* LEFT COLUMN: Featured Customer Accounts & Quick Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Section: Featured Accounts */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Customer Master Accounts
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Frequently accessed core banking customer ledgers
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {featuredAccounts.map(acc => {
                const initials = acc.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                return (
                  <div 
                    key={acc.id} 
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--brand-navy-pale)',
                            color: 'var(--brand-navy-mid)',
                            fontWeight: 700,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-display)'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{acc.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACCT-{acc.id}</div>
                          </div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {acc.type}
                        </span>
                      </div>

                      <div style={{ marginTop: '8px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>POSTED BALANCE</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1px' }}>
                          {formatCurrency(acc.balance)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        className="btn btn-credit-action"
                        style={{ flex: 1, padding: '6px', fontSize: '11px' }}
                        onClick={() => onQuickTxn(acc.id, 'CREDIT')}
                      >
                        <ArrowDownLeft size={12} />
                        <span>Credit</span>
                      </button>
                      <button
                        className="btn btn-debit-action"
                        style={{ flex: 1, padding: '6px', fontSize: '11px' }}
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
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Transaction Queue & Activity
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Staged sequential records awaiting overnight batch settlement
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentActivity.map((txn, idx) => (
                  <div
                    key={txn.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-hairline)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: txn.type === 'CREDIT' ? 'var(--brand-teal-light)' : 'var(--brand-coral-light)',
                        color: txn.type === 'CREDIT' ? 'var(--brand-teal-dark)' : 'var(--brand-coral-dark)',
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
                        color: txn.type === 'CREDIT' ? 'var(--brand-teal)' : 'var(--brand-coral)'
                      }}>
                        {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                      <span className={`badge ${txn.isPending ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {txn.isPending ? 'PENDING BATCH' : 'CLEARED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Batch Clearing Control Hub & System Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Batch Clearing Operations Card */}
          <div className="glass-panel" style={{ 
            padding: '22px', 
            borderRadius: 'var(--radius-lg)',
            borderTop: '4px solid var(--brand-navy-mid)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Clock size={16} color="var(--brand-navy-mid)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Overnight Batch Clearing Center
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Executes JCL Job <code>//BATCHJOB</code> with COBOL <code>TRANPROC</code>. Reads staged QSAM records and posts balances to the VSAM Master.
            </p>

            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Staged Transaction Queue:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--brand-navy-mid)' }}>
                  {transactions.length.toLocaleString()} records
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
                marginBottom: '10px'
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>{isProcessing ? 'Executing Mainframe Batch...' : 'Execute Batch Clearing (JCL)'}</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={onOpenTxnModal}
                style={{ flex: 1, fontSize: '11px', padding: '8px' }}
              >
                + Stage Transfer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('spool')}
                style={{ flex: 1, fontSize: '11px', padding: '8px' }}
              >
                Inspect Spool
              </button>
            </div>
          </div>

          {/* 10,000 Transaction Simulator Card */}
          <div className="glass-panel" style={{ 
            padding: '20px', 
            borderRadius: 'var(--radius-lg)',
            background: 'var(--brand-gold-bg)',
            border: '1px solid rgba(201, 147, 58, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={16} color="var(--brand-gold)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: 'var(--brand-gold)' }}>
                10K Transaction Stress Simulator
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Load an institutional volume dataset with 500 accounts and 10,000 realistic transactions with paise fractions and overdraft scenarios.
            </p>
            <button
              className="btn btn-gold"
              onClick={onGenerate10k}
              disabled={isProcessing}
              style={{ width: '100%', fontSize: '12px', padding: '10px' }}
            >
              {isProcessing ? 'Generating 10,000 Rows...' : 'Generate 10K Row Dataset'}
            </button>
          </div>

          {/* System Telemetry Specs Card */}
          <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              System Specifications & Audit
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mainframe OS</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>IBM z/OS JES2 V2R5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Engine</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-navy-mid)' }}>COBOL TRANPROC.cbl</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Master Database</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>VSAM KSDS Indexed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Math Precision</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-teal)' }}>Fixed-Point PIC 9(10)V99</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audit Proof Equation</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-teal)' }}>Balanced (RC=0000)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

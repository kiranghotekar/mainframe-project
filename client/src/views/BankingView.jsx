import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, Layers, Play, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BankingView({ accounts, transactions, processed, exceptions, onQuickTxn, onRunBatch, isProcessing }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    setPage(1);
  }, [filterQuery]);

  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const avgBalance = accounts.length ? (totalBalance / accounts.length) : 0;

  const pendingCredits = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const pendingDebits = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // Pre-aggregate counts using Hash Maps to avoid O(N * M) performance drops with 10k rows
  const txnCounts = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < transactions.length; i++) {
      const id = transactions[i].accountId;
      map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [transactions]);

  const procCounts = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < processed.length; i++) {
      const id = processed[i].accountId;
      map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [processed]);

  const excCounts = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < exceptions.length; i++) {
      const id = exceptions[i].accountId;
      map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [exceptions]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
    acc.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (acc.type && acc.type.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedAccounts = filteredAccounts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>

      {/* Flagship Net Banking Balance Hero Banner */}
      <div className="balance-hero-banner" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                padding: '4px 10px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '11px', 
                fontWeight: 600, 
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                🏦 VSAM KSDS MASTER LEDGER
              </span>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>{accounts.length} Active Accounts</span>
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, fontWeight: 600 }}>
              TOTAL SYSTEM LIQUIDITY (POSTED CORE BALANCE)
            </div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              marginTop: '4px',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {formatCurrency(totalBalance)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              minWidth: '140px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>STAGED INFLOW</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#6EE7B7', fontFamily: 'var(--font-display)' }}>
                +{formatCurrency(pendingCredits)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              minWidth: '140px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>STAGED OUTFLOW</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FCA5A5', fontFamily: 'var(--font-display)' }}>
                -{formatCurrency(pendingDebits)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              minWidth: '130px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.75, textTransform: 'uppercase', fontWeight: 600 }}>SUSPENSE REJECTS</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FDE047', fontFamily: 'var(--font-display)' }}>
                {exceptions.length} REJECTED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Batch Alert Banner (if transactions are staged) */}
      {transactions.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--brand-navy-light)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--brand-navy-light)',
              boxShadow: '0 0 10px var(--brand-navy-light)'
            }} />
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px' }}>
              <span style={{ color: 'var(--brand-navy-mid)', fontWeight: 700 }}>
                {transactions.length.toLocaleString()} STAGED TRANSACTIONS READY FOR CLEARING: 
              </span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                +{formatCurrency(pendingCredits)} (CREDITS) / -{formatCurrency(pendingDebits)} (DEBITS)
              </span>
            </div>
          </div>
          <button
            className="btn btn-mainframe"
            onClick={onRunBatch}
            disabled={isProcessing}
            style={{ fontSize: '11px', padding: '8px 16px' }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isProcessing ? 'RUNNING BATCH...' : 'EXECUTE //BATCHJOB'}</span>
          </button>
        </div>
      )}

      {/* KPI Order-Book Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand-navy-mid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL SYSTEM LEDGERS</span>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>ACTIVE</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {accounts.length.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            VSAM KSDS MASTER ACCOUNTS
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand-navy-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>AVERAGE LEDGER BALANCE</span>
            <TrendingUp size={15} color="var(--brand-navy-light)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatCurrency(avgBalance)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            SYSTEM-WIDE ARITHMETIC MEAN
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand-teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>PENDING INFLOWS (CREDIT)</span>
            <ArrowDownLeft size={15} color="var(--brand-teal)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-teal)', letterSpacing: '-0.02em' }}>
            +{formatCurrency(pendingCredits)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            {transactions.filter(t => t.type === 'CREDIT').length} STAGED DEPOSITS
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand-coral)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>PENDING OUTFLOWS (DEBIT)</span>
            <ArrowUpRight size={15} color="var(--brand-coral)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-coral)', letterSpacing: '-0.02em' }}>
            -{formatCurrency(pendingDebits)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginTop: '4px' }}>
            {transactions.filter(t => t.type === 'DEBIT').length} STAGED WITHDRAWALS
          </div>
        </div>

      </div>

      {/* VSAM Master Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--brand-navy-mid)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            VSAM ACCT.MASTER.KSDS CLUSTER
          </h2>
          <span className="badge badge-cyan">{filteredAccounts.length} / {accounts.length} RECORDS</span>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            placeholder="Search account name or ID..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', height: '36px' }}
          />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {displayedAccounts.map(acc => {
          const stagedCount = txnCounts.get(acc.id) || 0;
          const clearedCount = procCounts.get(acc.id) || 0;
          const suspenseCount = excCounts.get(acc.id) || 0;
          const initials = acc.name.split(' ').map(n => n[0]).slice(0, 2).join('');

          return (
            <div key={acc.id} className="account-card animate-fade-in">

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--brand-navy-pale)',
                    color: 'var(--brand-navy-mid)',
                    fontWeight: 700,
                    fontSize: '13px',
                    fontFamily: 'var(--font-display)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(30, 58, 138, 0.15)'
                  }}>
                    {initials || 'AC'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {acc.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        ACCT-{acc.id}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {acc.status || 'ACTIVE'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {acc.type || 'SAVINGS'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formatCurrency(acc.balance)}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                    POSTED BALANCE
                  </div>
                </div>
              </div>

              {/* Account Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '4px',
                padding: '8px 10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '14px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>STAGED</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: stagedCount > 0 ? 'var(--brand-navy-light)' : 'var(--text-muted)' }}>
                    {stagedCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CLEARED</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--brand-teal)' }}>
                    {clearedCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>SUSPENSE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: suspenseCount > 0 ? 'var(--crimson-danger)' : 'var(--text-muted)' }}>
                    {suspenseCount}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-credit-action"
                  style={{ flex: 1 }}
                  onClick={() => onQuickTxn(acc.id, 'CREDIT')}
                >
                  <ArrowDownLeft size={13} />
                  <span>+ Credit Deposit</span>
                </button>
                <button
                  className="btn btn-debit-action"
                  style={{ flex: 1 }}
                  onClick={() => onQuickTxn(acc.id, 'DEBIT')}
                >
                  <ArrowUpRight size={13} />
                  <span>- Debit Withdrawal</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pagination Controls for Accounts */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            SHOWING ACCOUNTS {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAccounts.length)} OF {filteredAccounts.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 12px', fontSize: '10px' }}
            >
              <ChevronLeft size={12} />
              <span>PREV PAGE</span>
            </button>
            <span style={{ color: 'var(--matrix-green)', fontWeight: 700, fontSize: '11px', padding: '0 8px' }}>
              PAGE {currentPage} OF {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 12px', fontSize: '10px' }}
            >
              <span>NEXT PAGE</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

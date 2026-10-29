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

      {/* Pending Batch Alert Banner (if transactions are staged) */}
      {transactions.length > 0 && (
        <div style={{
          background: 'var(--matrix-green-bg)',
          border: '1px solid var(--matrix-green-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '1px',
              background: 'var(--matrix-green)',
              boxShadow: '0 0 8px var(--matrix-green)'
            }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <span style={{ color: 'var(--matrix-green)', fontWeight: 700 }}>{transactions.length} STAGED TRANSACTIONS PENDING BATCH COMMIT: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                +{formatCurrency(pendingCredits)} (CREDITS) / -{formatCurrency(pendingDebits)} (DEBITS)
              </span>
            </div>
          </div>
          <button
            className="btn btn-mainframe"
            onClick={onRunBatch}
            disabled={isProcessing}
            style={{ fontSize: '10px', padding: '6px 12px' }}
          >
            <Play size={12} fill="currentColor" />
            <span>{isProcessing ? 'RUNNING BATCH...' : 'EXECUTE //BATCHJOB'}</span>
          </button>
        </div>
      )}

      {/* KPI Order-Book Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>

        <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0 }}>TOTAL SYSTEM LIQUIDITY</span>
            <span style={{ color: 'var(--matrix-green)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>VSAM KSDS</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--matrix-green)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalBalance)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            ACROSS {accounts.length} ACTIVE LEDGERS
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0 }}>AVERAGE ACCOUNT BALANCE</span>
            <TrendingUp size={14} color="var(--text-secondary)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatCurrency(avgBalance)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            SYSTEM-WIDE ARITHMETIC MEAN
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0 }}>PENDING CREDITS (STAGED)</span>
            <ArrowDownLeft size={14} color="var(--matrix-green)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--matrix-green)', letterSpacing: '-0.02em' }}>
            +{formatCurrency(pendingCredits)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {transactions.filter(t => t.type === 'CREDIT').length} DEPOSIT TRANSACTIONS
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="form-label" style={{ margin: 0 }}>PENDING DEBITS (STAGED)</span>
            <ArrowUpRight size={14} color="var(--amber-warning)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--amber-warning)', letterSpacing: '-0.02em' }}>
            -{formatCurrency(pendingDebits)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {transactions.filter(t => t.type === 'DEBIT').length} WITHDRAWAL TRANSACTIONS
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
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={14} color="var(--matrix-green)" />
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            VSAM ACCT.MASTER.KSDS CLUSTER
          </h2>
          <span className="badge badge-cyan">{filteredAccounts.length} / {accounts.length} RECORDS</span>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            placeholder="FILTER BY ACCT / NAME..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ paddingLeft: '30px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', fontSize: '11px', height: '32px' }}
          />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
        {displayedAccounts.map(acc => {
          const stagedCount = txnCounts.get(acc.id) || 0;
          const clearedCount = procCounts.get(acc.id) || 0;
          const suspenseCount = excCounts.get(acc.id) || 0;

          return (
            <div key={acc.id} className="account-card animate-fade-in">

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <CreditCard size={14} color="var(--matrix-green)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {acc.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      ACCT-{acc.id}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {acc.status || 'ACTIVE'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      [{acc.type || 'SAVINGS'}]
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--matrix-green)' }}>
                    {formatCurrency(acc.balance)}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
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
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>STAGED</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: stagedCount > 0 ? 'var(--matrix-green)' : 'var(--text-muted)' }}>
                    {stagedCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CLEARED</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {clearedCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SUSPENSE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: suspenseCount > 0 ? 'var(--crimson-danger)' : 'var(--text-muted)' }}>
                    {suspenseCount}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '10px', padding: '6px 10px' }}
                  onClick={() => onQuickTxn(acc.id, 'CREDIT')}
                >
                  <ArrowDownLeft size={12} color="var(--matrix-green)" />
                  <span>+ CREDIT</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '10px', padding: '6px 10px' }}
                  onClick={() => onQuickTxn(acc.id, 'DEBIT')}
                >
                  <ArrowUpRight size={12} color="var(--amber-warning)" />
                  <span>- DEBIT</span>
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

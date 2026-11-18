import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  UserCheck
} from 'lucide-react';

export default function AccountsView({ 
  accounts, 
  transactions, 
  processed, 
  exceptions, 
  onQuickTxn 
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    setPage(1);
  }, [filterQuery, typeFilter]);

  // Pre-aggregate counts using Hash Maps
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

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch = 
        acc.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
        acc.name.toLowerCase().includes(filterQuery.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || (acc.type && acc.type.toUpperCase() === typeFilter);
      return matchesSearch && matchesType;
    });
  }, [accounts, filterQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedAccounts = filteredAccounts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '26px 30px' }}>
      
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '22px'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Customer Master Ledgers (VSAM KSDS)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Browse and manage all {accounts.length.toLocaleString()} active customer accounts with real-time posted balances
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Segmented Account Type Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-tertiary)', 
            padding: '3px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-subtle)' 
          }}>
            {['ALL', 'SAVINGS', 'CURRENT'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: typeFilter === t ? 'var(--bg-card)' : 'transparent',
                  color: typeFilter === t ? 'var(--brand-navy-light)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: typeFilter === t ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: typeFilter === t ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {t === 'ALL' ? 'All Accounts' : t === 'SAVINGS' ? 'Savings' : 'Current'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              placeholder="Search by ID or customer name..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '12px', height: '36px' }}
            />
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
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
                    borderRadius: '50%',
                    background: 'var(--brand-navy-pale)',
                    color: 'var(--brand-navy-light)',
                    fontWeight: 700,
                    fontSize: '13px',
                    fontFamily: 'var(--font-display)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--brand-navy-border)'
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
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formatCurrency(acc.balance)}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    POSTED BALANCE
                  </div>
                </div>
              </div>

              {/* Account Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '4px',
                padding: '8px 12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
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
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--emerald-success)' }}>
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          fontFamily: 'var(--font-ui)'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Showing accounts {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAccounts.length)} of {filteredAccounts.length.toLocaleString()}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              style={{ padding: '6px 10px' }}
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span style={{ color: 'var(--brand-navy-light)', fontWeight: 700, padding: '0 10px' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 12px' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              style={{ padding: '6px 10px' }}
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

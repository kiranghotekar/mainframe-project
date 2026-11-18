import React, { useState, useMemo } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExceptionsView({ exceptions, accounts, onFundAndRetry }) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const accountMap = useMemo(() => {
    return new Map(accounts.map(a => [a.id, a]));
  }, [accounts]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!exceptions || exceptions.length === 0) {
    return (
      <div style={{ padding: '40px 30px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '540px', margin: '0 auto', padding: '40px 32px', borderRadius: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--brand-teal-light)',
            border: '1px solid var(--brand-teal-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--emerald-success)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Zero Rejects in Suspense Queue
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
            All staged batch transactions have been balanced, verified, and committed to the VSAM Master Ledger without deficits or routing rejections.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(exceptions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedExceptions = exceptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '26px 30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--crimson-bg)',
            border: '1px solid var(--crimson-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--crimson-danger)'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Exception Suspense Queue
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
              Transactions rejected by COBOL TRANPROC due to Non-Sufficient Funds (NSF) or invalid account routing
            </p>
          </div>
        </div>
        <span className="badge badge-danger" style={{ fontSize: '11px', padding: '4px 12px' }}>
          {exceptions.length} Suspended Records
        </span>
      </div>

      {/* Exception Items */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {displayedExceptions.map((exc, idx) => {
          const account = accountMap.get(exc.accountId);
          const currentBal = account ? account.balance : 0;
          const deficit = exc.type === 'DEBIT' && account ? (Number(exc.amount) - currentBal) : 0;

          return (
            <div key={idx} className="glass-panel animate-fade-in" style={{
              padding: '20px 24px',
              borderRadius: '14px',
              borderLeft: '4px solid var(--crimson-danger)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <XCircle size={16} color="var(--crimson-danger)" />
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {exc.reason || 'INSUFFICIENT_FUNDS'}
                    </span>
                    <span className="badge badge-danger" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      SUSPENDED (RC=0004)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>TARGET ACCOUNT</span>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ACCT-{exc.accountId} {account ? `(${account.name})` : '[NOT FOUND]'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>REQUESTED AMOUNT</span>
                      <div style={{ fontWeight: 700, color: 'var(--crimson-danger)', marginTop: '2px' }}>
                        {formatCurrency(exc.amount)} [{exc.type}]
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>POSTED BALANCE</span>
                      <div style={{ fontWeight: 700, color: 'var(--emerald-success)', marginTop: '2px' }}>
                        {formatCurrency(currentBal)}
                      </div>
                    </div>
                    {deficit > 0 && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>DEFICIT SPREAD</span>
                        <div style={{ fontWeight: 700, color: 'var(--amber-warning)', marginTop: '2px' }}>
                          {formatCurrency(deficit)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {deficit > 0 && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '10px 18px', borderRadius: '10px' }}
                    onClick={() => onFundAndRetry(exc.accountId, deficit)}
                  >
                    <RefreshCw size={14} />
                    <span>Emergency Fund & Retry Batch</span>
                  </button>
                )}
              </div>

              {exc.description && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ORIGINAL NARRATION: {exc.description} | LOGICAL SEQUENCE ID: {exc.id || `EXC${idx + 1}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Showing exceptions {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, exceptions.length)} of {exceptions.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span style={{ color: 'var(--brand-navy-light)', fontWeight: 700, padding: '0 8px' }}>
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
          </div>
        </div>
      )}

    </div>
  );
}

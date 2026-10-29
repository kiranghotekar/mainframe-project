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
      <div style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '36px 28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--matrix-green-bg)',
            border: '1px solid var(--matrix-green-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ShieldCheck size={26} color="var(--matrix-green)" />
          </div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ZERO REJECTS IN SUSPENSE QUEUE
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
            ALL STAGED BATCH TRANSACTIONS HAVE BEEN BALANCED, VALIDATED, AND COMMITTED TO
            VSAM ACCT.MASTER WITHOUT ACCOUNT DEFICITS OR INVALID ROUTINGS.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(exceptions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedExceptions = exceptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '0 24px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--crimson-danger)" />
          <h2 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            EXCEPTION SUSPENSE QUEUE // EXCEPT.SUSPENSE.SEQ
          </h2>
        </div>
        <span className="badge badge-danger" style={{ fontSize: '10px' }}>
          {exceptions.length} SUSPENDED RECORDS
        </span>
      </div>

      {/* Exception Items */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {displayedExceptions.map((exc, idx) => {
          const account = accountMap.get(exc.accountId);
          const currentBal = account ? account.balance : 0;
          const deficit = exc.type === 'DEBIT' && account ? (Number(exc.amount) - currentBal) : 0;

          return (
            <div key={idx} className="glass-panel animate-fade-in" style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--crimson-danger)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <XCircle size={14} color="var(--crimson-danger)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {exc.reason || 'INSUFFICIENT_FUNDS'}
                    </span>
                    <span className="badge badge-danger" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      SUSPENDED (RC=0004)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>TARGET ACCOUNT</span>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ACCT-{exc.accountId} {account ? `(${account.name})` : '[NOT FOUND]'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>REQUESTED AMOUNT</span>
                      <div style={{ fontWeight: 700, color: 'var(--crimson-danger)' }}>
                        {formatCurrency(exc.amount)} [{exc.type}]
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>POSTED BALANCE</span>
                      <div style={{ fontWeight: 700, color: 'var(--matrix-green)' }}>
                        {formatCurrency(currentBal)}
                      </div>
                    </div>
                    {deficit > 0 && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>DEFICIT SPREAD</span>
                        <div style={{ fontWeight: 700, color: 'var(--amber-warning)' }}>
                          {formatCurrency(deficit)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {deficit > 0 && (
                  <button
                    className="btn btn-mainframe"
                    style={{ fontSize: '10px', padding: '8px 12px' }}
                    onClick={() => onFundAndRetry(exc.accountId, deficit)}
                  >
                    <RefreshCw size={12} />
                    <span>EMERGENCY FUND & RE-RUN BATCH</span>
                  </button>
                )}
              </div>

              {exc.description && (
                <div style={{
                  marginTop: '10px',
                  padding: '6px 10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ORIGINAL NARRATION: {exc.description} | LOGICAL SEQUENCE RECORD: {exc.id || `EXC${idx + 1}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls for Exceptions */}
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
            SHOWING EXCEPTIONS {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, exceptions.length)} OF {exceptions.length}
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
            <span style={{ color: 'var(--crimson-danger)', fontWeight: 700, fontSize: '11px', padding: '0 8px' }}>
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

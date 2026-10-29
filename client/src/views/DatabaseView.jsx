import React, { useState, useEffect } from 'react';
import { Database, Search, HardDrive, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function DatabaseView({ accounts, transactions, processed, exceptions }) {
  const [activeDataset, setActiveDataset] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset page when dataset or search term changes
  useEffect(() => {
    setPage(1);
  }, [activeDataset, searchTerm, pageSize]);

  const datasets = {
    accounts: { label: 'ACCT.MASTER.VSAM (KSDS)', data: accounts, desc: 'Indexed Key-Sequenced Dataset (Primary Key: 6-char Account ID)' },
    transactions: { label: 'TRANS.PENDING.QSAM', data: transactions, desc: 'Queued Sequential Access Method (Staged batch records)' },
    processed: { label: 'TRANS.PROCESSED.ARCH', data: processed, desc: 'Historical Cleared Sequential Archive Dataset' },
    exceptions: { label: 'EXCEPT.SUSPENSE.SEQ', data: exceptions, desc: 'Rejected Transaction Suspense Queue Dataset' }
  };

  const currentData = datasets[activeDataset]?.data || [];
  const filteredData = searchTerm
    ? currentData.filter(row => JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase()))
    : currentData;

  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = pageSize === 'ALL' ? 0 : (currentPage - 1) * pageSize;
  const endIndex = pageSize === 'ALL' ? filteredData.length : Math.min(startIndex + pageSize, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  const formatValue = (col, val) => {
    if (val === null || val === undefined) return '-';
    if (col === 'balance' || col === 'amount' || col === 'initialBalance') {
      return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (col === 'type') {
      return (
        <span className={`badge ${val === 'CREDIT' ? 'badge-success' : val === 'DEBIT' ? 'badge-warning' : 'badge-cyan'}`} style={{ fontSize: '9px' }}>
          {val}
        </span>
      );
    }
    if (col === 'status') {
      return (
        <span className={`badge ${val === 'ACTIVE' ? 'badge-success' : val === 'REJECTED' ? 'badge-danger' : 'badge-cyan'}`} style={{ fontSize: '9px' }}>
          {val}
        </span>
      );
    }
    if (col === 'reason') {
      return (
        <span style={{ color: 'var(--crimson-danger)', fontWeight: 700 }}>
          {val}
        </span>
      );
    }
    return String(val);
  };

  return (
    <div style={{ padding: '0 24px 24px' }}>
      
      {/* Header & Dataset Overview */}
      <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="var(--matrix-green)" />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
                MAINFRAME VSAM & FLAT DATASET INSPECTOR
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {datasets[activeDataset]?.desc}
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              placeholder="SEARCH CATALOGED RECORDS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '30px', fontSize: '11px', height: '32px' }}
            />
          </div>
        </div>
      </div>

      {/* Dataset Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto' }}>
        {Object.entries(datasets).map(([key, ds]) => {
          const isActive = activeDataset === key;
          return (
            <button
              key={key}
              onClick={() => setActiveDataset(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: isActive ? 'var(--matrix-green-bg)' : 'var(--bg-secondary)',
                border: isActive ? '1px solid var(--matrix-green-border)' : '1px solid var(--border-subtle)',
                color: isActive ? 'var(--matrix-green)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{ds.label}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--matrix-green-bg)' : 'var(--border-subtle)',
                color: isActive ? 'var(--matrix-green)' : 'var(--text-muted)'
              }}>
                {ds.data.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center' }}>
            <HardDrive size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {searchTerm ? 'NO RECORDS MATCH THE SEARCH QUERY.' : 'CATALOGED DATASET IS EMPTY — ZERO LOGICAL RECORDS ALLOCATED.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  {columns.map(col => (
                    <th key={col}>{col.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, idx) => (
                  <tr key={startIndex + idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      {String(startIndex + idx + 1).padStart(5, '0')}
                    </td>
                    {columns.map(col => (
                      <td key={col} style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatValue(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          <span>CATALOG: {datasets[activeDataset]?.label} | LRECL=80 BLKSIZE=3120 RECFM=FB</span>
          <span style={{ marginLeft: '12px' }}>
            RECORDS {filteredData.length > 0 ? startIndex + 1 : 0}-{endIndex} OF {filteredData.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>ROWS/PAGE:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                padding: '3px 6px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value="ALL">ALL</option>
            </select>
          </div>

          {pageSize !== 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className="btn btn-secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
                title="First Page"
                style={{ padding: '4px 6px', fontSize: '10px' }}
              >
                <ChevronsLeft size={12} />
              </button>
              <button
                className="btn btn-secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                title="Previous Page"
                style={{ padding: '4px 8px', fontSize: '10px' }}
              >
                <ChevronLeft size={12} />
                <span>PREV</span>
              </button>

              <span style={{ padding: '0 6px', color: 'var(--matrix-green)', fontWeight: 700, fontSize: '10px' }}>
                PAGE {currentPage} / {totalPages}
              </span>

              <button
                className="btn btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                title="Next Page"
                style={{ padding: '4px 8px', fontSize: '10px' }}
              >
                <span>NEXT</span>
                <ChevronRight size={12} />
              </button>
              <button
                className="btn btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
                title="Last Page"
                style={{ padding: '4px 6px', fontSize: '10px' }}
              >
                <ChevronsRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

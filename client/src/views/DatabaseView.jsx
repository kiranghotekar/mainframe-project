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
        <span className={`badge ${val === 'CREDIT' ? 'badge-success' : val === 'DEBIT' ? 'badge-danger' : 'badge-blue'}`} style={{ fontSize: '9px', padding: '2px 7px' }}>
          {val}
        </span>
      );
    }
    if (col === 'status') {
      return (
        <span className={`badge ${val === 'ACTIVE' ? 'badge-success' : val === 'REJECTED' ? 'badge-danger' : 'badge-blue'}`} style={{ fontSize: '9px', padding: '2px 7px' }}>
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
    <div style={{ padding: '26px 30px' }}>
      
      {/* Header & Dataset Overview */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'var(--brand-navy-pale)', 
                border: '1px solid var(--brand-navy-border)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--brand-navy-light)'
              }}>
                <Database size={18} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Cataloged VSAM & QSAM Datasets
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
              {datasets[activeDataset]?.desc}
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              placeholder="Filter catalog records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '12px', height: '36px' }}
            />
          </div>
        </div>
      </div>

      {/* Dataset Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', overflowX: 'auto' }}>
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
                padding: '9px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: isActive ? 'var(--brand-navy-pale)' : 'var(--bg-card)',
                border: isActive ? '1px solid var(--brand-navy-border)' : '1px solid var(--border-subtle)',
                color: isActive ? 'var(--brand-navy-light)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '12px',
                fontFamily: 'var(--font-ui)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.08)' : '0 1px 2px rgba(15, 23, 42, 0.03)'
              }}
            >
              <span>{ds.label}</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--bg-card)' : 'var(--bg-tertiary)',
                color: isActive ? 'var(--brand-navy-light)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)'
              }}>
                {ds.data.length.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ borderRadius: '14px', overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <HardDrive size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {searchTerm ? 'No records match the search filter.' : 'Cataloged dataset is empty.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th style={{ width: '55px' }}>#</th>
                  {columns.map(col => (
                    <th key={col}>{col.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, idx) => (
                  <tr key={startIndex + idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      {String(startIndex + idx + 1).padStart(5, '0')}
                    </td>
                    {columns.map(col => (
                      <td key={col} style={{ fontFamily: typeof row[col] === 'number' || col.toLowerCase().includes('id') ? 'var(--font-mono)' : 'var(--font-ui)', fontSize: '12px' }}>
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
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px'
      }}>
        <div style={{ color: 'var(--text-muted)' }}>
          Showing records {startIndex + 1}–{endIndex} of {filteredData.length.toLocaleString()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
      </div>

    </div>
  );
}

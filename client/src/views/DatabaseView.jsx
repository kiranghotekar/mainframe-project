import React, { useState } from 'react';
import { Database, Search, HardDrive } from 'lucide-react';

export default function DatabaseView({ accounts, transactions, processed, exceptions }) {
  const [activeDataset, setActiveDataset] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');

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
                  <th style={{ width: '40px' }}>#</th>
                  {columns.map(col => (
                    <th key={col}>{col.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      {String(idx + 1).padStart(3, '0')}
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

      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
        <span>CATALOG: {datasets[activeDataset]?.label} | LRECL=80 BLKSIZE=3120 RECFM=FB</span>
        <span>SHOWING {filteredData.length} OF {currentData.length} RECORDS</span>
      </div>

    </div>
  );
}

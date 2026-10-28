import React, { useState } from 'react';
import { X, UserPlus, HardDrive } from 'lucide-react';

export default function OnboardAccountModal({ isOpen, onClose, accounts, onSubmit }) {
  // Auto calculate next available ID
  const highestId = accounts.reduce((max, a) => {
    const num = parseInt(a.id, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 100005);
  const nextDefaultId = String(highestId + 1);

  const [id, setId] = useState(nextDefaultId);
  const [name, setName] = useState('');
  const [type, setType] = useState('SAVINGS');
  const [initialBalance, setInitialBalance] = useState('50000.00');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!id || !name) {
      alert('Account ID and Customer Name are required.');
      return;
    }
    onSubmit({
      id,
      name,
      type,
      initialBalance: Number(initialBalance || 0)
    });
    setName('');
  };

  const previewLine = `${id}|${name || 'CUSTOMER_NAME'}|${type}|${Number(initialBalance || 0).toFixed(2)}|ACTIVE`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--matrix-green-bg)',
              border: '1px solid var(--matrix-green-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={16} color="var(--matrix-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                ONBOARD CUSTOMER ACCOUNT
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                ALLOCATE TO VSAM KSDS MASTER (data/accounts.dat)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">ACCOUNT ID (VSAM 6-CHAR PRIMARY KEY)</label>
            <input
              type="text"
              className="form-control"
              value={id}
              onChange={e => setId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACCOUNT HOLDER / CUSTOMER NAME</label>
            <input
              type="text"
              placeholder="e.g. Vikramaditya Singhania"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACCOUNT TYPE</label>
            <select
              className="form-control"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="SAVINGS">SAVINGS (Retail Savings Account)</option>
              <option value="CURRENT">CURRENT (Commercial Checking Account)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">OPENING DEPOSIT BALANCE (₹ INR)</label>
            <input
              type="number"
              step="0.01"
              placeholder="50000.00"
              className="form-control"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              required
            />
          </div>

          {/* VSAM Master Format Preview */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={10} color="var(--matrix-green)" />
              VSAM KSDS PHYSICAL RECORD SERIALIZATION
            </div>
            <code style={{ color: 'var(--matrix-green)', fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {previewLine}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary">
              ALLOCATE RECORD
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

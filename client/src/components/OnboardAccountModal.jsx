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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: '18px', maxWidth: '520px', padding: '24px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-navy-pale)',
              border: '1px solid var(--brand-navy-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-navy-light)'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Onboard Customer Account
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Allocate new account into VSAM KSDS Master (data/accounts.dat)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Account ID (VSAM 6-Char Primary Key)
            </label>
            <input
              type="text"
              className="form-control"
              value={id}
              onChange={e => setId(e.target.value)}
              required
              style={{ height: '38px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Account Holder / Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vikramaditya Singhania"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ height: '38px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Account Type
            </label>
            <select
              className="form-control"
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ height: '38px' }}
            >
              <option value="SAVINGS">SAVINGS (Retail Savings Account)</option>
              <option value="CURRENT">CURRENT (Commercial Checking Account)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Opening Deposit Balance (₹ INR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="50000.00"
              className="form-control"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              required
              style={{ height: '38px' }}
            />
          </div>

          {/* VSAM Master Format Preview */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={12} color="var(--brand-navy-light)" />
              <span>VSAM KSDS Physical Record Serialization</span>
            </div>
            <code style={{ color: 'var(--brand-navy-light)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', fontWeight: 600 }}>
              {previewLine}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
              Allocate Account
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

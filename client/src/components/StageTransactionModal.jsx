import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight, Terminal } from 'lucide-react';

export default function StageTransactionModal({ 
  isOpen, 
  onClose, 
  accounts, 
  onSubmit, 
  initialAccount = '', 
  initialType = 'CREDIT' 
}) {
  const [accountId, setAccountId] = useState(initialAccount || (accounts[0]?.id || '100001'));
  const [type, setType] = useState(initialType || 'CREDIT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('SALARY');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    onSubmit({
      accountId,
      type,
      amount: Number(amount),
      description: description || 'ONLINE_BATCH_ENTRY'
    });
    setAmount('');
  };

  const selectedAcc = accounts.find(a => a.id === accountId);
  const previewAmount = amount ? Number(amount).toFixed(2) : '0.00';
  const previewLine = `TXNXXXX|${accountId}|${type}|${previewAmount}|${(description || 'ONLINE_ENTRY').toUpperCase()}`;

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
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Stage Batch Transaction
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Append new transaction to QSAM queue (data/transactions.dat)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Target Customer Account */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Target Customer Account (VSAM Key)
            </label>
            <select
              className="form-control"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              style={{ height: '38px' }}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  ACCT-{a.id} | {a.name} ({a.type}) | Avail: ₹{(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Operation Toggle */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Transaction Operation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setType('CREDIT')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: type === 'CREDIT' ? '1px solid var(--brand-teal-border)' : '1px solid var(--border-subtle)',
                  background: type === 'CREDIT' ? 'var(--brand-teal-light)' : 'var(--bg-primary)',
                  color: type === 'CREDIT' ? 'var(--emerald-success)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <ArrowDownLeft size={15} />
                <span>CREDIT (DEPOSIT)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('DEBIT')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: type === 'DEBIT' ? '1px solid var(--brand-coral-border)' : '1px solid var(--border-subtle)',
                  background: type === 'DEBIT' ? 'var(--brand-coral-light)' : 'var(--bg-primary)',
                  color: type === 'DEBIT' ? 'var(--crimson-danger)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <ArrowUpRight size={15} />
                <span>DEBIT (WITHDRAWAL)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Amount (₹ INR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 15000.00"
              className="form-control"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              style={{ height: '38px', fontSize: '14px' }}
            />
            {type === 'DEBIT' && selectedAcc && Number(amount) > selectedAcc.balance && (
              <div style={{ color: 'var(--crimson-danger)', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
                ⚠️ Exceeds current balance (₹{selectedAcc.balance.toFixed(2)}). TRANPROC will reject to Suspense Queue.
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Narration / Description
            </label>
            <input
              type="text"
              placeholder="e.g. SALARY, VENDOR_PAYMENT, UTILITY"
              className="form-control"
              value={description}
              onChange={e => setDescription(e.target.value.toUpperCase())}
              style={{ height: '38px' }}
            />
          </div>

          {/* Physical File Record Serialization Preview */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={12} color="var(--brand-navy-light)" />
              <span>Physical Record Serialization (data/transactions.dat)</span>
            </div>
            <code style={{ color: 'var(--brand-navy-light)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', fontWeight: 600 }}>
              {previewLine}
            </code>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
              Stage Transfer
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

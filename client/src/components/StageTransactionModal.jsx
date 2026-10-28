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
              <PlusCircle size={16} color="var(--matrix-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                STAGE BATCH TRANSACTION
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                APPEND RECORD TO data/transactions.dat
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
          
          {/* Target Customer Account */}
          <div className="form-group">
            <label className="form-label">TARGET CUSTOMER ACCOUNT (VSAM RECORD KEY)</label>
            <select
              className="form-control"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  ACCT-{a.id} | {a.name} ({a.type}) | AVAIL: ₹{(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div className="form-group">
            <label className="form-label">TRANSACTION OPERATION</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setType('CREDIT')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'CREDIT' ? '1px solid var(--matrix-green)' : '1px solid var(--border-subtle)',
                  background: type === 'CREDIT' ? 'var(--matrix-green-bg)' : 'transparent',
                  color: type === 'CREDIT' ? 'var(--matrix-green)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowDownLeft size={14} />
                <span>CREDIT (DEPOSIT)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('DEBIT')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'DEBIT' ? '1px solid var(--amber-warning)' : '1px solid var(--border-subtle)',
                  background: type === 'DEBIT' ? 'var(--amber-bg)' : 'transparent',
                  color: type === 'DEBIT' ? 'var(--amber-warning)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowUpRight size={14} />
                <span>DEBIT (WITHDRAWAL)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">AMOUNT (₹ INR)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 15000.00"
              className="form-control"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {type === 'DEBIT' && selectedAcc && Number(amount) > selectedAcc.balance && (
              <div style={{ color: 'var(--crimson-danger)', fontSize: '10px', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                [!] EXCEEDS BALANCE (₹{selectedAcc.balance.toFixed(2)}). COBOL TRANPROC WILL REJECT TO EXCEPTION SUSPENSE.
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">NARRATION / DESCRIPTION</label>
            <input
              type="text"
              placeholder="e.g. SALARY, VENDOR_PAYMENT, UTILITY"
              className="form-control"
              value={description}
              onChange={e => setDescription(e.target.value.toUpperCase())}
            />
          </div>

          {/* Mainframe File Preview */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={10} color="var(--matrix-green)" />
              PHYSICAL RECORD SERIALIZATION (transactions.dat)
            </div>
            <code style={{ color: 'var(--matrix-green)', fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {previewLine}
            </code>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-mainframe">
              STAGE INTO QUEUE
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

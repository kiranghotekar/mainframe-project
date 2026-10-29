import React from 'react';
import { Play, RotateCcw, PlusCircle, UserPlus, Cpu, Server, Activity, Sun, Moon, Database } from 'lucide-react';

export default function Header({ 
  telemetry, 
  onRunBatch, 
  onReset, 
  onGenerate10k,
  onOpenTxnModal, 
  onOpenAccModal, 
  isProcessing,
  theme = 'dark',
  onToggleTheme
}) {
  const jobClass = telemetry?.jobClass || 'CLASS A';
  const lastRC = telemetry?.metrics?.lastReturnCode || 'RC = 0000';

  return (
    <header className="glass-panel" style={{ margin: '16px 24px 12px 24px', padding: '14px 20px', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo and Mainframe System Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--matrix-green-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Server size={22} color="var(--matrix-green)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                IBM z/FinCore
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                z/OS JES2 V2R5
              </span>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                COBOL TRANPROC
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              HIGH-VOLUME BATCH TRANSACTION PROCESSING & VSAM / DB2 CORE ENGINE
            </p>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Cpu size={14} color="var(--matrix-green)" />
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>CPU SUBSYSTEM</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{jobClass} / SYSDA</div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={14} color="var(--matrix-green)" />
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>RETURN CODE</div>
              <div style={{ color: 'var(--matrix-green)', fontWeight: 700 }}>
                {lastRC.startsWith('RC') ? lastRC : `RC = ${lastRC}`}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Theme Switcher Button */}
          <button
            className="btn btn-secondary"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Matrix Theme'}
            style={{ padding: '8px 12px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} color="#f59e0b" />
                <span>WHITE THEME</span>
              </>
            ) : (
              <>
                <Moon size={13} color="var(--matrix-green)" />
                <span>DARK THEME</span>
              </>
            )}
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onOpenAccModal}
            title="Onboard a new customer account to VSAM Master"
          >
            <UserPlus size={14} />
            <span>+ New Account</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onOpenTxnModal}
            title="Stage a new transaction into transactions.dat"
          >
            <PlusCircle size={14} />
            <span>+ Stage TXN</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onGenerate10k}
            disabled={isProcessing}
            title="Provision high-volume enterprise dataset (500 Accounts, 10,000 Transactions)"
            style={{ borderColor: 'var(--matrix-green-border)', color: 'var(--matrix-green)' }}
          >
            <Database size={13} color="var(--matrix-green)" />
            <span>10K DATASET</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onReset}
            title="Reset accounts and transactions to clean baseline demo data"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button 
            className="btn btn-mainframe"
            onClick={onRunBatch}
            disabled={isProcessing}
            style={{ 
              opacity: isProcessing ? 0.7 : 1,
              animation: isProcessing ? 'pulseGlow 1.2s infinite' : 'none'
            }}
          >
            <Play size={14} fill="currentColor" />
            <span>{isProcessing ? 'EXECUTING JCL...' : 'SUBMIT BATCH (JCL)'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}

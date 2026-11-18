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
    <header className="glass-panel" style={{ 
      margin: '16px 24px 12px 24px', 
      padding: '14px 22px', 
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo and Mainframe System Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-header)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(26, 43, 107, 0.25)',
            color: '#FFFFFF'
          }}>
            <Server size={22} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                IBM z/FinCore
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                z/OS JES2 V2R5
              </span>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                COBOL TRANPROC
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-ui)', fontWeight: 500, marginTop: '2px' }}>
              ENTERPRISE BATCH CLEARING & VSAM / DB2 CORE BANKING ENGINE
            </p>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Cpu size={14} color="var(--brand-navy-light)" />
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-ui)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>CPU SUBSYSTEM</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{jobClass} / SYSDA</div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={14} color="var(--brand-teal)" />
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-ui)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>RETURN CODE</div>
              <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
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
            title={theme === 'dark' ? 'Switch to Net Banking Light Theme' : 'Switch to Midnight Navy Dark Mode'}
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} color="#f59e0b" />
                <span>LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon size={13} color="var(--brand-navy-mid)" />
                <span>DARK MODE</span>
              </>
            )}
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onOpenAccModal}
            title="Onboard a new customer account to VSAM Master"
            style={{ fontSize: '12px' }}
          >
            <UserPlus size={14} />
            <span>+ New Account</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onOpenTxnModal}
            title="Stage a new transaction into transactions.dat"
            style={{ fontSize: '12px' }}
          >
            <PlusCircle size={14} />
            <span>+ Stage TXN</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onGenerate10k}
            disabled={isProcessing}
            title="Provision high-volume enterprise dataset (500 Accounts, 10,000 Transactions)"
            style={{ 
              background: 'var(--brand-gold-bg)',
              borderColor: 'rgba(201, 147, 58, 0.35)', 
              color: 'var(--brand-gold)',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            <Database size={13} color="var(--brand-gold)" />
            <span>10K DATASET</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onReset}
            title="Reset accounts and transactions to clean baseline demo data"
            style={{ fontSize: '12px' }}
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
              animation: isProcessing ? 'pulseGlow 1.2s infinite' : 'none',
              fontSize: '12px',
              padding: '8px 16px'
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

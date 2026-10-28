import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, AlertTriangle, Clock, FileText, Copy, ChevronDown, ChevronUp, Zap, Check } from 'lucide-react';

export default function JesSpoolView({ batchResult, onRunBatch, isProcessing }) {
  const [expandedJobs, setExpandedJobs] = useState({ 0: true });
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [batchResult]);

  const toggleJob = (idx) => {
    setExpandedJobs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!batchResult) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '560px', margin: '0 auto', padding: '36px 28px', borderRadius: 'var(--radius-lg)' }}>
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
            <Terminal size={24} color="var(--matrix-green)" />
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            JES2 BATCH JOB CONSOLE // TRANPROC
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '24px', lineHeight: 1.6 }}>
            NO BATCH JOB EXECUTION REGISTERED ON JES2 SPOOL QUEUE.
            SUBMIT JCL JOB CARD //BATCHJOB TO EXECUTE THE COBOL TRANSACTION ENGINE ACROSS
            STAGED QSAM RECORDS AND UPDATE VSAM ACCT.MASTER.
          </p>
          <button
            className="btn btn-mainframe"
            onClick={onRunBatch}
            disabled={isProcessing}
            style={{ fontSize: '11px', padding: '10px 20px' }}
          >
            <Play size={14} fill="currentColor" />
            <span>{isProcessing ? 'SUBMITTING TO SPOOL...' : '//BATCHJOB EXEC PGM=TRANPROC'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Normalize batchResult structure to support both backend shapes
  const summary = batchResult.summary || {
    processed: batchResult.successCount ?? (batchResult.totalTransactions ? (batchResult.totalTransactions - (batchResult.errorCount || 0)) : 0),
    rejected: batchResult.errorCount ?? 0,
    total: batchResult.totalTransactions ?? ((batchResult.successCount || 0) + (batchResult.errorCount || 0))
  };

  const rawJesOutput = batchResult.jesOutput || (Array.isArray(batchResult.jesLogs) ? batchResult.jesLogs.join('\n') : (typeof batchResult.jesLogs === 'string' ? batchResult.jesLogs : ''));

  const stepResults = batchResult.stepResults || [
    {
      step: 'STEP01',
      name: 'STEP01',
      program: 'TRANPROC',
      rc: (batchResult.errorCount > 0 ? 4 : (batchResult.returnCode || 0)),
      output: rawJesOutput
    }
  ];

  const jesOutput = rawJesOutput;

  const syslog = batchResult.syslog || [
    { timestamp: '14:20:01', level: 'INFO', message: '$HASP100 BATCHJOB ON INTRDR' },
    { timestamp: '14:20:02', level: 'INFO', message: '$HASP373 BATCHJOB STARTED - INIT 1 - CLASS A - SYS 1' },
    { timestamp: '14:20:02', level: 'INFO', message: '+IEF403I BATCHJOB - STARTED - COBOL TRANPROC ENCLAVE ATTACHED' },
    { timestamp: '14:20:03', level: (batchResult.errorCount > 0 ? 'WARN' : 'INFO'), message: `+IEF404I BATCHJOB - ENDED - RC=000${batchResult.errorCount > 0 ? 4 : 0}` },
    { timestamp: '14:20:04', level: 'INFO', message: `$HASP395 BATCHJOB ENDED - MAXCC=${batchResult.errorCount > 0 ? '0004' : '0000'}` }
  ];

  return (
    <div style={{ padding: '0 24px 24px' }}>

      {/* Job Summary Header */}
      <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <Terminal size={16} color="var(--matrix-green)" />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
                JES2 SPOOL OUTPUT // SYS1.HASPACE
              </h2>
              <span className={`badge ${summary.rejected > 0 ? 'badge-warning' : 'badge-success'}`}>
                {summary.rejected > 0 ? 'JOB COMPLETED (RC=0004)' : 'JOB COMPLETED (RC=0000)'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              JOBNAME=BATCHJOB | JOBID=JOB04821 | CLASS=A | PRTY=15 | MAXCC={summary?.rejected > 0 ? '0004' : '0000'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CLEARED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--matrix-green)' }}>
                {summary.processed || 0}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SUSPENDED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: summary.rejected > 0 ? 'var(--crimson-danger)' : 'var(--text-muted)' }}>
                {summary.rejected || 0}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>TOTAL READ</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {summary.total || 0}
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={onRunBatch}
              disabled={isProcessing}
              style={{ fontSize: '10px', padding: '6px 12px' }}
            >
              <Play size={12} />
              <span>RE-RUN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Results */}
      {stepResults && stepResults.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap size={13} color="var(--matrix-green)" />
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              JCL STEP EXECUTION CODES
            </span>
          </div>
          <div style={{ display: 'grid', gap: '6px' }}>
            {stepResults.map((step, idx) => (
              <div key={idx} className="glass-panel" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleJob(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', cursor: 'pointer',
                    background: step.rc === 0
                      ? 'rgba(22, 163, 74, 0.04)'
                      : step.rc <= 4
                        ? 'rgba(217, 119, 6, 0.04)'
                        : 'rgba(220, 38, 38, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {step.rc === 0 ? (
                      <CheckCircle2 size={14} color="var(--matrix-green)" />
                    ) : (
                      <AlertTriangle size={14} color={step.rc <= 4 ? 'var(--amber-warning)' : 'var(--crimson-danger)'} />
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11px', color: 'var(--text-primary)' }}>
                      STEP: {step.step || step.name || `STEP0${idx + 1}`}
                    </span>
                    <span className={`badge ${step.rc === 0 ? 'badge-success' : step.rc <= 4 ? 'badge-warning' : 'badge-danger'}`}
                      style={{ fontSize: '9px', padding: '1px 5px' }}>
                      RC={String(step.rc).padStart(4, '0')}
                    </span>
                    {step.program && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                        PGM={step.program}
                      </span>
                    )}
                  </div>
                  {expandedJobs[idx] ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>
                {expandedJobs[idx] && step.output && (
                  <div className="terminal-screen" style={{ margin: '0 8px 8px 8px', padding: '10px', fontSize: '11px' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono)' }}>{step.output}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JES Spool / SYSOUT Terminal */}
      {jesOutput && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} color="var(--matrix-green)" />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SYSOUT DD * (IBM 3270 TERMINAL STREAM)
              </span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '4px 8px' }} onClick={() => copyToClipboard(jesOutput)}>
              {copied ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY STREAM</>}
            </button>
          </div>
          <div ref={terminalRef} className="terminal-screen" style={{ padding: '14px 16px', maxHeight: '380px', overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6 }}>
              {jesOutput}
            </pre>
            <div style={{ marginTop: '8px' }}>
              <span className="terminal-cursor" />
            </div>
          </div>
        </div>
      )}

      {/* SYSLOG */}
      {syslog && syslog.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Clock size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              z/OS MASTER CONSOLE SYSLOG
            </span>
          </div>
          <div className="terminal-screen" style={{ padding: '12px 14px', maxHeight: '200px', overflow: 'auto' }}>
            {syslog.map((entry, i) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-muted)' }}>[{entry.timestamp || 'SYSLOG'}]</span>{' '}
                <span style={{ color: entry.level === 'ERROR' ? 'var(--crimson-danger)' : entry.level === 'WARN' ? 'var(--amber-warning)' : 'var(--matrix-green)' }}>
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

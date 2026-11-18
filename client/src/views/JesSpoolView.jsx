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
      <div style={{ padding: '40px 30px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 32px', borderRadius: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--brand-navy-pale)',
            border: '1px solid var(--brand-navy-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--brand-navy-light)'
          }}>
            <Terminal size={26} />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            JES2 Batch Spool Console
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
            No batch job execution is currently queued in the JES2 spool queue.
            Submit JCL Job Card //BATCHJOB to execute COBOL TRANPROC across staged QSAM transactions and update the VSAM Master.
          </p>
          <button
            className="btn btn-mainframe"
            onClick={onRunBatch}
            disabled={isProcessing}
            style={{ fontSize: '12px', padding: '10px 22px' }}
          >
            <Play size={14} fill="currentColor" />
            <span>{isProcessing ? 'Submitting to Spool...' : 'Execute //BATCHJOB EXEC PGM=TRANPROC'}</span>
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
    <div style={{ padding: '26px 30px' }}>

      {/* Job Summary Header */}
      <div className="glass-panel" style={{ padding: '18px 22px', borderRadius: '14px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Terminal size={17} color="var(--brand-navy-light)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                JES2 Spool Output Queue
              </h2>
              <span className={`badge ${summary.rejected > 0 ? 'badge-warning' : 'badge-success'}`}>
                {summary.rejected > 0 ? 'JOB COMPLETED (RC=0004)' : 'JOB COMPLETED (RC=0000)'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              JOBNAME=BATCHJOB | CLASS=A | PRTY=15 | MAXCC={summary?.rejected > 0 ? '0004' : '0000'} | SYSTEM=SYS1
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CLEARED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-success)' }}>
                {summary.processed || 0}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>SUSPENDED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: summary.rejected > 0 ? 'var(--crimson-danger)' : 'var(--text-muted)' }}>
                {summary.rejected || 0}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>TOTAL READ</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {summary.total || 0}
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={onRunBatch}
              disabled={isProcessing}
              style={{ fontSize: '11px', padding: '8px 14px' }}
            >
              <Play size={12} />
              <span>RE-RUN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Results */}
      {stepResults && stepResults.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap size={14} color="var(--brand-navy-light)" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              JCL Step Execution Results
            </span>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {stepResults.map((step, idx) => (
              <div key={idx} className="glass-panel" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleJob(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', cursor: 'pointer',
                    background: step.rc === 0
                      ? 'var(--brand-teal-light)'
                      : step.rc <= 4
                        ? 'var(--brand-amber-light)'
                        : 'var(--brand-coral-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {step.rc === 0 ? (
                      <CheckCircle2 size={16} color="var(--emerald-success)" />
                    ) : (
                      <AlertTriangle size={16} color={step.rc <= 4 ? 'var(--amber-warning)' : 'var(--crimson-danger)'} />
                    )}
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      STEP: {step.step || step.name || `STEP0${idx + 1}`}
                    </span>
                    <span className={`badge ${step.rc === 0 ? 'badge-success' : step.rc <= 4 ? 'badge-warning' : 'badge-danger'}`}
                      style={{ fontSize: '10px', padding: '2px 7px' }}>
                      RC={String(step.rc).padStart(4, '0')}
                    </span>
                    {step.program && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        PGM={step.program}
                      </span>
                    )}
                  </div>
                  {expandedJobs[idx] ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
                {expandedJobs[idx] && step.output && (
                  <div className="terminal-screen" style={{ margin: '0 8px 8px 8px', padding: '12px', fontSize: '11px', borderRadius: '8px' }}>
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
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="var(--emerald-success)" />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                SYSOUT DD * (IBM 3270 Terminal Output)
              </span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={() => copyToClipboard(jesOutput)}>
              {copied ? <><Check size={11} color="var(--emerald-success)" /> COPIED</> : <><Copy size={11} /> COPY STREAM</>}
            </button>
          </div>
          <div ref={terminalRef} className="terminal-screen" style={{ padding: '16px 18px', maxHeight: '380px', overflow: 'auto', borderRadius: '12px' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, color: 'var(--terminal-green)' }}>
              {jesOutput}
            </pre>
          </div>
        </div>
      )}

      {/* SYSLOG */}
      {syslog && syslog.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Clock size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              z/OS Master Console Log (SYSLOG)
            </span>
          </div>
          <div className="terminal-screen" style={{ padding: '14px 16px', maxHeight: '200px', overflow: 'auto', borderRadius: '12px' }}>
            {syslog.map((entry, i) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-muted)' }}>[{entry.timestamp || 'SYSLOG'}]</span>{' '}
                <span style={{ color: entry.level === 'ERROR' ? 'var(--crimson-danger)' : entry.level === 'WARN' ? 'var(--amber-warning)' : 'var(--emerald-success)' }}>
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

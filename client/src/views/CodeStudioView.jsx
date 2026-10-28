import React, { useState } from 'react';
import { Code2, Terminal, FileCode2, Copy, Check } from 'lucide-react';

const COBOL_SOURCE = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. TRANPROC.
       AUTHOR. ENTERPRISE-BANKING-TEAM.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT TRANS-FILE ASSIGN TO TRANSIN
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-TRANS-STATUS.
           SELECT ACCT-FILE ASSIGN TO ACCTMAST
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS ACCT-KEY
               FILE STATUS IS WS-ACCT-STATUS.
           SELECT EXCEPT-FILE ASSIGN TO EXCEPTFL
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-EXCEPT-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD TRANS-FILE.
       01 TRANS-RECORD.
           05 TR-ACCOUNT-ID    PIC X(6).
           05 TR-TYPE           PIC X(6).
           05 TR-AMOUNT         PIC 9(10).
           05 TR-DESCRIPTION    PIC X(30).

       FD ACCT-FILE.
       01 ACCT-RECORD.
           05 ACCT-KEY          PIC X(6).
           05 ACCT-NAME         PIC X(20).
           05 ACCT-BALANCE      PIC S9(12) COMP-3.
           05 ACCT-STATUS       PIC X(8).

       FD EXCEPT-FILE.
       01 EXCEPT-RECORD.
           05 EX-ACCOUNT-ID    PIC X(6).
           05 EX-TYPE           PIC X(6).
           05 EX-AMOUNT         PIC 9(10).
           05 EX-REASON         PIC X(25).
           05 EX-DESCRIPTION    PIC X(30).

       WORKING-STORAGE SECTION.
       01 WS-FLAGS.
           05 WS-TRANS-STATUS   PIC XX.
           05 WS-ACCT-STATUS    PIC XX.
           05 WS-EXCEPT-STATUS  PIC XX.
           05 WS-EOF-FLAG       PIC X VALUE 'N'.

       01 WS-COUNTERS.
           05 WS-TOTAL-READ     PIC 9(6) VALUE 0.
           05 WS-TOTAL-PROC     PIC 9(6) VALUE 0.
           05 WS-TOTAL-REJECT   PIC 9(6) VALUE 0.

       PROCEDURE DIVISION.
       0000-MAIN.
           PERFORM 1000-INIT
           PERFORM 2000-PROCESS UNTIL WS-EOF-FLAG = 'Y'
           PERFORM 3000-CLEANUP
           STOP RUN.

       1000-INIT.
           OPEN INPUT  TRANS-FILE
           OPEN I-O    ACCT-FILE
           OPEN OUTPUT EXCEPT-FILE
           READ TRANS-FILE
               AT END SET WS-EOF-FLAG TO 'Y'
           END-READ.

       2000-PROCESS.
           ADD 1 TO WS-TOTAL-READ
           MOVE TR-ACCOUNT-ID TO ACCT-KEY
           READ ACCT-FILE
               INVALID KEY
                   PERFORM 2100-REJECT-NO-ACCOUNT
               NOT INVALID KEY
                   PERFORM 2200-APPLY-TRANSACTION
           END-READ
           READ TRANS-FILE
               AT END SET WS-EOF-FLAG TO 'Y'
           END-READ.

       2100-REJECT-NO-ACCOUNT.
           MOVE TR-ACCOUNT-ID  TO EX-ACCOUNT-ID
           MOVE TR-TYPE         TO EX-TYPE
           MOVE TR-AMOUNT       TO EX-AMOUNT
           MOVE 'ACCOUNT_NOT_FOUND' TO EX-REASON
           MOVE TR-DESCRIPTION  TO EX-DESCRIPTION
           WRITE EXCEPT-RECORD
           ADD 1 TO WS-TOTAL-REJECT.

       2200-APPLY-TRANSACTION.
           EVALUATE TR-TYPE
               WHEN 'CREDIT'
                   ADD TR-AMOUNT TO ACCT-BALANCE
                   REWRITE ACCT-RECORD
                   ADD 1 TO WS-TOTAL-PROC
               WHEN 'DEBIT '
                   IF TR-AMOUNT > ACCT-BALANCE
                       PERFORM 2100-REJECT-INSUFFICIENT
                   ELSE
                       SUBTRACT TR-AMOUNT FROM ACCT-BALANCE
                       REWRITE ACCT-RECORD
                       ADD 1 TO WS-TOTAL-PROC
                   END-IF
               WHEN OTHER
                   PERFORM 2100-REJECT-INVALID-TYPE
           END-EVALUATE.

       2100-REJECT-INSUFFICIENT.
           MOVE TR-ACCOUNT-ID  TO EX-ACCOUNT-ID
           MOVE TR-TYPE         TO EX-TYPE
           MOVE TR-AMOUNT       TO EX-AMOUNT
           MOVE 'INSUFFICIENT_FUNDS' TO EX-REASON
           MOVE TR-DESCRIPTION  TO EX-DESCRIPTION
           WRITE EXCEPT-RECORD
           ADD 1 TO WS-TOTAL-REJECT.

       2100-REJECT-INVALID-TYPE.
           MOVE TR-ACCOUNT-ID  TO EX-ACCOUNT-ID
           MOVE TR-TYPE         TO EX-TYPE
           MOVE TR-AMOUNT       TO EX-AMOUNT
           MOVE 'INVALID_TRAN_TYPE' TO EX-REASON
           MOVE TR-DESCRIPTION  TO EX-DESCRIPTION
           WRITE EXCEPT-RECORD
           ADD 1 TO WS-TOTAL-REJECT.

       3000-CLEANUP.
           CLOSE TRANS-FILE
           CLOSE ACCT-FILE
           CLOSE EXCEPT-FILE
           DISPLAY 'TRANPROC COMPLETE: '
               WS-TOTAL-READ ' READ, '
               WS-TOTAL-PROC ' PROCESSED, '
               WS-TOTAL-REJECT ' REJECTED'.`;

const JCL_SOURCE = `//BATCHJOB JOB (ACCT),'BATCH TXN',CLASS=A,
//         MSGCLASS=H,MSGLEVEL=(1,1),NOTIFY=&SYSUID
//*
//* ============================================
//* HIGH-VOLUME BATCH TRANSACTION PROCESSING
//* ============================================
//*
//STEP01   EXEC PGM=TRANPROC
//TRANSIN  DD DSN=PROD.TRANS.PENDING,DISP=SHR
//ACCTMAST DD DSN=PROD.ACCT.MASTER,DISP=SHR
//EXCEPTFL DD DSN=PROD.EXCEPT.SUSPENSE,
//            DISP=(NEW,CATLG,DELETE),
//            SPACE=(CYL,(5,2),RLSE),
//            DCB=(RECFM=FB,LRECL=77,BLKSIZE=0)
//SYSOUT   DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//*
//STEP02   EXEC PGM=RECONCL
//ACCTMAST DD DSN=PROD.ACCT.MASTER,DISP=SHR
//PROCLOG  DD DSN=PROD.TRANS.PROCESSED,DISP=SHR
//EXCEPTFL DD DSN=PROD.EXCEPT.SUSPENSE,DISP=SHR
//RPTOUT   DD SYSOUT=*
//SYSOUT   DD SYSOUT=*`;

export default function CodeStudioView() {
  const [activeFile, setActiveFile] = useState('cobol');
  const [copied, setCopied] = useState(false);

  const files = {
    cobol: { label: 'TRANPROC.cbl', lang: 'COBOL', source: COBOL_SOURCE, icon: FileCode2 },
    jcl: { label: 'BATCHJOB.jcl', lang: 'JCL', source: JCL_SOURCE, icon: Terminal }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '0 24px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={16} color="var(--matrix-green)" />
          <h2 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            MAINFRAME CODE STUDIO // COBOL TRANPROC & JCL
          </h2>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
          SOURCE VALIDATED
        </span>
      </div>

      <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        
        {/* File Tabs & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', padding: '8px 12px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(files).map(([key, file]) => {
              const Icon = file.icon;
              const isActive = activeFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFile(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--matrix-green-bg)' : 'transparent',
                    border: isActive ? '1px solid var(--matrix-green-border)' : '1px solid transparent',
                    color: isActive ? 'var(--matrix-green)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={12} />
                  <span>{file.label}</span>
                </button>
              );
            })}
          </div>

          <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={handleCopy}>
            {copied ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY SOURCE</>}
          </button>
        </div>

        {/* Source Code Display */}
        <div className="terminal-screen" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
          <pre style={{
            padding: '16px',
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.6,
            overflowX: 'auto',
            maxHeight: '68vh',
            whiteSpace: 'pre'
          }}>
            {files[activeFile].source.split('\n').map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'rgba(45, 181, 138, 0.35)', userSelect: 'none', minWidth: '36px', textAlign: 'right' }}>
                  {String(i + 1).padStart(4, '0')}
                </span>
                <span style={{ color: line.startsWith('*') || line.startsWith('//*') ? 'var(--text-muted)' : 'var(--terminal-green)' }}>
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>

      </div>
    </div>
  );
}

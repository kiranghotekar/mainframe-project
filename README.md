# IBM z/FinCore - High-Volume Batch Transaction Processing & Banking System

## Overview
Enterprise Mainframe-oriented core banking system designed for processing high-volume financial transactions, validating business rules, updating VSAM account balances, handling exception suspense files, and generating financial audit reconciliation reports.

Includes a **Dedicated Modern Banking & Mainframe Operations Web Application** powered by **Express.js** and **React + Vite**, seamlessly integrating with the **COBOL runtime** and **JCL batch orchestration**.

---

## Architecture
```
Input Transactions (QSAM) ──► JCL (//BATCHJOB) ──► COBOL (TRANPROC.cbl)
                                                        │
          ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
          ▼                                             ▼                                             ▼
VSAM Account Master (KSDS)                     IBM DB2 Relational Layer                      Audit Reports & Spool
(data/accounts.dat)                           (batch_transaction_db)                         (reports/*.txt, JES2)
          ▲                                             ▲                                             ▲
          └─────────────────────────────────────────────┼─────────────────────────────────────────────┘
                                                        │
                                    Express Gateway API (server/)
                                                        │
                              React Dedicated Banking Portal (client/)
```

---

## Technology Stack
- **COBOL 85 (`cobol/TRANPROC.cbl`)** - Batch transaction processor, credit/debit validation, and balance arithmetic
- **JCL (`jcl/BATCHJOB.jcl`)** - Mainframe batch job card stream, step execution (`PGM=TRANPROC`), and DD dataset allocations
- **VSAM KSDS (`data/accounts.dat`)** - Key-Sequenced Data Set indexed account master by `ACCOUNT_ID`
- **IBM DB2 (`reports/db2_integration_design.txt`)** - Relational database layer with `account_balance_summary` view
- **Express.js API Gateway (`server/index.js`)** - Enterprise REST middleware simulating z/OS Connect & CICS Web Interface
- **React 19 + Vite (`client/`)** - Modern dedicated banking frontend with IBM 3270 green-screen JES2 spool terminal
- **Bash Wrapper (`jcl/run_batch.sh`)** - Terminal-based batch execution script

---

## Key Features in the Dedicated Banking Application

1. **Core Banking Dashboard**:
   - Master account cards (Debit card styling with EMV chip, balance in ₹ INR, account type).
   - Real-time transaction queue feed with live status badges.
   - Quick deposit/withdrawal and transaction staging.
   - Customer onboarding directly into the VSAM master.

2. **JES2 Spool & Batch Runner (3270 Terminal)**:
   - Authentic IBM 3270 green phosphor CRT display with scanline effects and blinking cursor.
   - Interactive JCL Job Submitter (`//STEP01 EXEC PGM=TRANPROC`).
   - Live step progression and return code badge (`RC = 0000`).

3. **VSAM KSDS & DB2 Database Console**:
   - Key-Sequenced Dataset index inspector (`RECORD_KEY = ACCOUNT_ID`).
   - Interactive DB2 SQL Querying Console (execute `SELECT * FROM account_balance_summary;`).

4. **Exception Suspense Desk**:
   - Real-time tracking of failed transactions (`TXN0008` debit of ₹2,00,000.00 rejected for insufficient funds).
   - Balance protection audit and one-click "Fund Account & Re-stage" action.

5. **Reconciliation & Financial Audit Desk**:
   - Mathematical balancing verification:
     $$\text{Opening (₹3,65,000.00)} + \text{Credits (₹62,000.00)} - \text{Debits (₹58,000.00)} = \text{Closing (₹3,69,000.00)}$$
   - Zero-variance audit proof with celebration confetti.
   - Built-in viewer and downloader for all report files.

6. **COBOL & JCL Code Studio**:
   - Built-in ISPF / 3270 source code editor with line numbers and division guides.
   - Save modifications directly back to `cobol/TRANPROC.cbl` and `jcl/BATCHJOB.jcl`.
   - Comprehensive viva presentation guide for examination reviews.

---

## Running the Application

### Option A: Dedicated Full-Stack Web Application (Recommended for Presentation)
```bash
# Start both Express Gateway API (Port 5000) and React Banking Frontend (Port 3000 / 3001)
npm run dev
```
Open **`http://localhost:3000/`** (or `http://localhost:3001/`) in your browser.

### Option B: Terminal-Based Batch Execution (Original CLI Mode)
```bash
# Run the local batch execution wrapper
./jcl/run_batch.sh

# Or compile COBOL manually with GnuCOBOL
cobc -x -free cobol/TRANPROC.cbl -o TRANPROC
./TRANPROC
```

---

## Mainframe Mapping Summary

| Local Project Component | Enterprise IBM Mainframe (z/OS) Equivalent |
|---|---|
| `jcl/BATCHJOB.jcl` | Production JCL Job Stream (`//BATCHJOB JOB...`) |
| `cobol/TRANPROC.cbl` | Compiled Enterprise COBOL Batch Program (`USER.LOADLIB`) |
| `data/accounts.dat` | VSAM KSDS (Key-Sequenced Data Set) Master File |
| `data/transactions.dat` | Sequential QSAM Transaction Queue (`//TRANIN DD`) |
| `data/processed.dat` | Cleared Ledger Dataset (`//PROCED DD`) |
| `data/exceptions.dat` | Suspense Exception Dataset (`//EXCEPT DD`) |
| `server/index.js` | IBM z/OS Connect Enterprise REST Gateway |
| `client/` | Modern Digital Banking Operations & JES2 3270 Terminal |
| `reports/*.txt` | SYSOUT / Sequential Report Datasets |

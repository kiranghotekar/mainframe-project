import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const COBOL_DIR = path.join(ROOT_DIR, 'cobol');
const JCL_DIR = path.join(ROOT_DIR, 'jcl');

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.dat');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.dat');
const PROCESSED_FILE = path.join(DATA_DIR, 'processed.dat');
const EXCEPTIONS_FILE = path.join(DATA_DIR, 'exceptions.dat');
const COBOL_FILE = path.join(COBOL_DIR, 'TRANPROC.cbl');
const JCL_FILE = path.join(JCL_DIR, 'BATCHJOB.jcl');

// Baseline demo data to allow clean state resets during presentation
export const BASELINE_ACCOUNTS = [
  { id: '100001', name: 'Aarav Sharma', type: 'SAVINGS', balance: 50000.00, status: 'ACTIVE' },
  { id: '100002', name: 'Riya Patel', type: 'SAVINGS', balance: 75000.00, status: 'ACTIVE' },
  { id: '100003', name: 'Kabir Mehta', type: 'CURRENT', balance: 120000.00, status: 'ACTIVE' },
  { id: '100004', name: 'Ananya Shah', type: 'SAVINGS', balance: 25000.00, status: 'ACTIVE' },
  { id: '100005', name: 'Vikram Joshi', type: 'CURRENT', balance: 95000.00, status: 'ACTIVE' },
];

export const BASELINE_TRANSACTIONS = [
  { id: 'TXN0001', accountId: '100001', type: 'CREDIT', amount: 15000.00, description: 'SALARY' },
  { id: 'TXN0002', accountId: '100002', type: 'DEBIT', amount: 5000.00, description: 'UTILITY' },
  { id: 'TXN0003', accountId: '100003', type: 'DEBIT', amount: 25000.00, description: 'SUPPLIER' },
  { id: 'TXN0004', accountId: '100004', type: 'CREDIT', amount: 10000.00, description: 'REFUND' },
  { id: 'TXN0005', accountId: '100005', type: 'DEBIT', amount: 15000.00, description: 'PURCHASE' },
  { id: 'TXN0006', accountId: '100001', type: 'DEBIT', amount: 3000.00, description: 'ATM' },
  { id: 'TXN0007', accountId: '100002', type: 'CREDIT', amount: 12000.00, description: 'TRANSFER' },
  { id: 'TXN0008', accountId: '100003', type: 'DEBIT', amount: 200000.00, description: 'PAYMENT' },
  { id: 'TXN0009', accountId: '100004', type: 'DEBIT', amount: 2000.00, description: 'ATM' },
  { id: 'TXN0010', accountId: '100005', type: 'CREDIT', amount: 25000.00, description: 'BONUS' },
  { id: 'TXN0011', accountId: '100001', type: 'DEBIT', amount: 4500.00, description: 'GROCERY' },
  { id: 'TXN0012', accountId: '100002', type: 'DEBIT', amount: 3500.00, description: 'INTERNET' },
];

/**
 * Reads and parses accounts.dat (VSAM KSDS Account Master)
 */
export function getAccounts() {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    const parts = line.split('|');
    return {
      id: (parts[0] || '').trim(),
      name: (parts[1] || '').trim(),
      type: (parts[2] || '').trim(),
      balance: parseFloat((parts[3] || '0').trim()),
      status: (parts[4] || 'ACTIVE').trim(),
      rawLine: line
    };
  });
}

/**
 * Reads and parses transactions.dat (Sequential QSAM transaction queue)
 */
export function getTransactions() {
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  return lines.map(line => {
    const parts = line.split('|');
    return {
      id: (parts[0] || '').trim(),
      accountId: (parts[1] || '').trim(),
      type: (parts[2] || '').trim(),
      amount: parseFloat((parts[3] || '0').trim()),
      description: (parts[4] || '').trim(),
      rawLine: line
    };
  });
}

/**
 * Reads and parses processed.dat
 */
export function getProcessedTransactions() {
  if (!fs.existsSync(PROCESSED_FILE)) {
    return [];
  }
  const content = fs.readFileSync(PROCESSED_FILE, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  return lines.map(line => {
    const parts = line.split('|');
    const rawAmt = (parts[3] || '0').trim();
    // Parse COBOL 9(10)V99 formatted as 12 digits (e.g. 000001500000 = 15000.00)
    let parsedAmount = parseFloat(rawAmt);
    if (!rawAmt.includes('.') && rawAmt.length >= 2) {
      parsedAmount = parseFloat(rawAmt) / 100;
    }
    return {
      id: (parts[0] || '').trim(),
      accountId: (parts[1] || '').trim(),
      type: (parts[2] || '').trim(),
      amount: parsedAmount,
      rawAmount: rawAmt,
      status: (parts[4] || 'SUCCESS').trim()
    };
  });
}

/**
 * Reads and parses exceptions.dat
 */
export function getExceptions() {
  if (!fs.existsSync(EXCEPTIONS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(EXCEPTIONS_FILE, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  return lines.map(line => {
    const parts = line.split('|');
    const rawAmt = (parts[3] || '0').trim();
    let parsedAmount = parseFloat(rawAmt);
    if (!rawAmt.includes('.') && rawAmt.length >= 2) {
      parsedAmount = parseFloat(rawAmt) / 100;
    }
    return {
      id: (parts[0] || '').trim(),
      accountId: (parts[1] || '').trim(),
      type: (parts[2] || '').trim(),
      amount: parsedAmount,
      rawAmount: rawAmt,
      reason: (parts[4] || 'UNKNOWN EXCEPTION').trim()
    };
  });
}

/**
 * Appends a new transaction to transactions.dat
 */
export function stageTransaction({ accountId, type, amount, description }) {
  const current = getTransactions();
  const nextNum = current.length + 1;
  const id = `TXN${String(nextNum).padStart(4, '0')}`;
  const amtFormatted = Number(amount).toFixed(2);
  const line = `${id}|${accountId}|${type.toUpperCase()}|${amtFormatted}|${(description || 'ONLINE_ENTRY').toUpperCase()}`;
  
  fs.appendFileSync(TRANSACTIONS_FILE, (fs.readFileSync(TRANSACTIONS_FILE, 'utf-8').endsWith('\n') ? '' : '\n') + line + '\n');
  return { id, accountId, type: type.toUpperCase(), amount: Number(amtFormatted), description: (description || 'ONLINE_ENTRY').toUpperCase() };
}

/**
 * Creates and appends a new account to accounts.dat
 */
export function createAccount({ id, name, type, initialBalance }) {
  const accounts = getAccounts();
  const exists = accounts.find(a => a.id === id);
  if (exists) {
    throw new Error(`Account ID ${id} already exists in VSAM Master!`);
  }
  const balFormatted = Number(initialBalance || 0).toFixed(2);
  const line = `${id}|${name}|${(type || 'SAVINGS').toUpperCase()}|${balFormatted}|ACTIVE`;
  
  fs.appendFileSync(ACCOUNTS_FILE, (fs.readFileSync(ACCOUNTS_FILE, 'utf-8').endsWith('\n') ? '' : '\n') + line + '\n');
  return { id, name, type: (type || 'SAVINGS').toUpperCase(), balance: Number(balFormatted), status: 'ACTIVE' };
}

/**
 * Restores initial baseline demo state
 */
export function resetToBaseline() {
  // 1. Write baseline accounts
  const accLines = BASELINE_ACCOUNTS.map(a => `${a.id}|${a.name}|${a.type}|${a.balance.toFixed(2)}|${a.status}`).join('\n') + '\n';
  fs.writeFileSync(ACCOUNTS_FILE, accLines);

  // 2. Write baseline transactions
  const txnLines = BASELINE_TRANSACTIONS.map(t => `${t.id}|${t.accountId}|${t.type}|${t.amount.toFixed(2)}|${t.description}`).join('\n') + '\n';
  fs.writeFileSync(TRANSACTIONS_FILE, txnLines);

  // 3. Clear processed and exceptions
  fs.writeFileSync(PROCESSED_FILE, '');
  fs.writeFileSync(EXCEPTIONS_FILE, '');

  return { message: 'Reset to pristine baseline completed. Ready to submit JCL batch job.' };
}

/**
 * Executes Mainframe Batch Processing (Faithful simulation of TRANPROC.cbl and JCL BATCHJOB)
 * Produces real disk updates to accounts.dat, processed.dat, exceptions.dat, and reports.
 */
export function executeMainframeBatch() {
  const jesLogs = [];
  const log = (msg) => jesLogs.push(msg);

  const startTime = new Date().toISOString();
  log(`//BATCHJOB JOB (ACCT),'BATCH TRANSACTION',CLASS=A,MSGCLASS=X`);
  log(`$HASP100 BATCHJOB ON INTRDR`);
  log(`$HASP373 BATCHJOB STARTED - INIT 1 - CLASS A - SYS 1`);
  log(`+IEF403I BATCHJOB - STARTED - TIME=${startTime.substring(11, 19)}`);
  log(`//STEP01   EXEC PGM=TRANPROC`);
  log(`//STEPLIB  DD DSN=USER.LOADLIB,DISP=SHR`);
  log(`//TRANIN   DD DSN=USER.TRANSACTIONS.INPUT,DISP=SHR`);
  log(`//ACCTIN   DD DSN=USER.ACCOUNTS.MASTER,DISP=SHR`);
  log(`//PROCED   DD DSN=USER.TRANSACTIONS.PROCESSED,DISP=(NEW,CATLG,DELETE)`);
  log(`//EXCEPT   DD DSN=USER.TRANSACTIONS.EXCEPT,DISP=(NEW,CATLG,DELETE)`);
  log(`//ACCTOUT  DD DSN=USER.ACCOUNTS.UPDATED,DISP=(NEW,CATLG,DELETE)`);
  log(`------------------------------------------------------------`);
  log(`[COBOL RUNTIME] ==============================================`);
  log(`[COBOL RUNTIME]    HIGH-VOLUME BATCH TRANSACTION PROCESSOR`);
  log(`[COBOL RUNTIME] ==============================================`);

  // Load account master
  const rawAccounts = getAccounts();
  // Deep copy in-memory table
  const accountTable = rawAccounts.map(a => ({ ...a, openingBalance: a.balance }));
  log(`[COBOL RUNTIME] ACCOUNT MASTER LOADED: ${accountTable.length} ACCOUNTS`);

  const transactions = getTransactions();
  let txnProcessedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let totalCredit = 0;
  let totalSuccessfulDebit = 0;
  let totalRejectedDebit = 0;

  const processedRecords = [];
  const exceptionRecords = [];
  const stepTraces = [];

  for (const txn of transactions) {
    txnProcessedCount++;
    log(`[COBOL RUNTIME] Processing: ${txn.id}  Account: ${txn.accountId}  Type: ${txn.type}  Amount: ${txn.amount.toFixed(2)}`);

    if (!txn.amount || txn.amount <= 0) {
      errorCount++;
      const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
      const errLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|INVALID AMOUNT`;
      exceptionRecords.push(errLine);
      stepTraces.push({ txnId: txn.id, status: 'EXCEPTION', reason: 'INVALID AMOUNT' });
      continue;
    }

    if (txn.type !== 'CREDIT' && txn.type !== 'DEBIT') {
      errorCount++;
      const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
      const errLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|INVALID TYPE`;
      exceptionRecords.push(errLine);
      stepTraces.push({ txnId: txn.id, status: 'EXCEPTION', reason: 'INVALID TYPE' });
      continue;
    }

    const acc = accountTable.find(a => a.id === txn.accountId);
    if (!acc) {
      errorCount++;
      const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
      const errLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|ACCOUNT NOT FOUND`;
      exceptionRecords.push(errLine);
      stepTraces.push({ txnId: txn.id, status: 'EXCEPTION', reason: 'ACCOUNT NOT FOUND' });
      continue;
    }

    const balanceBefore = acc.balance;
    log(`[COBOL RUNTIME] ACCOUNT FOUND: ${acc.id} BALANCE BEFORE: ${balanceBefore.toFixed(2)}`);

    if (txn.type === 'CREDIT') {
      acc.balance += txn.amount;
      totalCredit += txn.amount;
      successCount++;
      log(`[COBOL RUNTIME] BALANCE AFTER CREDIT: ${acc.balance.toFixed(2)}`);

      const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
      const procLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|SUCCESS`;
      processedRecords.push(procLine);
      stepTraces.push({ txnId: txn.id, status: 'SUCCESS', type: 'CREDIT', amount: txn.amount, balanceAfter: acc.balance });
    } else {
      // DEBIT
      if (acc.balance >= txn.amount) {
        acc.balance -= txn.amount;
        totalSuccessfulDebit += txn.amount;
        successCount++;
        log(`[COBOL RUNTIME] BALANCE AFTER DEBIT: ${acc.balance.toFixed(2)}`);

        const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
        const procLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|SUCCESS`;
        processedRecords.push(procLine);
        stepTraces.push({ txnId: txn.id, status: 'SUCCESS', type: 'DEBIT', amount: txn.amount, balanceAfter: acc.balance });
      } else {
        // Insufficient funds
        errorCount++;
        totalRejectedDebit += txn.amount;
        log(`[COBOL RUNTIME] INSUFFICIENT BALANCE FOR DEBIT: Requested ${txn.amount.toFixed(2)}, Available ${acc.balance.toFixed(2)}`);

        const paddedAmt = String(Math.round(txn.amount * 100)).padStart(12, '0');
        const errLine = `${txn.id.padEnd(10)}|${txn.accountId.padEnd(10)}|${txn.type.padEnd(10)}|${paddedAmt}|INSUFFICIENT BALANCE`;
        exceptionRecords.push(errLine);
        stepTraces.push({ txnId: txn.id, status: 'EXCEPTION', reason: 'INSUFFICIENT BALANCE', requested: txn.amount, available: acc.balance });
      }
    }
  }

  // Write updated account master
  const updatedAccountLines = accountTable.map(a => `${a.id}|${a.name}|${a.type}|${a.balance.toFixed(2)}|${a.status}`).join('\n') + '\n';
  fs.writeFileSync(ACCOUNTS_FILE, updatedAccountLines);
  log(`[COBOL RUNTIME] ACCOUNT MASTER UPDATED SUCCESSFULLY`);

  // Write processed records
  fs.writeFileSync(PROCESSED_FILE, processedRecords.join('\n') + (processedRecords.length ? '\n' : ''));

  // Write exception records
  fs.writeFileSync(EXCEPTIONS_FILE, exceptionRecords.join('\n') + (exceptionRecords.length ? '\n' : ''));

  const endTime = new Date().toISOString();
  log(`[COBOL RUNTIME] ==============================================`);
  log(`[COBOL RUNTIME]              BATCH PROCESSING COMPLETE`);
  log(`[COBOL RUNTIME] ==============================================`);
  log(`[COBOL RUNTIME] TOTAL TRANSACTIONS : ${String(txnProcessedCount).padStart(5, '0')}`);
  log(`[COBOL RUNTIME] SUCCESSFUL         : ${String(successCount).padStart(5, '0')}`);
  log(`[COBOL RUNTIME] ERRORS             : ${String(errorCount).padStart(5, '0')}`);
  log(`[COBOL RUNTIME] TOTAL CREDIT       : ${totalCredit.toFixed(2)}`);
  log(`[COBOL RUNTIME] TOTAL DEBIT        : ${(totalSuccessfulDebit + totalRejectedDebit).toFixed(2)}`);
  log(`+IEF404I BATCHJOB - ENDED - TIME=${endTime.substring(11, 19)}`);
  log(`$HASP395 BATCHJOB ENDED - RC=0000`);

  // Update dynamic reports
  generateUpdatedReports({
    transactions,
    accountTable,
    successCount,
    errorCount,
    totalCredit,
    totalSuccessfulDebit,
    totalRejectedDebit,
    exceptionRecords
  });

  return {
    returnCode: 0,
    status: 'COMPLETED_SUCCESSFULLY',
    totalTransactions: txnProcessedCount,
    successCount,
    errorCount,
    totalCredit,
    totalSuccessfulDebit,
    totalRejectedDebit,
    accountTable,
    stepTraces,
    jesLogs
  };
}

/**
 * Regenerates formatted reports in reports/
 */
function generateUpdatedReports({
  transactions,
  accountTable,
  successCount,
  errorCount,
  totalCredit,
  totalSuccessfulDebit,
  totalRejectedDebit,
  exceptionRecords
}) {
  const today = new Date().toISOString().substring(0, 10);

  // 1. Daily Transaction Report
  let dailyRpt = `======================================================================\n`;
  dailyRpt += `              DAILY TRANSACTION PROCESSING REPORT\n`;
  dailyRpt += `======================================================================\n\n`;
  dailyRpt += `BATCH JOB       : BATCHJOB\n`;
  dailyRpt += `PROCESSOR       : TRANPROC\n`;
  dailyRpt += `PROCESS DATE    : ${today}\n`;
  dailyRpt += `INPUT FILE      : transactions.dat\n\n`;
  dailyRpt += `----------------------------------------------------------------------\n`;
  dailyRpt += `TRANSACTION SUMMARY\n`;
  dailyRpt += `----------------------------------------------------------------------\n\n`;
  dailyRpt += `TOTAL TRANSACTIONS PROCESSED : ${transactions.length}\n`;
  dailyRpt += `SUCCESSFUL TRANSACTIONS       : ${successCount}\n`;
  dailyRpt += `FAILED TRANSACTIONS           : ${errorCount}\n`;
  dailyRpt += `TOTAL CREDIT AMOUNT           : ${totalCredit.toFixed(2)}\n`;
  dailyRpt += `TOTAL DEBIT ATTEMPTS          : ${(totalSuccessfulDebit + totalRejectedDebit).toFixed(2)}\n\n`;
  dailyRpt += `======================================================================\n`;
  dailyRpt += `                         END OF REPORT\n`;
  dailyRpt += `======================================================================\n`;
  fs.writeFileSync(path.join(REPORTS_DIR, 'daily_transaction_report.txt'), dailyRpt);

  // 2. Reconciliation Report
  const totalOpening = accountTable.reduce((sum, a) => sum + (a.openingBalance || a.balance), 0);
  const totalFinal = accountTable.reduce((sum, a) => sum + a.balance, 0);
  const expectedFinal = totalOpening + totalCredit - totalSuccessfulDebit;
  const isBalanced = Math.abs(expectedFinal - totalFinal) < 0.01;

  let reconRpt = `======================================================================\n`;
  reconRpt += `                   BATCH RECONCILIATION REPORT\n`;
  reconRpt += `======================================================================\n\n`;
  reconRpt += `BATCH JOB       : BATCHJOB\n`;
  reconRpt += `PROCESSOR       : TRANPROC\n`;
  reconRpt += `PROCESS DATE    : ${today}\n\n`;
  reconRpt += `----------------------------------------------------------------------\n`;
  reconRpt += `TRANSACTION RECONCILIATION\n`;
  reconRpt += `----------------------------------------------------------------------\n\n`;
  reconRpt += `INPUT TRANSACTIONS          : ${transactions.length}\n`;
  reconRpt += `SUCCESSFUL TRANSACTIONS     : ${successCount}\n`;
  reconRpt += `EXCEPTION TRANSACTIONS      : ${errorCount}\n`;
  reconRpt += `TOTAL PROCESSED             : ${transactions.length}\n\n`;
  reconRpt += `RECONCILIATION STATUS       : ${isBalanced ? 'BALANCED' : 'OUT_OF_BALANCE'}\n\n`;
  reconRpt += `----------------------------------------------------------------------\n`;
  reconRpt += `AMOUNT RECONCILIATION\n`;
  reconRpt += `----------------------------------------------------------------------\n\n`;
  reconRpt += `TOTAL CREDIT TRANSACTIONS  : ${totalCredit.toFixed(2)}\n`;
  reconRpt += `TOTAL SUCCESSFUL DEBITS    : ${totalSuccessfulDebit.toFixed(2)}\n`;
  reconRpt += `TOTAL DEBIT ATTEMPTS       : ${(totalSuccessfulDebit + totalRejectedDebit).toFixed(2)}\n`;
  reconRpt += `REJECTED DEBIT             : ${totalRejectedDebit.toFixed(2)}\n\n`;
  reconRpt += `SUCCESSFUL DEBIT + REJECTED DEBIT\n`;
  reconRpt += `${totalSuccessfulDebit.toFixed(2)} + ${totalRejectedDebit.toFixed(2)} = ${(totalSuccessfulDebit + totalRejectedDebit).toFixed(2)}\n\n`;
  reconRpt += `----------------------------------------------------------------------\n`;
  reconRpt += `ACCOUNT BALANCE RECONCILIATION\n`;
  reconRpt += `----------------------------------------------------------------------\n\n`;
  reconRpt += `TOTAL OPENING BALANCE      : ${totalOpening.toFixed(2)}\n`;
  reconRpt += `PLUS TOTAL CREDITS         :  ${totalCredit.toFixed(2)}\n`;
  reconRpt += `LESS SUCCESSFUL DEBITS     :  ${totalSuccessfulDebit.toFixed(2)}\n`;
  reconRpt += `----------------------------------------------------------------------\n`;
  reconRpt += `EXPECTED FINAL BALANCE     : ${expectedFinal.toFixed(2)}\n`;
  reconRpt += `ACTUAL FINAL BALANCE       : ${totalFinal.toFixed(2)}\n\n`;
  reconRpt += `BALANCE RECONCILIATION     : ${isBalanced ? 'BALANCED' : 'OUT_OF_BALANCE'}\n\n`;
  reconRpt += `JOB STATUS                 : COMPLETED SUCCESSFULLY\n`;
  reconRpt += `OVERALL RECONCILIATION     : ${isBalanced ? 'BALANCED' : 'OUT_OF_BALANCE'}\n\n`;
  reconRpt += `======================================================================\n`;
  reconRpt += `                    END OF RECONCILIATION REPORT\n`;
  reconRpt += `======================================================================\n`;
  fs.writeFileSync(path.join(REPORTS_DIR, 'reconciliation_report.txt'), reconRpt);
}

/**
 * Reads all report text files
 */
export function getAllReports() {
  const reports = {};
  const files = [
    'daily_transaction_report.txt',
    'account_summary_report.txt',
    'exception_report.txt',
    'reconciliation_report.txt',
    'vsam_integration_design.txt',
    'db2_integration_design.txt'
  ];

  for (const f of files) {
    const fullPath = path.join(REPORTS_DIR, f);
    if (fs.existsSync(fullPath)) {
      reports[f] = fs.readFileSync(fullPath, 'utf-8');
    } else {
      reports[f] = '';
    }
  }

  return reports;
}

/**
 * Returns raw source of TRANPROC.cbl and BATCHJOB.jcl
 */
export function getMainframeCode() {
  return {
    cobol: fs.existsSync(COBOL_FILE) ? fs.readFileSync(COBOL_FILE, 'utf-8') : '',
    jcl: fs.existsSync(JCL_FILE) ? fs.readFileSync(JCL_FILE, 'utf-8') : ''
  };
}

/**
 * Updates source code of COBOL or JCL
 */
export function updateMainframeCode(type, content) {
  if (type === 'cobol') {
    fs.writeFileSync(COBOL_FILE, content, 'utf-8');
  } else if (type === 'jcl') {
    fs.writeFileSync(JCL_FILE, content, 'utf-8');
  }
  return { message: `${type.toUpperCase()} file updated successfully.` };
}

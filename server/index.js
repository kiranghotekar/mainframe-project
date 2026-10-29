import express from 'express';
import cors from 'cors';
import {
  getAccounts,
  getTransactions,
  getProcessedTransactions,
  getExceptions,
  stageTransaction,
  createAccount,
  resetToBaseline,
  executeMainframeBatch,
  getAllReports,
  getMainframeCode,
  updateMainframeCode
} from './mainframeEngine.js';
import { generateLargeDataset } from './generateDataset.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API GATEWAY] ${req.method} ${req.url}`);
  next();
});

// System Status & Mainframe Telemetry
app.get('/api/status', (req, res) => {
  const accounts = getAccounts();
  const transactions = getTransactions();
  const processed = getProcessedTransactions();
  const exceptions = getExceptions();

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  res.json({
    subsystem: 'IBM z/OS JES2 & Enterprise Batch Gateway',
    status: 'ONLINE',
    jobClass: 'CLASS A',
    activeCpus: 4,
    storageGroup: 'SYSDA',
    datasetCount: 5,
    metrics: {
      accountCount: accounts.length,
      totalDeposits: totalBalance,
      queueCount: transactions.length,
      clearedCount: processed.length,
      exceptionCount: exceptions.length,
      lastReturnCode: exceptions.length > 0 ? '0000 (WITH EXCEPTIONS)' : '0000'
    }
  });
});

// VSAM Account Master endpoints
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = getAccounts();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/accounts', (req, res) => {
  try {
    const { id, name, type, initialBalance } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Account ID and Name are required.' });
    }
    const newAcc = createAccount({ id, name, type, initialBalance });
    res.status(201).json(newAcc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Transaction Queue endpoints (QSAM sequential)
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = getTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { accountId, type, amount, description } = req.body;
    if (!accountId || !type || !amount) {
      return res.status(400).json({ error: 'Account ID, Type (CREDIT/DEBIT), and Amount are required.' });
    }
    const newTxn = stageTransaction({ accountId, type, amount, description });
    res.status(201).json(newTxn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cleared / Processed Transactions
app.get('/api/processed', (req, res) => {
  try {
    const processed = getProcessedTransactions();
    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspense / Exception Queue
app.get('/api/exceptions', (req, res) => {
  try {
    const exceptions = getExceptions();
    res.json(exceptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Mainframe Batch Job (JCL //BATCHJOB)
app.post('/api/batch/submit', (req, res) => {
  try {
    const result = executeMainframeBatch();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, status: 'ABEND', returnCode: 12 });
  }
});

// Reset to Baseline demo state
app.post('/api/batch/reset', (req, res) => {
  try {
    const result = resetToBaseline();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Enterprise 10,000 Row Dataset
app.post('/api/batch/generate-10k', (req, res) => {
  try {
    const numTxns = req.body.transactions || 10000;
    const numAccs = req.body.accounts || 500;
    const result = generateLargeDataset(numTxns, numAccs);
    res.json({
      success: true,
      message: `Successfully provisioned ${result.transactionsCount} transactions across ${result.accountsCount} customer accounts.`,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Reports
app.get('/api/reports', (req, res) => {
  try {
    const reports = getAllReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mainframe Code Viewer & Editor (COBOL & JCL)
app.get('/api/mainframe/code', (req, res) => {
  try {
    const code = getMainframeCode();
    res.json(code);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mainframe/code', (req, res) => {
  try {
    const { type, content } = req.body;
    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required.' });
    }
    const result = updateMainframeCode(type, content);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulated IBM DB2 SQL Querying Engine
app.post('/api/db2/query', (req, res) => {
  try {
    const { sql } = req.body;
    const accounts = getAccounts();
    const transactions = getTransactions();
    const processed = getProcessedTransactions();
    const exceptions = getExceptions();

    const normalizedSql = (sql || '').trim().toUpperCase();

    let columns = [];
    let rows = [];

    if (normalizedSql.includes('ACCOUNT_BALANCE_SUMMARY') || normalizedSql.includes('FROM ACCOUNT_BALANCE_SUMMARY')) {
      columns = ['CUSTOMER_ID', 'CUSTOMER_NAME', 'ACCOUNT_TYPE', 'TOTAL_CREDIT', 'TOTAL_DEBIT', 'CURRENT_BALANCE'];
      rows = accounts.map(a => {
        const credits = processed.filter(p => p.accountId === a.id && p.type === 'CREDIT').reduce((s, p) => s + p.amount, 0);
        const debits = processed.filter(p => p.accountId === a.id && p.type === 'DEBIT').reduce((s, p) => s + p.amount, 0);
        return {
          CUSTOMER_ID: a.id,
          CUSTOMER_NAME: a.name,
          ACCOUNT_TYPE: a.type,
          TOTAL_CREDIT: credits.toFixed(2),
          TOTAL_DEBIT: debits.toFixed(2),
          CURRENT_BALANCE: a.balance.toFixed(2)
        };
      });
    } else if (normalizedSql.includes('FROM CUSTOMERS') || normalizedSql.includes('FROM ACCOUNTS')) {
      columns = ['CUSTOMER_ID', 'CUSTOMER_NAME', 'ACCOUNT_TYPE', 'CURRENT_BALANCE', 'STATUS'];
      rows = accounts.map(a => ({
        CUSTOMER_ID: a.id,
        CUSTOMER_NAME: a.name,
        ACCOUNT_TYPE: a.type,
        CURRENT_BALANCE: a.balance.toFixed(2),
        STATUS: a.status
      }));
    } else if (normalizedSql.includes('FROM EXCEPTIONS') || normalizedSql.includes("STATUS = 'FAILED'")) {
      columns = ['TXN_ID', 'CUSTOMER_ID', 'TXN_TYPE', 'AMOUNT', 'REASON'];
      rows = exceptions.map(e => ({
        TXN_ID: e.id,
        CUSTOMER_ID: e.accountId,
        TXN_TYPE: e.type,
        AMOUNT: e.amount.toFixed(2),
        REASON: e.reason
      }));
    } else {
      // Default: TRANSACTIONS table join with status
      columns = ['TXN_ID', 'CUSTOMER_ID', 'TXN_TYPE', 'AMOUNT', 'DESCRIPTION', 'STATUS'];
      rows = transactions.map(t => {
        const isProc = processed.find(p => p.id === t.id);
        const isEx = exceptions.find(e => e.id === t.id);
        const status = isProc ? 'CLEARED' : (isEx ? 'FAILED (SUSPENSE)' : 'PENDING');
        return {
          TXN_ID: t.id,
          CUSTOMER_ID: t.accountId,
          TXN_TYPE: t.type,
          AMOUNT: t.amount.toFixed(2),
          DESCRIPTION: t.description,
          STATUS: status
        };
      });
    }

    res.json({
      sql: sql || 'SELECT * FROM account_balance_summary',
      executionTimeMs: 14,
      affectedRows: rows.length,
      columns,
      rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  IBM z/FinCore Mainframe Gateway API Running`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Target COBOL: cobol/TRANPROC.cbl`);
  console.log(`  Target JCL:   jcl/BATCHJOB.jcl`);
  console.log(`====================================================`);
});

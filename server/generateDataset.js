import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.dat');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.dat');
const PROCESSED_FILE = path.join(DATA_DIR, 'processed.dat');
const EXCEPTIONS_FILE = path.join(DATA_DIR, 'exceptions.dat');

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Rudra', 'Kabir', 'Aryan', 'Dhruv', 'Kiran', 'Rohan', 'Vikram', 'Rishi',
  'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Ira', 'Myra', 'Riya', 'Anika', 'Navya',
  'Pooja', 'Sneha', 'Neha', 'Kavya', 'Meera', 'Tanvi', 'Isha', 'Simran', 'Shruti', 'Aditi',
  'Deepak', 'Sanjay', 'Rahul', 'Amit', 'Rajesh', 'Sunil', 'Manoj', 'Praveen', 'Suresh', 'Alok'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Shah', 'Joshi', 'Singhania', 'Kapoor', 'Malhotra', 'Gupta',
  'Reddy', 'Nair', 'Menon', 'Rao', 'Bhat', 'Kulkarni', 'Deshmukh', 'Patil', 'Chavan', 'Pawar',
  'Chatterjee', 'Banerjee', 'Mukherjee', 'Bose', 'Dutta', 'Das', 'Sen', 'Ghosh', 'Roy', 'Barman',
  'Agarwal', 'Chopra', 'Dhawan', 'Bansal', 'Mittal', 'Goel', 'Garg', 'Jindal', 'Singla', 'Mishra'
];

const CREDIT_DESCRIPTIONS = [
  'SALARY_CREDIT', 'NEFT_TRANSFER', 'UPI_RECEIVED', 'INTEREST_PAYOUT',
  'DIVIDEND_PROCEEDS', 'VENDOR_REFUND', 'CASH_DEPOSIT', 'BONUS_PAYOUT',
  'FIXED_DEPOSIT_MATURITY', 'INVESTMENT_RETURN'
];

const DEBIT_DESCRIPTIONS = [
  'ATM_WITHDRAWAL', 'UTILITY_BILL_PAYMENT', 'GROCERY_SUPERMARKET', 'EMI_AUTO_DEBIT',
  'MERCHANT_POS', 'ONLINE_SHOPPING', 'INSURANCE_PREMIUM', 'SUPPLIER_PAYMENT',
  'CREDIT_CARD_BILL', 'TAX_ADVANCE_DEDUCTION', 'CAR_LOAN_INSTALLMENT', 'SIP_MUTUAL_FUND'
];

/**
 * Generates an enterprise-scale dataset with specified number of transactions and accounts.
 * @param {number} numTransactions - default 10000
 * @param {number} numAccounts - default 500
 */
export function generateLargeDataset(numTransactions = 10000, numAccounts = 500) {
  console.log(`[GENERATOR] Initializing dataset generation: ${numAccounts} Accounts, ${numTransactions} Transactions...`);

  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // 1. Generate Accounts (VSAM KSDS Account Master)
  const accounts = [];
  const startId = 100001;

  for (let i = 0; i < numAccounts; i++) {
    const id = String(startId + i);
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const type = (i % 3 === 0) ? 'CURRENT' : 'SAVINGS';

    // Tiered realistic balances
    let balance;
    if (i % 10 === 0) {
      // High net worth: 250,000 - 800,000
      balance = 250000 + (i * 1234.50) % 550000;
    } else if (i % 4 === 0) {
      // Low balance / prone to overdraft: 2,500 - 15,000
      balance = 2500 + (i * 321.25) % 12500;
    } else {
      // Standard balance: 25,000 - 120,000
      balance = 25000 + (i * 789.75) % 95000;
    }

    balance = Math.round(balance * 100) / 100;
    accounts.push({ id, name, type, balance, status: 'ACTIVE' });
  }

  // Format accounts.dat
  const accountLines = accounts.map(a => `${a.id}|${a.name}|${a.type}|${a.balance.toFixed(2)}|${a.status}`).join('\n') + '\n';
  fs.writeFileSync(ACCOUNTS_FILE, accountLines);
  console.log(`[GENERATOR] Successfully created ${accounts.length} accounts in data/accounts.dat`);

  // 2. Generate Transactions (QSAM Sequential File)
  const transactions = [];

  for (let i = 1; i <= numTransactions; i++) {
    const txnId = `TXN${String(i).padStart(5, '0')}`;
    
    // Choose account: 99.5% valid account, 0.5% intentionally invalid (999999) to test ACCOUNT NOT FOUND
    const isInvalidAccount = (i % 200 === 0);
    const accountIndex = (i * 17 + i * 3) % numAccounts;
    const accountId = isInvalidAccount ? '999999' : accounts[accountIndex].id;

    // 55% CREDIT, 45% DEBIT
    const isCredit = (i % 100) < 55;
    const type = isCredit ? 'CREDIT' : 'DEBIT';

    let amount;
    let description;

    if (isCredit) {
      description = CREDIT_DESCRIPTIONS[i % CREDIT_DESCRIPTIONS.length];
      // Credit amounts: 500.00 to 75,000.00
      amount = 500 + (i * 147.50) % 74500;
    } else {
      description = DEBIT_DESCRIPTIONS[i % DEBIT_DESCRIPTIONS.length];
      
      // Intentionally create overdraft attempts on low-balance accounts (~4% of transactions)
      const targetAcc = accounts[accountIndex];
      if (!isInvalidAccount && targetAcc && targetAcc.balance < 20000 && (i % 25 === 0)) {
        // Overdraft attempt: amount exceeds balance
        amount = targetAcc.balance + 15000 + (i * 50) % 25000;
      } else {
        // Normal debit: 50.00 to 22,000.00
        amount = 50 + (i * 83.25) % 21950;
      }
    }

    amount = Math.round(amount * 100) / 100;
    transactions.push(`${txnId}|${accountId}|${type}|${amount.toFixed(2)}|${description}`);
  }

  // Format transactions.dat
  const transactionLines = transactions.join('\n') + '\n';
  fs.writeFileSync(TRANSACTIONS_FILE, transactionLines);
  console.log(`[GENERATOR] Successfully created ${numTransactions} transactions in data/transactions.dat`);

  // 3. Clear processed.dat and exceptions.dat for clean batch execution state
  fs.writeFileSync(PROCESSED_FILE, '');
  fs.writeFileSync(EXCEPTIONS_FILE, '');

  return {
    accountsCount: accounts.length,
    transactionsCount: numTransactions,
    accountsFile: ACCOUNTS_FILE,
    transactionsFile: TRANSACTIONS_FILE
  };
}

// Allow CLI direct execution: node server/generateDataset.js [numTxns] [numAccs]
if (process.argv[1] && process.argv[1].endsWith('generateDataset.js')) {
  const numTxns = parseInt(process.argv[2], 10) || 10000;
  const numAccs = parseInt(process.argv[3], 10) || 500;
  generateLargeDataset(numTxns, numAccs);
  console.log(`[GENERATOR] Done! Generated ${numTxns} rows successfully.`);
}

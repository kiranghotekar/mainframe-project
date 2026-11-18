import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BankingView from './views/BankingView';
import AccountsView from './views/AccountsView';
import JesSpoolView from './views/JesSpoolView';
import DatabaseView from './views/DatabaseView';
import ExceptionsView from './views/ExceptionsView';
import ReconciliationView from './views/ReconciliationView';
import CodeStudioView from './views/CodeStudioView';
import StageTransactionModal from './components/StageTransactionModal';
import OnboardAccountModal from './components/OnboardAccountModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('banking');
  const [telemetry, setTelemetry] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [reports, setReports] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Theme State (Net Banking Light Theme / Midnight Navy Dark Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Net Banking (Light)' : 'Midnight Navy (Dark)'} Theme`, 'info');
  };

  // Modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [quickTxnConfig, setQuickTxnConfig] = useState({ accountId: '', type: 'CREDIT' });

  const showToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load all system data
  const fetchData = async () => {
    try {
      const [telRes, accRes, txnRes, procRes, excRes, rptRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()).catch(() => null),
        fetch('/api/accounts').then(r => r.json()).catch(() => []),
        fetch('/api/transactions').then(r => r.json()).catch(() => []),
        fetch('/api/processed').then(r => r.json()).catch(() => []),
        fetch('/api/exceptions').then(r => r.json()).catch(() => []),
        fetch('/api/reports').then(r => r.json()).catch(() => null)
      ]);

      if (telRes) setTelemetry(telRes);
      if (accRes) setAccounts(accRes);
      if (txnRes) setTransactions(txnRes);
      if (procRes) setProcessed(procRes);
      if (excRes) setExceptions(excRes);
      if (rptRes) setReports(rptRes);
    } catch (err) {
      console.error('Failed to load mainframe state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Batch Job (JCL //BATCHJOB EXEC PGM=TRANPROC)
  const handleRunBatch = async () => {
    setIsProcessing(true);
    showToast('Submitting JCL //BATCHJOB to JES2 spool queue...', 'info');
    try {
      const res = await fetch('/api/batch/submit', { method: 'POST' });
      const data = await res.json();
      setBatchResult(data);
      await fetchData();
      if (data?.summary?.rejected > 0) {
        showToast(`BATCHJOB COMPLETED: ${data.summary.processed} PROCESSED, ${data.summary.rejected} REJECTED`, 'warning');
      } else {
        showToast(`BATCHJOB COMPLETED SUCCESSFULLY (RC=0000)`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Batch execution failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to Baseline demo state
  const handleReset = async () => {
    if (!window.confirm('Reset datasets (accounts, transactions, processed, exceptions) to baseline demo state?')) {
      return;
    }
    try {
      await fetch('/api/batch/reset', { method: 'POST' });
      await fetchData();
      setBatchResult(null);
      showToast('Datasets reset to clean demo baseline.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  // Generate 10k enterprise dataset
  const handleGenerate10k = async () => {
    if (!window.confirm('Generate enterprise 10,000-row transaction dataset (500 accounts, 10,000 transactions)? Staged batch will be ready for execution.')) {
      return;
    }
    setIsProcessing(true);
    showToast('Provisioning 10,000 transactions across 500 accounts...', 'info');
    try {
      const res = await fetch('/api/batch/generate-10k', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: 10000, accounts: 500 })
      });
      const data = await res.json();
      await fetchData();
      setBatchResult(null);
      showToast(`Loaded ${data.transactionsCount} transactions across ${data.accountsCount} customer accounts!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Dataset generation failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stage Transaction
  const handleStageTransaction = async (txnData) => {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnData)
      });
      setIsTxnModalOpen(false);
      await fetchData();
      showToast(`Transaction staged into transactions.dat: ₹${txnData.amount.toFixed(2)} [${txnData.type}]`, 'success');
    } catch (err) {
      showToast('Error staging transaction: ' + err.message, 'error');
    }
  };

  // Onboard Account
  const handleOnboardAccount = async (accData) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to onboard account');
      }
      setIsAccModalOpen(false);
      await fetchData();
      showToast(`Account ACCT-${accData.id} (${accData.name}) allocated in VSAM Master.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Quick transaction helper from account card
  const handleQuickTxn = (accountId, type) => {
    setQuickTxnConfig({ accountId, type });
    setIsTxnModalOpen(true);
  };

  // Fund account and retry rejected transaction
  const handleFundAndRetry = async (accountId, deficitAmount) => {
    try {
      showToast(`Funding ACCT-${accountId} with ₹${((deficitAmount + 10000)/100).toFixed(2)}...`, 'info');
      // 1. Stage credit to fund account
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          type: 'CREDIT',
          amount: deficitAmount + 10000,
          description: 'EMERGENCY_OVERDRAFT_FUNDING'
        })
      });
      // 2. Trigger batch job
      await handleRunBatch();
      setActiveTab('spool');
    } catch (err) {
      showToast('Failed to fund and retry: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--bg-card)',
          border: `1px solid ${notification.type === 'error' ? 'var(--crimson-border)' : notification.type === 'warning' ? 'var(--amber-border)' : 'var(--border-default)'}`,
          color: 'var(--text-primary)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.18s ease'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: notification.type === 'error' ? 'var(--crimson-danger)' : notification.type === 'warning' ? 'var(--amber-warning)' : 'var(--brand-teal)',
            boxShadow: `0 0 8px ${notification.type === 'error' ? 'var(--crimson-danger)' : notification.type === 'warning' ? 'var(--amber-warning)' : 'var(--brand-teal)'}`
          }} />
          {notification.msg}
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeCounts={{
          accounts: accounts.length,
          transactions: transactions.length,
          exceptions: exceptions.length,
          isProcessing
        }}
        telemetry={telemetry}
        theme={theme}
        onToggleTheme={toggleTheme}
        onGenerate10k={handleGenerate10k}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        
        {/* Top App Bar */}
        <TopBar
          activeTab={activeTab}
          onRunBatch={handleRunBatch}
          onReset={handleReset}
          onOpenTxnModal={() => {
            setQuickTxnConfig({ accountId: accounts[0]?.id || '100001', type: 'CREDIT' });
            setIsTxnModalOpen(true);
          }}
          onOpenAccModal={() => setIsAccModalOpen(true)}
          isProcessing={isProcessing}
          pendingCount={transactions.length}
        />

        {/* View Switcher */}
        <main style={{ flex: 1 }}>
          {activeTab === 'banking' && (
            <BankingView
              accounts={accounts}
              transactions={transactions}
              processed={processed}
              exceptions={exceptions}
              onQuickTxn={handleQuickTxn}
              onRunBatch={handleRunBatch}
              onOpenTxnModal={() => setIsTxnModalOpen(true)}
              onNavigateTab={setActiveTab}
              onGenerate10k={handleGenerate10k}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              transactions={transactions}
              processed={processed}
              exceptions={exceptions}
              onQuickTxn={handleQuickTxn}
            />
          )}

          {activeTab === 'spool' && (
            <JesSpoolView
              batchResult={batchResult}
              onRunBatch={handleRunBatch}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              accounts={accounts}
              transactions={transactions}
              processed={processed}
              exceptions={exceptions}
            />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionsView
              exceptions={exceptions}
              accounts={accounts}
              onFundAndRetry={handleFundAndRetry}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              reports={reports}
              accounts={accounts}
            />
          )}

          {activeTab === 'code' && (
            <CodeStudioView />
          )}
        </main>

        {/* System Telemetry Institutional Footer */}
        <footer style={{
          padding: '12px 28px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--brand-teal)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--brand-teal)'
            }} />
            <span style={{ fontWeight: 600 }}>IBM z16 / z/OS 2.5 LPAR SYS1 • Core Banking Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>CLASS A / SYSDA</span>
            <span style={{ color: 'var(--brand-teal)', fontWeight: 600 }}>VSAM KSDS MASTER MOUNTED</span>
            <span>HIGH-VOLUME BATCH ENGINE</span>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <StageTransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        accounts={accounts}
        onSubmit={handleStageTransaction}
        initialAccount={quickTxnConfig.accountId}
        initialType={quickTxnConfig.type}
      />

      <OnboardAccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        accounts={accounts}
        onSubmit={handleOnboardAccount}
      />

    </div>
  );
}

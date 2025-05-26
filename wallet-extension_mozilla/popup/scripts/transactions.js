const API_BASE = 'http://localhost:5000/';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] Transactions page loaded');

  // UI Elements
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const fullTransactionList = document.getElementById('fullTransactionList');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const navItems = document.querySelectorAll('.nav-item');

  // Helpers
  function formatDateTime(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('en-US');
  }
  const wallet = JSON.parse(sessionStorage.getItem('walletData'));
if (wallet) {
    console.log('Public Key:', wallet.public_key);
    console.log('Address:', wallet.address);
}
  function shortenAddress(addr, chars = 4) {
    if (!addr || typeof addr !== 'string') return '—';
    const clean = addr.replace(/^0x/, '');
    return clean.length <= chars * 2
      ? clean
      : `${clean.slice(0, chars)}...${clean.slice(-chars)}`;
  }

  function getTransactionStatus(type) {
    if (!type) return 'pending';
    if (type.includes('confirmed')) return 'confirmed';
    if (type.includes('pending')) return 'pending';
    return 'confirmed'; // default if not specified
  }

  // Check authentication and display address
  let address;
  try {
    const raw = localStorage.getItem('walletData');
    const walletData = raw && JSON.parse(raw);
    if (!walletData || !walletData.address) {
      throw new Error('Wallet not found');
    }
    address = walletData.address;
    walletAddressEl.textContent = shortenAddress(address);
    console.log('[DEBUG] Wallet address:', address);
  } catch (e) {
    alert('User not authenticated. Redirecting to login...');
    window.location.href = 'main.html';
    return;
  }

  // Fetch and render all transactions
  async function loadTransactions(filter = 'all') {
    try {
      console.log(`[DEBUG] Fetching transactions for ${address}, filter=${filter}`);
      const res = await fetch(`${API_BASE}/wallet/transactions/${address}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { transactions } = await res.json();
      renderTransactions(transactions || [], filter);
    } catch (err) {
      console.error('[ERROR] loadTransactions:', err);
      fullTransactionList.innerHTML = 
        `<div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error loading transactions</p>
          <small>${err.message}</small>
        </div>`;
    }
  }

  // Render all transactions (no limit)
  function renderTransactions(transactions, filter) {
    console.log(`[DEBUG] Rendering ${transactions.length} txs, filter=${filter}`);
    fullTransactionList.innerHTML = '';

    const list = transactions
      .map(tx => {
        const raw = String(tx.type || '').toLowerCase();
        const base = raw.split(/[\s(]/)[0]; // 'received (pending)' → 'received'
        const status = getTransactionStatus(raw);
        return { 
          ...tx, 
          baseType: base === 'sent' ? 'sent' : 'received',
          status: status
        };
      })
      .filter(tx => filter === 'all' || tx.baseType === filter);

    if (list.length === 0) {
      const filterLabel = filter === 'all' ? '' : filter === 'received' ? 'received' : 'sent';
      fullTransactionList.innerHTML = 
        `<div class="empty-state">
          <i class="fas fa-exchange-alt"></i>
          <p>No ${filterLabel ? filterLabel + ' ' : ''}transactions found</p>
        </div>`;
      return;
    }

    list.forEach(tx => {
      const isReceived = tx.baseType === 'received';
      const dateFmt = tx.date ? formatDateTime(tx.date) : '—';
      const amountFmt = (isReceived ? '+' : '-') + parseFloat(tx.amount).toFixed(4);
      const iconDir = isReceived ? 'down' : 'up';
      const label = isReceived ? 'Received' : 'Sent';
      const statusText = tx.status === 'pending' ? 'Pending' : 'Confirmed';
      const statusClass = tx.status === 'pending' ? 'pending' : 'confirmed';

      fullTransactionList.insertAdjacentHTML('beforeend', 
        `<div class="full-transaction-item ${tx.baseType}">
          <div class="transaction-icon">
            <i class="fas fa-arrow-${iconDir}"></i>
          </div>
          <div class="transaction-details">
            <div class="transaction-meta">
              <span class="transaction-type">${label}</span>
              <span class="transaction-date">${dateFmt}</span>
            </div>
            <div class="transaction-info">
              <span class="transaction-amount">${amountFmt} SUN</span>
              <span class="transaction-status ${statusClass}">${statusText}</span>
            </div>
          </div>
        </div>`);
    });
  }

  // Event listeners
  copyAddressBtn.addEventListener('click', () =>
    navigator.clipboard.writeText(address).then(() => {
      const orig = copyAddressBtn.innerHTML;
      copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => (copyAddressBtn.innerHTML = orig), 2000);
    })
  );
  
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('walletData');
    window.location.href = 'main.html';
  });
  
  filterButtons.forEach(btn =>
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTransactions(btn.dataset.filter);
    })
  );
  
  navItems.forEach(item =>
    item.addEventListener('click', () => {
      const pg = item.dataset.page;
      if (pg !== 'transactions') window.location.href = `${pg}.html`;
    })
  );
  
  // Highlight active navigation item
  navItems.forEach(i =>
    i.dataset.page === 'transactions' ? i.classList.add('active') : i.classList.remove('active')
  );

  // Load everything
  loadTransactions();
  console.log('[DEBUG] Transactions page initialized');
});

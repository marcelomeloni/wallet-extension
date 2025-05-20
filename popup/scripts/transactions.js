API_BASE = 'https://sunaryum.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] Transactions page loaded');

  // Elementos da UI
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const fullTransactionList = document.getElementById('fullTransactionList');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const navItems = document.querySelectorAll('.nav-item');

  // Helpers
  function formatDateTime(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('pt-BR');
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
    return 'confirmed'; // padrão se não especificado
  }

  // Verifica autenticação e exibe endereço
  let address;
  try {
    const raw = localStorage.getItem('walletData');
    const walletData = raw && JSON.parse(raw);
    if (!walletData || !walletData.address) {
      throw new Error('Carteira não encontrada');
    }
    address = walletData.address;
    walletAddressEl.textContent = shortenAddress(address);
    console.log('[DEBUG] Endereço da carteira:', address);
  } catch (e) {
    alert('Usuário não autenticado. Redirecionando para login...');
    window.location.href = 'import.html';
    return;
  }

  // Busca e renderiza todas as transações
  async function loadTransactions(filter = 'all') {
    try {
      console.log(`[DEBUG] Buscando transações para ${address}, filtro=${filter}`);
      const res = await fetch(`${API_BASE}/wallet/transactions/${address}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { transactions } = await res.json();
      renderTransactions(transactions || [], filter);
    } catch (err) {
      console.error('[ERRO] loadTransactions:', err);
      fullTransactionList.innerHTML = 
        `<div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro ao carregar transações</p>
          <small>${err.message}</small>
        </div>`;
    }
  }

  // Renderiza todas as transações (sem limite)
  function renderTransactions(transactions, filter) {
    console.log(`[DEBUG] Renderizando ${transactions.length} txs, filtro=${filter}`);
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
      fullTransactionList.innerHTML = 
        `<div class="empty-state">
          <i class="fas fa-exchange-alt"></i>
          <p>Nenhuma transação ${filter === 'all' ? '' : filter === 'received' ? 'recebida' : 'enviada'} encontrada</p>
        </div>`;
      return;
    }

    list.forEach(tx => {
      const isReceived = tx.baseType === 'received';
      const dateFmt = tx.date ? formatDateTime(tx.date) : '—';
      const amountFmt = (isReceived ? '+' : '-') + parseFloat(tx.amount).toFixed(4);
      const iconDir = isReceived ? 'down' : 'up';
      const label = isReceived ? 'Recebido' : 'Enviado';
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
    window.location.href = 'import.html';
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
  
  // Marca o item de navegação ativo
  navItems.forEach(i =>
    i.dataset.page === 'transactions' ? i.classList.add('active') : i.classList.remove('active')
  );

  // Carrega tudo
  loadTransactions();
  console.log('[DEBUG] Página de transações inicializada');
});
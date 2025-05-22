const API_BASE = 'https://sunaryum.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  // Verificação de autenticação centralizada
  const walletData = getWalletData();
  if (!walletData) {
    redirectToLogin();
    return;
  }

  const address = walletData.address;
  console.log('[DEBUG] Endereço da carteira:', address);

  // Elementos da UI
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const refreshBalanceBtn = document.getElementById('refreshBalance');
  const balanceAmountEl = document.querySelector('.balance-amount .amount');
  const balanceCurrencyEl = document.querySelector('.balance-amount .currency');
  const balanceFiatEl = document.querySelector('.balance-fiat');
  const transactionListEl = document.querySelector('.transaction-list');
  const logoutBtn = document.getElementById('logoutBtn');
  const sendBtn = document.getElementById('sendBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const navItems = document.querySelectorAll('.nav-item');
  
  // Elementos do Modal
  const sendModal = document.getElementById('sendModal');
  const closeModal = document.querySelector('.close-modal');
  const sendForm = document.getElementById('sendForm');
  const recipientAddress = document.getElementById('recipientAddress');
  const sendAmount = document.getElementById('sendAmount');

  // Exibe o endereço encurtado
  walletAddressEl.textContent = shortenAddress(address);

  // Funções auxiliares
  function getWalletData() {
    try {
      const data = localStorage.getItem('walletData');
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      if (!parsed?.address) {
        localStorage.removeItem('walletData');
        return null;
      }
      return parsed;
    } catch (e) {
      localStorage.removeItem('walletData');
      return null;
    }
  }

  function redirectToLogin() {
    localStorage.removeItem('walletData');
    if (!window.location.pathname.includes('import.html')) {
      window.location.href = 'import.html';
    }
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  }

  function shortenAddress(addr, chars = 4) {
    return `${addr.substring(0, chars + 2)}...${addr.substring(addr.length - chars)}`;
  }

  // Sistema de logout reformulado
  logoutBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('walletData');
      window.location.href = 'main.html';
      window.location.reload();
    }
  });

  // Atualiza o dashboard
  async function updateDashboard() {
    try {
      console.log('[DEBUG] Buscando saldo para:', address);
      const balanceRes = await fetch(`${API_BASE}/wallet/balance/${address}`);
      
      if (!balanceRes.ok) {
        throw new Error(`Erro HTTP ao buscar saldo: ${balanceRes.status}`);
      }

      const balanceData = await balanceRes.json();
      console.log('[DEBUG] Dados do saldo:', balanceData);

      const balance = balanceData.total_balance != null
  ? balanceData.total_balance
  : (balanceData.confirmed_balance || 0);
      balanceAmountEl.textContent = parseFloat(balance).toFixed(4);
      balanceCurrencyEl.textContent = 'SUN';

      const conversionRate = 20;
      balanceFiatEl.textContent = `≈ ${(balance * conversionRate).toFixed(2)} KW`;

      console.log('[DEBUG] Buscando transações para:', address);
      const txRes = await fetch(`${API_BASE}/wallet/transactions/${address}`);
      
      if (!txRes.ok) {
        throw new Error(`Erro HTTP ao buscar transações: ${txRes.status}`);
      }

      const txData = await txRes.json();
      console.log('[DEBUG] Dados das transações:', txData);

      const transactions = txData.transactions || txData || [];
      renderTransactions(transactions);

      if (balance === 0 && transactions.length > 0) {
        const calculatedBalance = transactions.reduce((total, tx) => {
          return tx.type === 'received' ? total + tx.amount : total - tx.amount;
        }, 0);
        
        if (calculatedBalance > 0) {
          balanceAmountEl.textContent = calculatedBalance.toFixed(4);
          balanceFiatEl.textContent = `≈ ${(calculatedBalance * conversionRate).toFixed(2)} KW`;
        }
      }
    } catch (err) {
      console.error('[ERRO] Erro ao atualizar dashboard:', err);
      alert('Erro ao buscar dados da carteira. Detalhes no console.');
    }
  }

  // Renderiza transações
  function renderTransactions(transactions, limit = 3) {
    transactionListEl.innerHTML = '';
    
    const list = transactions
      .map(tx => {
        const raw = (tx.type||'').toLowerCase();
        const baseType = raw.split(/[\s(]/)[0] === 'sent' ? 'sent' : 'received';
        // se quiser, extrai status: pending ou confirmed
        const status  = raw.includes('pending') ? 'pending' : 'confirmed';
        return { ...tx, baseType, status };
      })
      .slice(0, limit);
  
    list.forEach(tx => {
      const isReceived = tx.baseType === 'received';
      const iconDir   = isReceived ? 'down' : 'up';
      const sign      = isReceived ? '+' : '-';
      const label     = isReceived ? 'Recebido' : 'Enviado';
      const dateFmt   = formatDate(tx.date);
  
      const wrapper = document.createElement('div');
      wrapper.className = `transaction-item ${tx.baseType} ${tx.status}`;
  
      wrapper.innerHTML = `
        <div class="transaction-icon">
          <i class="fas fa-arrow-${iconDir}"></i>
        </div>
        <div class="transaction-details">
          <div class="transaction-meta">
            <span class="transaction-type">${label}${tx.status==='pending'?' (pendente)':''}</span>
            <span class="transaction-date">${dateFmt}</span>
          </div>
          <div class="transaction-amount">
            ${sign}${parseFloat(tx.amount).toFixed(4)} SUN
          </div>
        </div>
      `;
      transactionListEl.appendChild(wrapper);
    });
  }
  
  // Função para enviar transação (extraída para melhor organização)
  async function sendTransaction(recipient, amount) {
    try {
      const walletData = JSON.parse(localStorage.getItem('walletData'));
      if (!walletData) {
        throw new Error('Carteira não autenticada');
      }
  
      // Verificação rigorosa da chave privada
      if (!walletData.private_key || !/^[0-9a-fA-F]{64}$/.test(walletData.private_key)) {
        throw new Error('Chave privada inválida no armazenamento local');
      }
  
      // Prepara os dados da transação
      const txData = {
        sender: walletData.address,
        recipient: recipient,
        amount: parseFloat(amount),
        private_key: walletData.private_key
      };
  
      console.log('[DEBUG] Enviando transação:', txData);
  
      const response = await fetch(`${API_BASE}/transaction/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }
  
      return await response.json();
    } catch (err) {
      console.error('[ERRO] Falha ao enviar transação:', err);
      throw err;
    }
  }

  // Event Listeners
  copyAddressBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        const originalText = copyAddressBtn.innerHTML;
        copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyAddressBtn.innerHTML = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error('[ERRO] Falha ao copiar endereço:', err);
        alert('Falha ao copiar endereço.');
      });
  });

  refreshBalanceBtn.addEventListener('click', updateDashboard);

  viewAllBtn.addEventListener('click', () => {
    window.location.href = 'transactions.html';
  });

  // Navegação entre páginas
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      if (page !== 'dashboard') {
        window.location.href = `${page}.html`;
      }
    });
  });

  // Modal de envio
  sendBtn.addEventListener('click', () => {
    sendModal.style.display = 'block';
  });

  closeModal.addEventListener('click', () => {
    sendModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === sendModal) {
      sendModal.style.display = 'none';
    }
  });

  // Envio de transação - versão melhorada
  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipient = recipientAddress.value.trim();
    const amount = parseFloat(sendAmount.value);
  
    if (!recipient || isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido e um endereço de destino.');
      return;
    }
  
    const submitBtn = sendForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
  
    try {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
      submitBtn.disabled = true;
  
      // Dados que serão enviados para o backend
      const payload = {
        sender: walletData.address,
        recipient: recipient,
        amount: amount,
        private_key: walletData.private_key
      };
  
      console.log('[DEBUG] Dados que serão enviados na transação:', payload);
  
      // Agora sim chama a função que faz o fetch
      const result = await sendTransaction(payload.recipient, payload.amount);
  
      alert(`Transação enviada com sucesso!\nTXID: ${result.txid}`);
      sendModal.style.display = 'none';
      sendForm.reset();
  
      await updateDashboard();
    } catch (err) {
      console.error('[ERRO] Falha ao enviar transação:', err);
      alert(`Falha ao enviar transação: ${err.message}`);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Inicialização
  updateDashboard();
});
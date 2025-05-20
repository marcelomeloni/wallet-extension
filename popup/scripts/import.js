document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('importBtn');
  const seedInput = document.getElementById('seedInput');
  const importStatus = document.getElementById('importStatus');
  const goToDashboardBtn = document.getElementById('goToDashboardBtn');

  importBtn.addEventListener('click', async () => {
      const seed = seedInput.value.trim();

      if (!seed || seed.split(' ').length !== 12) {
          importStatus.textContent = 'Please enter a valid 12-word seed phrase.';
          return;
      }

      importStatus.textContent = 'Importing...';

      try {
          const res = await fetch('https://sunaryum.onrender.com', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mnemonic: seed })
          });

          if (!res.ok) {
              throw new Error('Server responded with an error.');
          }

          const data = await res.json();

          // Agora que temos a variável data declarada, podemos usá-la
          const walletData = {
              address: data.address,
              public_key: data.public_key,
              private_key: data.private_key,  // CUIDADO: Armazenar chave privada não é seguro para produção
              mnemonic: data.mnemonic
          };

          // Armazene TUDO no localStorage de forma consistente
          localStorage.setItem('walletData', JSON.stringify(walletData));

          importStatus.innerHTML = `
  <span style="color: #00ff88;">
    ✅ Wallet imported!<br>
    Address: <strong>${data.address}</strong><br>
    Public Key: <strong>${data.public_key}</strong>
  </span>
`;

          // Mostra botão para ir ao dashboard
          goToDashboardBtn.classList.remove('hidden');

      } catch (error) {
          console.error(error);
          importStatus.textContent = 'Failed to import wallet. Check your seed phrase.';
      }
  });

  // Redireciona para o dashboard
  goToDashboardBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
  });
});
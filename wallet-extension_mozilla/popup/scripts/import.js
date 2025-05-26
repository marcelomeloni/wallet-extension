importBtn.addEventListener('click', async () => {
  const seed = seedInput.value.trim();

  if (!seed || seed.split(' ').length !== 12) {
      importStatus.textContent = 'Please enter a valid 12-word seed phrase.';
      return;
  }

  importStatus.textContent = 'Importing...';

  try {
      const res = await fetch('http://localhost:5000/wallet/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic: seed })
      });

      if (!res.ok) {
          throw new Error('Server responded with an error.');
      }

      const data = await res.json();
      goToDashboardBtn.addEventListener('click', () => {
        window.location.href = 'main.html';  // Ou o caminho correto do seu dashboard
    });
    
      // ✅ Função que armazena address, public_key e private_key
      async function storeWalletData(data) {
          const walletData = {
              address: data.address,
              public_key: data.public_key,
              private_key: data.private_key
          };

          localStorage.setItem('walletData', JSON.stringify(walletData));

          if (typeof browser !== 'undefined' && browser.storage) {
              await browser.storage.local.set({ walletData });
          }
      }

      // ✅ Usa somente essa função agora
      await storeWalletData(data);

      importStatus.innerHTML = `
          <span style="color: #00ff88;">
              ✅ Wallet imported!<br>
          </span>
      `;

      goToDashboardBtn.classList.remove('hidden');

  } catch (error) {
      console.error(error);
      importStatus.textContent = 'Failed to import wallet. Check your seed phrase.';
  }
});

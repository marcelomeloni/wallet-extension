document.getElementById('confirmConnect').addEventListener('click', async () => {
  try {
    // Recupera dados de duas fontes possíveis
    const walletData = await getWalletData();
    
    // Envia os dados para a página web
    browser.runtime.sendMessage({
      action: "walletConnected",
      data: walletData
    });
    
    window.close();
  } catch (error) {
    console.error('Connection error:', error);
  }
});

async function getWalletData() {
  // Tenta primeiro do localStorage (importação via web)
  const localData = localStorage.getItem('walletData');
  if (localData) return JSON.parse(localData);

  // Se não encontrar, tenta da API de armazenamento da extensão
  const result = await browser.storage.local.get('walletData');
  return result.walletData;
}
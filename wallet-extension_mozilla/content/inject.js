// Comunicação: recebe clique da página
window.addEventListener('message', (event) => {
  if (event.data.type === 'OPEN_WALLET_CONNECT') {
      browser.runtime.sendMessage({ action: "openConnectWindow" });
  }
});

// Comunicação: recebe da extensão
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "walletDataUpdate") {
      window.postMessage({
          type: 'WALLET_CONNECTED',
          data: msg.data
      }, '*');
  }
});

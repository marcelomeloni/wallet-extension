browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "openConnectWindow") {
    browser.windows.create({
      url: browser.runtime.getURL("popup/connect.html"),
      type: "popup",
      width: 400,
      height: 600
    });
  }

  if (request.action === "walletConnected") {
    // Armazena localmente na extensão
    browser.storage.local.set({walletData: request.data});
    
    // Envia para todas as tabs
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, {
          action: "walletDataUpdate",
          data: request.data
        });
      });
    });
  }
});
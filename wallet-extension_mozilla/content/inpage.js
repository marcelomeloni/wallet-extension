(() => {
    window.sunaryumWallet = {
      isInstalled: () => true, // Se o inpage.js está injetado, a wallet está "instalada"
  
      connect: () => {
        return new Promise((resolve, reject) => {
          function handleResponse(event) {
            if (event.source !== window) return;
            if (event.data.type === 'SUNARYUM_CONNECT_RESPONSE') {
              window.removeEventListener('message', handleResponse);
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve({
                  publicKey: event.data.publicKey,
                  address: event.data.address
                });
              }
            }
          }
  
          window.addEventListener('message', handleResponse);
  
          console.log('[inpage.js] Enviando SUNARYUM_CONNECT_REQUEST');
          window.postMessage({ type: 'SUNARYUM_CONNECT_REQUEST' }, '*');
        });
      }
    };
  })();
  
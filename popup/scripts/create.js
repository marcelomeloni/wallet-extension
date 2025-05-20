const state = {
  currentStep: 1,
  isSeedVisible: false,
  generated: false
};

const elements = {
  generateSeedBtn: document.getElementById('generateSeedBtn'),
  toggleVisibilityBtn: document.getElementById('toggleVisibilityBtn'),
  copySeedBtn: document.getElementById('copySeedBtn'),
  continueBtn: document.getElementById('continueBtn'),
  seedPhraseGrid: document.getElementById('seedPhraseGrid'),
  seedPhrase: document.getElementById('seedPhrase')
};

let walletData = null;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  elements.generateSeedBtn.addEventListener('click', generateSeedPhrase);
  elements.toggleVisibilityBtn.addEventListener('click', toggleSeedVisibility);
  elements.copySeedBtn.addEventListener('click', copySeedPhrase);
  elements.continueBtn.addEventListener('click', handleWalletCreation);
}

async function generateSeedPhrase() {
  try {
    // Botão em estado de carregamento
    elements.generateSeedBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zM6 12c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6z" fill="currentColor"/>
      </svg>
      Generating...
    `;

    const res = await fetch('http://localhost:5000/wallet/new');
    if (!res.ok) throw new Error('Server response error');
    
    walletData = await res.json();

    renderSeedPhrase(walletData.mnemonic);

  
    // Resetar botão
    elements.generateSeedBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
      </svg>
      Generate New
    `;
    state.generated = true;
    updateUIState()
  } catch (error) {
    console.error('Seed generation error:', error);
    showError('Falha na conexão com o servidor');

    elements.generateSeedBtn.textContent = 'Erro - Tente novamente';

    // Voltar ao botão padrão após alguns segundos
    setTimeout(() => {
      elements.generateSeedBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
        </svg>
        Generate New
      `;
    }, 2000);
  }
}


function renderSeedPhrase(mnemonic) {
  elements.seedPhraseGrid.innerHTML = mnemonic
    .split(' ')
    .map((word, index) => `
      <div class="seed-word" data-word="${word}">
        <span class="word-index">${index + 1}</span>
        <span class="word-content">${'•'.repeat(word.length)}</span>
      </div>
    `).join('');
}

function toggleSeedVisibility() {
  state.isSeedVisible = !state.isSeedVisible;
  updateVisibilityUI();
  toggleSeedWords();
}

function updateVisibilityUI() {
  const icon = elements.toggleVisibilityBtn.querySelector('svg');
  elements.toggleVisibilityBtn.querySelector('span').textContent = 
    state.isSeedVisible ? 'Hide Phrase' : 'Show Phrase';

  // Update eye icon
  icon.innerHTML = state.isSeedVisible ? 
    '<path d="M12 6.5c2.76 0 5 2.24 5 5 0 .51-.1 1-.24 1.46l3.06 3.06c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l2.17 2.17c.47-.14.96-.24 1.47-.24zM2.71 3.16c-.39.39-.39 1.02 0 1.41l1.97 1.97C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.97-.3 4.31-.82l2.72 2.72c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L4.13 3.16c-.39-.39-1.03-.39-1.42 0zM12 16.5c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07L14.14 16c-.64.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z" fill="currentColor"/>' : 
    '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>';
}

function toggleSeedWords() {
  const words = document.querySelectorAll('.seed-word');
  words.forEach(word => {
    const content = word.querySelector('.word-content');
    if (state.isSeedVisible) {
      content.textContent = word.dataset.word;
      content.classList.add('visible');
    } else {
      content.textContent = '•'.repeat(word.dataset.word.length);
      content.classList.remove('visible');
    }
  });
}

function copySeedPhrase() {
  if (!walletData) return;
  
  navigator.clipboard.writeText(walletData.mnemonic)
    .then(() => {
      // Show copied feedback
      const originalText = elements.copySeedBtn.querySelector('span').textContent;
      elements.copySeedBtn.querySelector('span').textContent = 'Copied!';
      elements.copySeedBtn.disabled = true;
      
      setTimeout(() => {
        elements.copySeedBtn.querySelector('span').textContent = originalText;
        elements.copySeedBtn.disabled = false;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
    });
}

function updateUIState() {
  elements.copySeedBtn.disabled = !state.generated;
  elements.continueBtn.disabled = !state.generated;
}

async function handleWalletCreation() {
 
    // Show loading state
    elements.continueBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zM6 12c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6z" fill="currentColor"/>
      </svg>
      Securing Wallet...
    `;
    
    // Simulate saving to storage (replace with actual storage code)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show completion screen
    document.querySelector('.creation-container').innerHTML = `
      <div class="success-state">
        <div class="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
          </svg>
        </div>
        <h2>Wallet Created Successfully!</h2>
        <p>Your wallet is now secure with the recovery phrase you saved.</p>
        <button class="btn-primary" onclick="window.close()">
          Done
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 17L15 12L10 7V17Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    `;
    
    // Update progress steps
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });
    document.querySelector('.step[data-step="3"]').classList.add('active');
    
  }

function showError(message) {
  alert(message);
}

// Animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);
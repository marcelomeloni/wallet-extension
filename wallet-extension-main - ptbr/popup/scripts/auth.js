// auth.js
export function isAuthenticated() {
    try {
        const data = localStorage.getItem('walletData');
        return !!data && !!JSON.parse(data)?.address;
    } catch {
        return false;
    }
}

export function getWalletData() {
    return isAuthenticated() ? JSON.parse(localStorage.getItem('walletData')) : null;
}

export function logout() {
    localStorage.removeItem('walletData');
    window.location.href = 'main.html';
}
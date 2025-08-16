import { LabApp } from './app.js';
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance for button callbacks
    window.app = new LabApp();
});
// Handle session expiry
setInterval(() => {
    if (window.app) {
        const session = JSON.parse(localStorage.getItem('labSession') || 'null');
        if (session && new Date() >= new Date(session.expiryTime)) {
            localStorage.removeItem('labSession');
            location.reload();
        }
    }
}, 60000); // Check every minute
//# sourceMappingURL=main.js.map
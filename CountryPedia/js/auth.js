/* =============================================
   auth.js — Login / Register (Dummy System)
   ============================================= */

   const Auth = (() => {
    const overlay = document.getElementById('auth-overlay');
    const app = document.getElementById('app');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    const navUsername = document.getElementById('nav-username');
  
    let currentUser = null;
  
    // ---- Tab switching ----
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    document.querySelectorAll('[data-switch]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(link.dataset.switch);
      });
    });
  
    function switchTab(tab) {
      authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      loginForm.classList.toggle('active', tab === 'login');
      registerForm.classList.toggle('active', tab === 'register');
    }
  
    // ---- Login ----
    document.getElementById('login-btn').addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      if (!email || !pass) {
        alert('Please fill in all fields.');
        return;
      }
      const name = email.split('@')[0];
      loginUser({ name, email });
    });
  
    // ---- Register ----
    document.getElementById('register-btn').addEventListener('click', () => {
      const fname = document.getElementById('reg-fname').value.trim();
      const lname = document.getElementById('reg-lname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-password').value;
      if (!fname || !lname || !email || !pass) {
        alert('Please fill in all required fields.');
        return;
      }
      loginUser({ name: `${fname} ${lname}`, email });
    });
  
    // ---- Logout ----
    document.getElementById('logout-btn').addEventListener('click', () => {
      currentUser = null;
      app.classList.add('hidden');
      overlay.classList.remove('fade-out');
      overlay.classList.add('active');
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      switchTab('login');
    });
  
    // ---- Helpers ----
    function loginUser(user) {
      currentUser = user;
      // FIX: Removed emoji icon from username display
      navUsername.textContent = user.name;
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.classList.remove('active');
        app.classList.remove('hidden');
        window.dispatchEvent(new Event('app:ready'));
      }, 400);
    }
  
    function getUser() { return currentUser; }
  
    return { getUser };
  })();
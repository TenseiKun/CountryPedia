import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const Auth = (() => {
  const overlay = document.getElementById('auth-overlay');
  const app = document.getElementById('app');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authTabs = document.querySelectorAll('.auth-tab');
  const navUsername = document.getElementById('nav-username');

  //switch between login and register tabs
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  document.querySelectorAll('[data-switch]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.switch);
    });
  });

  //toggle active class on tabs and show the matching form
  function switchTab(tab) {
    authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    loginForm.classList.toggle('active', tab === 'login');
    registerForm.classList.toggle('active', tab === 'register');
  }

  //convert firebase error codes to readable messages
  function getFriendlyError(code) {
    switch (code) {
      case 'auth/user-not-found':         return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':          return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':      return 'Invalid email or password. Please check and try again.';
      case 'auth/invalid-email':           return 'Please enter a valid email address.';
      case 'auth/user-disabled':           return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':       return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/email-already-in-use':    return 'An account with this email already exists. Try logging in instead.';
      case 'auth/weak-password':           return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed':  return 'Network error. Please check your internet connection.';
      default:                             return 'Something went wrong. Please try again.';
    }
  }

  //inject a red error message above the submit button
  function showError(formId, message) {
    const existing = document.querySelector(`#${formId} .auth-error`);
    if (existing) existing.remove(); //remove previous error first
    const err = document.createElement('p');
    err.className = 'auth-error';
    err.textContent = message;
    const btn = document.querySelector(`#${formId} .btn-primary`);
    btn.insertAdjacentElement('beforebegin', err);
  }

  function clearError(formId) {
    const existing = document.querySelector(`#${formId} .auth-error`);
    if (existing) existing.remove();
  }

  //handle login button click
  document.getElementById('login-btn').addEventListener('click', async () => {
    clearError('login-form');
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    if (!email || !pass) {
      showError('login-form', 'Please fill in all fields.');
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      loginUser(userCred.user);
    } catch (err) {
      showError('login-form', getFriendlyError(err.code));
    }
  });

  //handle register button click
  document.getElementById('register-btn').addEventListener('click', async () => {
    clearError('register-form');
    const fname = document.getElementById('reg-fname').value.trim();
    const lname = document.getElementById('reg-lname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (!fname || !lname || !email || !pass) {
      showError('register-form', 'Please fill in all required fields.');
      return;
    }
    if (pass.length < 6) {
      showError('register-form', 'Password must be at least 6 characters.');
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCred.user, { displayName: `${fname} ${lname}` }); //save full name
      loginUser(userCred.user);
    } catch (err) {
      showError('register-form', getFriendlyError(err.code));
    }
  });

  //handle logout button click
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut(auth);
    app.classList.add('hidden');
    overlay.classList.remove('fade-out');
    overlay.classList.add('active'); //show the auth screen again
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    clearError('login-form');
    clearError('register-form');
    switchTab('login');
  });

  //auto-login if user refreshes while session is still active
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginUser(user);
    }
  });

  //hide auth overlay and show the app after login
  function loginUser(user) {
    navUsername.textContent = user.displayName || user.email.split('@')[0]; //show name or email prefix
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.classList.remove('active');
      app.classList.remove('hidden');
      window.dispatchEvent(new Event('app:ready')); //signal app to initialize
    }, 400);
  }

  function getUser() { return auth.currentUser; }

  return { getUser };
})();
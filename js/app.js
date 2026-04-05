/* =============================================
   app.js — Main app orchestration + page routing
   ============================================= */

   const Pages = (() => {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
  
    function show(pageId) {
      pages.forEach(p => {
        const isActive = p.id === `page-${pageId}`;
        // FIX: Remove .hidden class (which has !important display:none) before toggling
        p.classList.remove('hidden');
        p.classList.toggle('active', isActive);
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
      });
    }
  
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        show(link.dataset.page);
      });
    });
  
    return { show };
  })();
  
  // ---- App Init (runs once when auth completes) ----
  let appInitialized = false;
  window.addEventListener('app:ready', async () => {
    if (appInitialized) return;
    appInitialized = true;
    Pages.show('home');
    await Countries.init();
  });
const Pages = (() => {
  const pages = document.querySelectorAll('.page'); //all page sections
  const navLinks = document.querySelectorAll('.nav-link'); //all nav buttons

  //show a page by its id, hide the rest
  function show(pageId) {
    pages.forEach(p => {
      const isActive = p.id === `page-${pageId}`;
      p.classList.remove('hidden');
      p.classList.toggle('active', isActive);
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId); //highlight current nav link
    });
    window.dispatchEvent(new CustomEvent('page:show', { detail: pageId })); //notify other modules
  }

  //wire up nav link clicks to page switching
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      show(link.dataset.page);
    });
  });

  return { show };
})();

window.Pages = Pages; //expose to other scripts
//runs once after firebase auth confirms the user is logged in
let appInitialized = false;
window.addEventListener('app:ready', async () => {
  if (appInitialized) return; //prevent running twice
  appInitialized = true;
  Pages.show('home'); //default to home page
  await Countries.init(); //load countries and auto-detect location
});
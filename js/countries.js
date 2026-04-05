/* =============================================
   countries.js — Country data + dropdown + time
   ============================================= */

const Countries = (() => {
  const REST_BASE = 'https://restcountries.com/v3.1';
  const TIME_BASE = 'https://time.now/api/timezone/';

  let allCountries = [];
  let selectedCountry = null;
  let timeInterval = null;

  // DOM refs
  const selectDisplay = document.getElementById('select-display');
  const selectFlag = document.getElementById('select-flag');
  const selectText = document.getElementById('select-text');
  const customDropdown = document.getElementById('custom-dropdown');
  const dropdownSearch = document.getElementById('dropdown-search');
  const dropdownList = document.getElementById('dropdown-list');
  const timeDisplay = document.getElementById('time-display');
  const tzLabel = document.getElementById('timezone-label');

  // ---- Load all countries ----
  async function loadAll() {
    try {
      const res = await fetch(`${REST_BASE}/all?fields=name,flags,cca2,region,capital`);
      if (!res.ok) throw new Error('Failed to load countries');
      const data = await res.json();
      allCountries = data.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );
      buildDropdown(allCountries);
      populateRegisterSelect(allCountries);
    } catch (err) {
      console.error('Error loading countries:', err);
    }
  }

  // ---- Build dropdown ----
  function buildDropdown(countries) {
    dropdownList.innerHTML = '';
    if (countries.length === 0) {
      const li = document.createElement('li');
      li.className = 'dropdown-item no-match';
      li.textContent = 'No countries found';
      dropdownList.appendChild(li);
      return;
    }
    countries.forEach(c => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      if (selectedCountry && selectedCountry.cca2 === c.cca2) li.classList.add('selected');
      li.dataset.code = c.cca2;
      li.innerHTML = `
        <img src="${c.flags?.png || ''}" alt="${c.name.common}" loading="lazy" />
        ${c.name.common}
      `;
      li.addEventListener('click', () => selectCountry(c.cca2));
      dropdownList.appendChild(li);
    });
  }

  // ---- Populate register country select ----
  function populateRegisterSelect(countries) {
    const sel = document.getElementById('reg-country');
    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.cca2;
      opt.textContent = c.name.common;
      sel.appendChild(opt);
    });
  }

  // ---- Dropdown open/close ----
  selectDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !customDropdown.classList.contains('hidden');
    if (isOpen) closeDropdown();
    else openDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!document.getElementById('country-select-wrapper').contains(e.target)) {
      closeDropdown();
    }
  });

  function openDropdown() {
    customDropdown.classList.remove('hidden');
    selectDisplay.classList.add('open');
    dropdownSearch.value = '';
    buildDropdown(allCountries);
    dropdownSearch.focus();
    // Scroll to selected
    const sel = dropdownList.querySelector('.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function closeDropdown() {
    customDropdown.classList.add('hidden');
    selectDisplay.classList.remove('open');
  }

  // ---- Search filter ----
  dropdownSearch.addEventListener('input', () => {
    const q = dropdownSearch.value.trim().toLowerCase();
    const filtered = allCountries.filter(c =>
      c.name.common.toLowerCase().includes(q)
    );
    buildDropdown(filtered);
  });

  dropdownSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // ---- Select a country ----
  async function selectCountry(cca2) {
    closeDropdown();
    const basic = allCountries.find(c => c.cca2 === cca2);
    if (!basic) return;

    // Update display
    selectFlag.src = basic.flags?.png || '';
    selectFlag.alt = basic.name.common;
    selectFlag.classList.remove('hidden');
    selectText.textContent = basic.name.common;
    selectedCountry = basic;

    // Mark selected in list
    document.querySelectorAll('.dropdown-item').forEach(li => {
      li.classList.toggle('selected', li.dataset.code === cca2);
    });

    // Fetch full data
    const full = await fetchCountry(cca2);
    if (full) {
      selectedCountry = full;
      window.dispatchEvent(new CustomEvent('country:selected', { detail: full }));
      updateWorldTime(full);
    }
  }

  // ---- Fetch full country data ----
  async function fetchCountry(cca2) {
    try {
      const res = await fetch(`${REST_BASE}/alpha/${cca2}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      console.error('Error fetching country:', err);
      return null;
    }
  }

  // ---- World time ----
  async function updateWorldTime(country) {
    if (timeInterval) clearInterval(timeInterval);
    const timezones = country.timezones || [];
    if (!timezones.length) {
      timeDisplay.textContent = 'N/A';
      tzLabel.textContent = '';
      return;
    }
    const tz = timezones[0]; // Use first timezone
    tzLabel.textContent = tz;

    function tick() {
      try {
        // Parse UTC offset like UTC+08:00 or UTC-05:00
        const match = tz.match(/UTC([+-]\d{2}):?(\d{2})?/);
        if (match) {
          const sign = match[1][0] === '+' ? 1 : -1;
          const hours = parseInt(match[1].slice(1)) * sign;
          const minutes = parseInt(match[2] || '0') * sign;
          const now = new Date();
          const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
          const localMs = utcMs + (hours * 3600000) + (minutes * 60000);
          const d = new Date(localMs);
          timeDisplay.textContent = d.toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
          });
        } else if (tz === 'UTC') {
          const d = new Date();
          timeDisplay.textContent = d.toUTCString().split(' ')[4];
        }
      } catch {
        timeDisplay.textContent = '--:--';
      }
    }
    tick();
    timeInterval = setInterval(tick, 1000);
  }

  // ---- Auto-detect location country ----
  async function detectDefaultCountry() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.country_code) return data.country_code;
    } catch {
      // fallback
    }
    return 'PH'; // fallback to Philippines (user's location)
  }

  // ---- Get selected country ----
  function getSelected() { return selectedCountry; }

  // ---- Init ----
  async function init() {
    await loadAll();
    const defaultCode = await detectDefaultCountry();
    await selectCountry(defaultCode);
  }

  return { init, selectCountry, getSelected, fetchCountry };
})();

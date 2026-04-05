/* =============================================
   home.js — Country info card rendering
   ============================================= */

   const Home = (() => {
    const placeholder = document.getElementById('home-placeholder');
    const card = document.getElementById('country-card');
  
    function formatNumber(n) {
      if (!n) return 'N/A';
      return Number(n).toLocaleString();
    }
  
    function getCurrencies(c) {
      if (!c.currencies) return 'N/A';
      return Object.values(c.currencies)
        .map(cur => `${cur.name} (${cur.symbol || '?'})`)
        .join(', ');
    }
  
    function getLanguages(c) {
      if (!c.languages) return 'N/A';
      return Object.values(c.languages).join(', ');
    }
  
    function getDemonyms(c) {
      if (!c.demonyms?.eng) return 'N/A';
      return c.demonyms.eng.m || 'N/A';
    }
  
    function getCallingCodes(c) {
      if (!c.idd?.root) return 'N/A';
      const suffixes = c.idd.suffixes || [''];
      return suffixes.slice(0, 3).map(s => `${c.idd.root}${s}`).join(', ');
    }
  
    function renderBorderChips(borders) {
      if (!borders || borders.length === 0) return '<span style="color:var(--text-3);font-size:0.85rem">No land borders</span>';
      return borders.map(b =>
        `<button class="border-chip" data-code="${b}">${b}</button>`
      ).join('');
    }
  
    function renderTLDs(tlds) {
      if (!tlds || tlds.length === 0) return 'N/A';
      return tlds.map(t => `<span class="tld-tag">${t}</span>`).join('');
    }
  
    function renderTimezones(tz) {
      if (!tz || tz.length === 0) return 'N/A';
      return tz.map(t => `<span class="tz-chip">${t}</span>`).join('');
    }
  
    function renderCard(c) {
      placeholder.classList.add('hidden');
      card.classList.remove('hidden');
  
      const officialName = c.name?.official !== c.name?.common
        ? `<p class="country-official-name">Official: ${c.name.official}</p>`
        : '';
  
      const coatSrc = c.coatOfArms?.png;
      const coatImg = coatSrc
        ? `<img class="coat-of-arms" src="${coatSrc}" alt="Coat of Arms" title="Coat of Arms" />`
        : '';
  
      const mapsLink = c.maps?.googleMaps || '#';
      const area = c.area ? `${formatNumber(c.area)} km²` : 'N/A';
      const pop = formatNumber(c.population);
      // FIX: Removed all emoji from rendered HTML — using plain text labels
      const isUN = c.unMember ? 'UN Member' : 'Not UN Member';
      const isLandlocked = c.landlocked ? 'Landlocked' : 'Coastal';
  
      card.innerHTML = `
        <!-- HERO -->
        <div class="country-hero">
          <div class="country-hero-info">
            <h1>${c.name.common}</h1>
            ${officialName}
            <div class="country-badges">
              <span class="badge badge-region">${c.region || 'N/A'}${c.subregion ? ' · ' + c.subregion : ''}</span>
              <span class="badge badge-capital">${c.capital?.[0] || 'N/A'}</span>
              <span class="badge badge-pop">${pop}</span>
              ${c.independent ? '<span class="badge badge-independent">Independent</span>' : ''}
            </div>
            <a href="${mapsLink}" target="_blank" rel="noopener" class="map-link">
              Open in Google Maps
            </a>
          </div>
          <div class="country-flag-wrap">
            <img
              class="country-flag"
              src="${c.flags?.png || ''}"
              alt="Flag of ${c.name.common}"
              title="${c.flags?.alt || 'Flag of ' + c.name.common}"
            />
            ${coatImg}
          </div>
        </div>
  
        <!-- INFO GRID -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-label">Region</div>
            <div class="info-card-value">${c.region || 'N/A'}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Subregion</div>
            <div class="info-card-value">${c.subregion || 'N/A'}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Population</div>
            <div class="info-card-value large">${pop}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Area</div>
            <div class="info-card-value large">${area}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Currencies</div>
            <div class="info-card-value">${getCurrencies(c)}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Languages</div>
            <div class="info-card-value">${getLanguages(c)}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Calling Code</div>
            <div class="info-card-value">${getCallingCodes(c)}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Demonym</div>
            <div class="info-card-value">${getDemonyms(c)}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Driving Side</div>
            <div class="info-card-value">${c.car?.side ? c.car.side.charAt(0).toUpperCase() + c.car.side.slice(1) : 'N/A'}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Start of Week</div>
            <div class="info-card-value">${c.startOfWeek ? c.startOfWeek.charAt(0).toUpperCase() + c.startOfWeek.slice(1) : 'N/A'}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Status</div>
            <div class="info-card-value">${isUN} · ${isLandlocked}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">Country Codes</div>
            <div class="info-card-value">${c.cca2 || ''} / ${c.cca3 || ''}</div>
          </div>
        </div>
  
        <!-- BORDERS -->
        <div class="section-heading">Bordering Countries</div>
        <div class="borders-row">${renderBorderChips(c.borders)}</div>
  
        <!-- TLDs -->
        <div class="section-heading">Top-Level Domains</div>
        <div class="tld-row">${renderTLDs(c.tld)}</div>
  
        <!-- TIMEZONES -->
        <div class="section-heading">Timezones</div>
        <div class="timezones-list">${renderTimezones(c.timezones)}</div>
      `;
  
      // Border chip click → navigate to that country
      card.querySelectorAll('.border-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          Countries.selectCountry(btn.dataset.code);
          Pages.show('home');
        });
      });
    }
  
    function showLoading() {
      placeholder.classList.add('hidden');
      card.classList.remove('hidden');
      card.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching country data…</p>
        </div>
      `;
    }
  
    window.addEventListener('country:selected', (e) => {
      renderCard(e.detail);
    });
  
    window.addEventListener('country:loading', () => showLoading());
  
    return { renderCard, showLoading };
  })();
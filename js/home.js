const Home = (() => {
  const placeholder = document.getElementById('home-placeholder');
  const card = document.getElementById('country-card');

  //format a number with commas (e.g. 1000000 → 1,000,000)
  function formatNumber(n) {
    if (!n) return 'N/A';
    return Number(n).toLocaleString();
  }

  //get currency name and symbol from the country object
  function getCurrencies(c) {
    if (!c.currencies) return 'N/A';
    return Object.values(c.currencies)
      .map(cur => `${cur.name} (${cur.symbol || '?'})`)
      .join(', ');
  }

  //get comma-separated list of languages
  function getLanguages(c) {
    if (!c.languages) return 'N/A';
    return Object.values(c.languages).join(', ');
  }

  //get the English male demonym (e.g. Filipino, American)
  function getDemonyms(c) {
    if (!c.demonyms?.eng) return 'N/A';
    return c.demonyms.eng.m || 'N/A';
  }

  //build calling codes like +63, +1 from root and suffixes
  function getCallingCodes(c) {
    if (!c.idd?.root) return 'N/A';
    const suffixes = c.idd.suffixes || [''];
    return suffixes.slice(0, 3).map(s => `${c.idd.root}${s}`).join(', ');
  }

  //render clickable border country buttons or a "no borders" label
  function renderBorderChips(borders) {
    if (!borders || borders.length === 0) return '<span style="color:var(--text-3);font-size:0.85rem">No land borders</span>';
    return borders.map(b =>
      `<button class="border-chip" data-code="${b}">${b}</button>`
    ).join('');
  }

  //render top-level domains as monospace tags
  function renderTLDs(tlds) {
    if (!tlds || tlds.length === 0) return 'N/A';
    return tlds.map(t => `<span class="tld-tag">${t}</span>`).join('');
  }

  //render timezone strings as orange chips
  function renderTimezones(tz) {
    if (!tz || tz.length === 0) return 'N/A';
    return tz.map(t => `<span class="tz-chip">${t}</span>`).join('');
  }

  //build and insert the full country info card HTML
  function renderCard(c) {
    placeholder.classList.add('hidden');
    card.classList.remove('hidden');
    const officialName = c.name?.official !== c.name?.common
      ? `<p class="country-official-name">Official: ${c.name.official}</p>`
      : '';
    const coatSrc = c.coatOfArms?.png;
    const coatImg = coatSrc
      ? `<img class="coat-of-arms" src="${coatSrc}" alt="Coat of Arms" title="Coat of Arms"/>`
      : '';
    const mapsLink = c.maps?.googleMaps || '#';
    const area = c.area ? `${formatNumber(c.area)} km²` : 'N/A';
    const pop = formatNumber(c.population);
    const isUN = c.unMember ? 'UN Member' : 'Not UN Member';
    const isLandlocked = c.landlocked ? 'Landlocked' : 'Coastal';
    card.innerHTML = `
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
          <a href="${mapsLink}" target="_blank" rel="noopener" class="map-link">Open in Google Maps</a>
        </div>
        <div class="country-flag-wrap">
          <img class="country-flag" src="${c.flags?.png || ''}" alt="Flag of ${c.name.common}" title="${c.flags?.alt || 'Flag of ' + c.name.common}"/>
          ${coatImg}
        </div>
      </div>
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
      <div class="section-heading">Bordering Countries</div>
      <div class="borders-row">${renderBorderChips(c.borders)}</div>
      <div class="section-heading">Top-Level Domains</div>
      <div class="tld-row">${renderTLDs(c.tld)}</div>
      <div class="section-heading">Timezones</div>
      <div class="timezones-list">${renderTimezones(c.timezones)}</div>
    `;
    //clicking a border chip navigates to that neighboring country
    card.querySelectorAll('.border-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        Countries.selectCountry(btn.dataset.code);
        Pages.show('home');
      });
    });
  }

  //show a loading spinner while country data is being fetched
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

  //listen for country selection event to render the card
  window.addEventListener('country:selected', (e) => {
    renderCard(e.detail);
  });

  window.addEventListener('country:loading', () => showLoading());

  return { renderCard, showLoading };
})();

window.Home = Home;
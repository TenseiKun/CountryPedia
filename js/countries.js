const Countries = (() => {
  const REST_BASE = 'https://restcountries.com/v3.1';
  const TIMEAPI_BASE = 'https://timeapi.io/api';

  let allCountries = []; //full list of countries from the API
  let selectedCountry = null; //currently selected country object
  let timeInterval = null; //interval for the live clock tick
  let timeSession = 0; //incremented on each new country to cancel old clock

  //maps country code to IANA timezone for the clock feature
  const TIMEZONE_MAP = {
    AF: 'Asia/Kabul',
    AL: 'Europe/Tirane',
    DZ: 'Africa/Algiers',
    AD: 'Europe/Andorra',
    AO: 'Africa/Luanda',
    AG: 'America/Antigua',
    AR: 'America/Argentina/Buenos_Aires',
    AM: 'Asia/Yerevan',
    AU: 'Australia/Canberra',
    AT: 'Europe/Vienna',
    AZ: 'Asia/Baku',
    BS: 'America/Nassau',
    BH: 'Asia/Bahrain',
    BD: 'Asia/Dhaka',
    BB: 'America/Barbados',
    BY: 'Europe/Minsk',
    BE: 'Europe/Brussels',
    BZ: 'America/Belize',
    BJ: 'Africa/Porto-Novo',
    BT: 'Asia/Thimphu',
    BO: 'America/La_Paz',
    BA: 'Europe/Sarajevo',
    BW: 'Africa/Gaborone',
    BR: 'America/Sao_Paulo',
    BN: 'Asia/Brunei',
    BG: 'Europe/Sofia',
    BF: 'Africa/Ouagadougou',
    BI: 'Africa/Bujumbura',
    CV: 'Atlantic/Cape_Verde',
    KH: 'Asia/Phnom_Penh',
    CM: 'Africa/Douala',
    CA: 'America/Toronto',
    CF: 'Africa/Bangui',
    TD: 'Africa/Ndjamena',
    CL: 'America/Santiago',
    CN: 'Asia/Shanghai',
    CO: 'America/Bogota',
    KM: 'Indian/Comoro',
    CD: 'Africa/Kinshasa',
    CG: 'Africa/Brazzaville',
    CR: 'America/Costa_Rica',
    HR: 'Europe/Zagreb',
    CU: 'America/Havana',
    CY: 'Asia/Nicosia',
    CZ: 'Europe/Prague',
    DK: 'Europe/Copenhagen',
    DJ: 'Africa/Djibouti',
    DM: 'America/Dominica',
    DO: 'America/Santo_Domingo',
    EC: 'America/Guayaquil',
    EG: 'Africa/Cairo',
    SV: 'America/El_Salvador',
    GQ: 'Africa/Malabo',
    ER: 'Africa/Asmara',
    EE: 'Europe/Tallinn',
    SZ: 'Africa/Mbabane',
    ET: 'Africa/Addis_Ababa',
    FJ: 'Pacific/Fiji',
    FI: 'Europe/Helsinki',
    FR: 'Europe/Paris',
    GA: 'Africa/Libreville',
    GM: 'Africa/Banjul',
    GE: 'Asia/Tbilisi',
    DE: 'Europe/Berlin',
    GH: 'Africa/Accra',
    GR: 'Europe/Athens',
    GD: 'America/Grenada',
    GT: 'America/Guatemala',
    GN: 'Africa/Conakry',
    GW: 'Africa/Bissau',
    GY: 'America/Guyana',
    HT: 'America/Port-au-Prince',
    HN: 'America/Tegucigalpa',
    HU: 'Europe/Budapest',
    IS: 'Atlantic/Reykjavik',
    IN: 'Asia/Kolkata',
    ID: 'Asia/Jakarta',
    IR: 'Asia/Tehran',
    IQ: 'Asia/Baghdad',
    IE: 'Europe/Dublin',
    IL: 'Asia/Jerusalem',
    IT: 'Europe/Rome',
    JM: 'America/Jamaica',
    JP: 'Asia/Tokyo',
    JO: 'Asia/Amman',
    KZ: 'Asia/Almaty',
    KE: 'Africa/Nairobi',
    KI: 'Pacific/Tarawa',
    KP: 'Asia/Pyongyang',
    KR: 'Asia/Seoul',
    KW: 'Asia/Kuwait',
    KG: 'Asia/Bishkek',
    LA: 'Asia/Vientiane',
    LV: 'Europe/Riga',
    LB: 'Asia/Beirut',
    LS: 'Africa/Maseru',
    LR: 'Africa/Monrovia',
    LY: 'Africa/Tripoli',
    LI: 'Europe/Vaduz',
    LT: 'Europe/Vilnius',
    LU: 'Europe/Luxembourg',
    MG: 'Indian/Antananarivo',
    MW: 'Africa/Blantyre',
    MY: 'Asia/Kuala_Lumpur',
    MV: 'Indian/Maldives',
    ML: 'Africa/Bamako',
    MT: 'Europe/Malta',
    MH: 'Pacific/Majuro',
    MR: 'Africa/Nouakchott',
    MU: 'Indian/Mauritius',
    MX: 'America/Mexico_City',
    FM: 'Pacific/Pohnpei',
    MD: 'Europe/Chisinau',
    MC: 'Europe/Monaco',
    MN: 'Asia/Ulaanbaatar',
    ME: 'Europe/Podgorica',
    MA: 'Africa/Casablanca',
    MZ: 'Africa/Maputo',
    MM: 'Asia/Rangoon',
    NA: 'Africa/Windhoek',
    NR: 'Pacific/Nauru',
    NP: 'Asia/Kathmandu',
    NL: 'Europe/Amsterdam',
    NZ: 'Pacific/Auckland',
    NI: 'America/Managua',
    NE: 'Africa/Niamey',
    NG: 'Africa/Lagos',
    MK: 'Europe/Skopje',
    NO: 'Europe/Oslo',
    OM: 'Asia/Muscat',
    PK: 'Asia/Karachi',
    PW: 'Pacific/Palau',
    PA: 'America/Panama',
    PG: 'Pacific/Port_Moresby',
    PY: 'America/Asuncion',
    PE: 'America/Lima',
    PH: 'Asia/Manila',
    PL: 'Europe/Warsaw',
    PT: 'Europe/Lisbon',
    QA: 'Asia/Qatar',
    RO: 'Europe/Bucharest',
    RU: 'Europe/Moscow',
    RW: 'Africa/Kigali',
    KN: 'America/St_Kitts',
    LC: 'America/St_Lucia',
    VC: 'America/St_Vincent',
    WS: 'Pacific/Apia',
    SM: 'Europe/San_Marino',
    ST: 'Africa/Sao_Tome',
    SA: 'Asia/Riyadh',
    SN: 'Africa/Dakar',
    RS: 'Europe/Belgrade',
    SC: 'Indian/Mahe',
    SL: 'Africa/Freetown',
    SG: 'Asia/Singapore',
    SK: 'Europe/Bratislava',
    SI: 'Europe/Ljubljana',
    SB: 'Pacific/Guadalcanal',
    SO: 'Africa/Mogadishu',
    ZA: 'Africa/Johannesburg',
    SS: 'Africa/Juba',
    ES: 'Europe/Madrid',
    LK: 'Asia/Colombo',
    SD: 'Africa/Khartoum',
    SR: 'America/Paramaribo',
    SE: 'Europe/Stockholm',
    CH: 'Europe/Zurich',
    SY: 'Asia/Damascus',
    TW: 'Asia/Taipei',
    TJ: 'Asia/Dushanbe',
    TZ: 'Africa/Dar_es_Salaam',
    TH: 'Asia/Bangkok',
    TL: 'Asia/Dili',
    TG: 'Africa/Lome',
    TO: 'Pacific/Tongatapu',
    TT: 'America/Port_of_Spain',
    TN: 'Africa/Tunis',
    TR: 'Europe/Istanbul',
    TM: 'Asia/Ashgabat',
    TV: 'Pacific/Funafuti',
    UG: 'Africa/Kampala',
    UA: 'Europe/Kiev',
    AE: 'Asia/Dubai',
    GB: 'Europe/London',
    US: 'America/Washington',
    UY: 'America/Montevideo',
    UZ: 'Asia/Tashkent',
    VU: 'Pacific/Efate',
    VE: 'America/Caracas',
    VN: 'Asia/Ho_Chi_Minh',
    YE: 'Asia/Aden',
    ZM: 'Africa/Lusaka',
    ZW: 'Africa/Harare',
    PS: 'Asia/Gaza',
    XK: 'Europe/Belgrade',
    VA: 'Europe/Vatican',
    CK: 'Pacific/Rarotonga',
    NU: 'Pacific/Niue',
    TK: 'Pacific/Fakaofo',
    WF: 'Pacific/Wallis',
    PF: 'Pacific/Tahiti',
    NC: 'Pacific/Noumea',
    GF: 'America/Cayenne',
    GP: 'America/Guadeloupe',
    MQ: 'America/Martinique',
    RE: 'Indian/Reunion',
    YT: 'Indian/Mayotte',
    PM: 'America/Miquelon',
    AW: 'America/Aruba',
    CW: 'America/Curacao',
    SX: 'America/Lower_Princes',
    BQ: 'America/Kralendijk',
    MF: 'America/Marigot',
    BL: 'America/St_Barthelemy',
    AI: 'America/Anguilla',
    VG: 'America/Tortola',
    VI: 'America/St_Thomas',
    TC: 'America/Grand_Turk',
    KY: 'America/Cayman',
    MS: 'America/Montserrat',
    PR: 'America/Puerto_Rico',
    GU: 'Pacific/Guam',
    MP: 'Pacific/Saipan',
    AS: 'Pacific/Pago_Pago',
    UM: 'Pacific/Johnston',
    FK: 'Atlantic/Stanley',
    GI: 'Europe/Gibraltar',
    JE: 'Europe/Jersey',
    GG: 'Europe/Guernsey',
    IM: 'Europe/Isle_of_Man',
    AX: 'Europe/Mariehamn',
    FO: 'Atlantic/Faroe',
    GL: 'America/Godthab',
    SJ: 'Arctic/Longyearbyen',
    EH: 'Africa/El_Aaiun',
    IO: 'Indian/Chagos',
    SH: 'Atlantic/St_Helena',
    AC: 'Atlantic/St_Helena',
    TA: 'Atlantic/St_Helena',
    PN: 'Pacific/Pitcairn',
    NF: 'Pacific/Norfolk',
    CX: 'Indian/Christmas',
    CC: 'Indian/Cocos',
    HM: 'Indian/Kerguelen',
    TF: 'Indian/Kerguelen',
    AQ: 'Antarctica/McMurdo',
  };

  //DOM refs for the dropdown UI
  const selectDisplay = document.getElementById('select-display');
  const selectFlag = document.getElementById('select-flag');
  const selectText = document.getElementById('select-text');
  const customDropdown = document.getElementById('custom-dropdown');
  const dropdownSearch = document.getElementById('dropdown-search');
  const dropdownList = document.getElementById('dropdown-list');
  const timeDisplay = document.getElementById('time-display');
  const tzLabel = document.getElementById('timezone-label');

  //fetch all countries and populate the dropdown
  async function loadAll() {
    try {
      const res = await fetch(`${REST_BASE}/all?fields=name,flags,cca2,region,capital`);
      if (!res.ok) throw new Error('Failed to load countries');
      const data = await res.json();
      allCountries = data.sort((a, b) =>
        a.name.common.localeCompare(b.name.common) //alphabetical sort
      );
      buildDropdown(allCountries);
      populateRegisterSelect(allCountries);
    } catch (err) {
      console.error('Error loading countries:', err);
    }
  }

  //render the list items inside the dropdown
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
        <img src="${c.flags?.png || ''}" alt="${c.name.common}" loading="lazy"/>
        ${c.name.common}
      `;
      li.addEventListener('click', () => selectCountry(c.cca2));
      dropdownList.appendChild(li);
    });
  }

  //fill the optional country <select> on the register form if it exists
  function populateRegisterSelect(countries) {
    const sel = document.getElementById('reg-country');
    if (!sel) return;
    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.cca2;
      opt.textContent = c.name.common;
      sel.appendChild(opt);
    });
  }

  //toggle dropdown open/close when the display is clicked
  selectDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !customDropdown.classList.contains('hidden');
    if (isOpen) closeDropdown();
    else openDropdown();
  });

  //close dropdown when clicking outside of it
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
    const sel = dropdownList.querySelector('.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' }); //scroll to currently selected item
  }

  function closeDropdown() {
    customDropdown.classList.add('hidden');
    selectDisplay.classList.remove('open');
  }

  //filter the dropdown list as the user types
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

  //fetch full country data and dispatch selection event
  async function selectCountry(cca2) {
    closeDropdown();
    const basic = allCountries.find(c => c.cca2 === cca2);
    if (!basic) return;
    selectFlag.src = basic.flags?.png || '';
    selectFlag.alt = basic.name.common;
    selectFlag.classList.remove('hidden');
    selectText.textContent = basic.name.common;
    selectedCountry = basic;
    document.querySelectorAll('.dropdown-item').forEach(li => {
      li.classList.toggle('selected', li.dataset.code === cca2); //mark selected in list
    });
    updateWorldTime(cca2); //start the clock for this country
    const full = await fetchCountry(cca2); //get all fields for the info card
    if (full) {
      selectedCountry = full;
      window.dispatchEvent(new CustomEvent('country:selected', { detail: full }));
    }
  }

  //fetch the full country details by country code
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

  //fetch current time from timeapi.io and start a local tick interval
  async function updateWorldTime(cca2) {
    if (timeInterval) clearInterval(timeInterval); //stop previous clock
    timeInterval = null;
    const session = ++timeSession; //unique session to prevent old clocks from updating
    const ianaZone = TIMEZONE_MAP[cca2];
    if (!ianaZone) {
      timeDisplay.textContent = 'N/A';
      tzLabel.textContent = 'No timezone data';
      return;
    }
    tzLabel.textContent = ianaZone;
    timeDisplay.textContent = 'Loading…';
    try {
      const res = await fetch(
        `${TIMEAPI_BASE}/time/current/zone?timeZone=${encodeURIComponent(ianaZone)}`
      );
      if (!res.ok) throw new Error(`TimeAPI error: ${res.status}`);
      if (session !== timeSession) return; //country changed while fetching, abort
      const data = await res.json();
      let baseSeconds =
        data.hour * 3600 +
        data.minute * 60 +
        data.seconds +
        (data.milliSeconds || 0) / 1000;
      const fetchedAt = Date.now();
      //tick every second using local elapsed time to avoid drift
      function tick() {
        if (session !== timeSession) return;
        const elapsed = (Date.now() - fetchedAt) / 1000;
        let total = (baseSeconds + elapsed) % 86400;
        if (total < 0) total += 86400;
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = Math.floor(total % 60);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        timeDisplay.textContent = `${hour12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`;
      }
      tick();
      timeInterval = setInterval(tick, 1000);
    } catch (err) {
      if (session !== timeSession) return;
      console.error('TimeAPI error:', err);
      timeDisplay.textContent = '--:--';
      tzLabel.textContent = ianaZone;
    }
  }

  //try to detect the user's country via IP geolocation, fall back to PH
  async function detectDefaultCountry() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.country_code) return data.country_code;
    } catch {
      //silently fall back
    }
    return 'PH';
  }

  function getSelected() { return selectedCountry; }

  //entry point: load all countries then auto-select the user's detected country
  async function init() {
    await loadAll();
    const defaultCode = await detectDefaultCountry();
    await selectCountry(defaultCode);
  }

  return { init, selectCountry, getSelected, fetchCountry };
})();

window.Countries = Countries;
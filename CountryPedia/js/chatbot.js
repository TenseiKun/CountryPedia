/* =============================================
   chatbot.js — Gemini-powered country chatbot
   ============================================= */

   const Chatbot = (() => {
    const GEMINI_KEY = 'AIzaSyACGUCPSBdiDX6WpiqbltBVSVr14mbOJuA';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_KEY}`;
  
    const messagesEl = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const subtitleEl = document.getElementById('chatbot-subtitle');
    const suggestionBar = document.getElementById('chat-suggestion-bar');
  
    let conversationHistory = [];
    let currentCountry = null;
  
    const SUGGESTIONS_BASE = [
      'What is the history of this country?',
      'What are famous foods here?',
      'What is the climate like?',
      'What are tourist attractions?',
      'What is the economy like?',
      'Tell me about the culture',
    ];
  
    // ---- Update on country change ----
    window.addEventListener('country:selected', (e) => {
      currentCountry = e.detail;
      const name = currentCountry.name?.common || 'this country';
      subtitleEl.textContent = `Powered by Gemini · Currently exploring: ${name}`;
      renderSuggestions(name);
      showSuggestionMessage(name);
    });
  
    function showSuggestionMessage(name) {
      addBubble('bot', `You want to know about <strong>${name}</strong>? Ask me anything — history, culture, food, travel tips, economy, and more!`);
    }
  
    function renderSuggestions(countryName) {
      suggestionBar.innerHTML = '';
      const pills = [
        `Tell me about ${countryName}`,
        ...SUGGESTIONS_BASE.slice(0, 4)
      ];
      pills.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-pill';
        btn.textContent = text;
        btn.addEventListener('click', () => {
          inputEl.value = text;
          sendMessage();
        });
        suggestionBar.appendChild(btn);
      });
    }
  
    // ---- Send message ----
    async function sendMessage() {
      const msg = inputEl.value.trim();
      if (!msg) return;
      if (sendBtn.disabled) return;
  
      inputEl.value = '';
      inputEl.style.height = 'auto';
      addBubble('user', escapeHtml(msg));
  
      sendBtn.disabled = true;
      const typingEl = showTyping();
  
      const countryContext = currentCountry
        ? `The user is currently exploring ${currentCountry.name?.common} (${currentCountry.name?.official}), located in ${currentCountry.region}, subregion: ${currentCountry.subregion}. Capital: ${currentCountry.capital?.[0] || 'N/A'}. Population: ${currentCountry.population?.toLocaleString() || 'N/A'}. Use this as context for your answers. Be friendly, informative, and concise.`
        : 'No country selected yet. Be helpful about general world geography.';
  
      conversationHistory.push({ role: 'user', parts: [{ text: msg }] });
  
      try {
        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `You are CountryPedia's friendly country expert chatbot. ${countryContext}` }]
            },
            contents: conversationHistory,
            generationConfig: { maxOutputTokens: 512, temperature: 0.8 }
          })
        });
  
        if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
  
        conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
        typingEl.remove();
        addBubble('bot', formatReply(reply));
      } catch (err) {
        typingEl.remove();
        addBubble('bot', `Error: ${err.message}. Please try again.`);
        conversationHistory.pop();
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }
  
    // ---- UI helpers ----
    function addBubble(role, html) {
      const div = document.createElement('div');
      div.className = `chat-bubble ${role}`;
      // FIX: Replaced emoji avatars with short text labels
      const avatarLabel = role === 'bot' ? 'AI' : 'You';
      div.innerHTML = `
        <span class="bubble-avatar">${avatarLabel}</span>
        <div class="bubble-content">${html}</div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }
  
    function showTyping() {
      const div = document.createElement('div');
      div.className = 'chat-bubble bot';
      // FIX: Replaced emoji avatar with text label
      div.innerHTML = `
        <span class="bubble-avatar">AI</span>
        <div class="bubble-content">
          <div class="chat-typing">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }
  
    function formatReply(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }
  
    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  
    // ---- Event listeners ----
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });
  
    return {};
  })();
import { auth, db } from './firebase.js';
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const Chatbot = (() => {
  const GEMINI_KEY = '';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  const messagesEl = document.getElementById('chat-messages');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const subtitleEl = document.getElementById('chatbot-subtitle');
  const suggestionBar = document.getElementById('chat-suggestion-bar');

  let conversationHistory = []; //full chat history sent to Gemini each time
  let currentCountry = null; //currently selected country object
  let chatLog = []; //messages saved to Firestore
  let currentUserId = null; //logged-in user's UID

  //default quick-question suggestions
  const SUGGESTIONS_BASE = [
    'What is the history of this country?',
    'What are famous foods here?',
    'What is the climate like?',
    'What are tourist attractions?',
    'What is the economy like?',
    'Tell me about the culture',
  ];

  //save the current chat log to Firestore under the user's UID
  async function saveChatLog() {
    if (!currentUserId) {
      console.warn('saveChatLog called but no user is logged in.');
      return;
    }
    try {
      const ref = doc(db, 'chats', currentUserId);
      await setDoc(ref, {
        messages: chatLog,
        lastUpdated: new Date().toISOString()
      });
      console.log('Chat saved. Total messages:', chatLog.length);
    } catch (err) {
      console.error('Failed to save chat log:', err.code, err.message);
    }
  }

  //load saved chat history from Firestore and render it
  async function loadChatLog(uid) {
    try {
      const ref = doc(db, 'chats', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        chatLog = snap.data().messages || [];
        console.log('Chat history loaded:', chatLog.length, 'messages');
        messagesEl.innerHTML = '';
        chatLog.forEach(entry => {
          addBubble(
            entry.role,
            entry.role === 'user' ? escapeHtml(entry.text) : formatReply(entry.text)
          );
        });
        //rebuild Gemini conversation history from saved messages
        conversationHistory = chatLog
          .filter(e => e.role === 'user' || e.role === 'bot')
          .map(e => ({
            role: e.role === 'bot' ? 'model' : 'user',
            parts: [{ text: e.text }]
          }));
      } else {
        console.log('No chat history found — starting fresh.');
        chatLog = [];
        conversationHistory = [];
        messagesEl.innerHTML = `
          <div class="chat-bubble bot">
            <span class="bubble-avatar">AI</span>
            <div class="bubble-content">Hello! Select a country and ask me anything about it. I'm here to help!</div>
          </div>
        `;
      }
    } catch (err) {
      console.error('Failed to load chat log:', err.code, err.message);
    }
  }

  //reload chat history whenever auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      await loadChatLog(user.uid);
    } else {
      //reset everything on logout
      currentUserId = null;
      chatLog = [];
      conversationHistory = [];
      messagesEl.innerHTML = `
        <div class="chat-bubble bot">
          <span class="bubble-avatar">AI</span>
          <div class="bubble-content">Hello! Select a country and ask me anything about it. I'm here to help!</div>
        </div>
      `;
    }
  });

  //update subtitle and suggestions when a country is selected
  window.addEventListener('country:selected', (e) => {
    currentCountry = e.detail;
    const name = currentCountry.name?.common || 'this country';
    subtitleEl.textContent = `Powered by Gemini · Currently exploring: ${name}`;
    renderSuggestions(name);
    showSuggestionMessage(name);
  });

  //add a bot bubble prompting the user to ask about the new country
  function showSuggestionMessage(name) {
    addBubble('bot', `You want to know about <strong>${name}</strong>? Ask me anything — history, culture, food, travel tips, economy, and more!`);
  }

  //render clickable suggestion pills for the selected country
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
        sendMessage(); //auto-send the suggestion
      });
      suggestionBar.appendChild(btn);
    });
  }

  //send the user's message to Gemini and display the reply
  async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg || sendBtn.disabled) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    addBubble('user', escapeHtml(msg));
    const userEntry = {
      role: 'user',
      text: msg,
      country: currentCountry?.name?.common || null,
      timestamp: new Date().toISOString()
    };
    chatLog.push(userEntry);
    sendBtn.disabled = true;
    const typingEl = showTyping(); //show animated dots while waiting

    //build context string so Gemini knows which country is being discussed
    const countryContext = currentCountry
      ? `The user is currently exploring ${currentCountry.name?.common} (${currentCountry.name?.official}), located in ${currentCountry.region}, subregion: ${currentCountry.subregion}. Capital: ${currentCountry.capital?.[0] || 'N/A'}. Population: ${currentCountry.population?.toLocaleString() || 'N/A'}. Use this as context. Be friendly, informative, and concise.`
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
          contents: conversationHistory, //send full history for context
          generationConfig: { maxOutputTokens: 512, temperature: 0.8 }
        })
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Gemini error ${res.status}: ${errBody?.error?.message || 'Unknown'}`);
      }
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
      conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
      typingEl.remove();
      addBubble('bot', formatReply(reply));
      chatLog.push({
        role: 'bot',
        text: reply,
        country: currentCountry?.name?.common || null,
        timestamp: new Date().toISOString()
      });
      await saveChatLog(); //persist both user + bot messages
    } catch (err) {
      typingEl.remove();
      addBubble('bot', `Error: ${err.message}. Please try again.`);
      chatLog.pop(); //roll back the failed user message
      conversationHistory.pop();
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  //create and append a chat bubble to the message list
  function addBubble(role, html) {
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    div.innerHTML = `
      <span class="bubble-avatar">${role === 'bot' ? 'AI' : 'You'}</span>
      <div class="bubble-content">${html}</div>
    `;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight; //scroll to latest message
    return div;
  }

  //show the three-dot typing animation while waiting for Gemini
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot';
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

  //convert markdown-like text to basic HTML for display
  function formatReply(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') //bold
      .replace(/\*(.+?)\*/g, '<em>$1</em>') //italic
      .replace(/\n{2,}/g, '</p><p>') //double newlines become paragraphs
      .replace(/\n/g, '<br />') //single newlines become line breaks
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  //escape user input to prevent XSS in chat bubbles
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); //send on Enter, allow Shift+Enter for new lines
    }
  });
  //auto-grow textarea as user types
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });

  return {};
})();
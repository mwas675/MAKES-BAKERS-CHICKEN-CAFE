/* ════════════════════════════════════════════════════════
   CRUNCH & BREW — script.js
   All interactivity: cursor, particles, scroll, chat AI
════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');

let mx = 0, my = 0;   // mouse position
let rx = 0, ry = 0;   // ring position (lags behind)

// Move dot cursor immediately on mousemove
document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

// Animate ring with lerp (smooth lag effect)
function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Expand cursor on hover over interactive elements
document.querySelectorAll('button, a, .menu-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '20px';
    cursor.style.height = '20px';
    ring.style.width    = '50px';
    ring.style.height   = '50px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '12px';
    cursor.style.height = '12px';
    ring.style.width    = '36px';
    ring.style.height   = '36px';
  });
});


/* ══════════════════════════════════════════════════════
   2. HERO PARTICLES
══════════════════════════════════════════════════════ */
const particleContainer = document.getElementById('particles');

for (let i = 0; i < 25; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left              = Math.random() * 100 + '%';
  p.style.animationDuration = (Math.random() * 6 + 5) + 's';
  p.style.animationDelay    = (Math.random() * 8) + 's';
  particleContainer.appendChild(p);
}


/* ══════════════════════════════════════════════════════
   3. SCROLL REVEAL  (Intersection Observer)
══════════════════════════════════════════════════════ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));


/* ══════════════════════════════════════════════════════
   4. 3D CARD TILT  (mouse-tracking perspective tilt)
══════════════════════════════════════════════════════ */
document.querySelectorAll('.menu-card').forEach(card => {

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = e.clientX - rect.left  - rect.width  / 2;
    const y    = e.clientY - rect.top   - rect.height / 2;
    const rotX = -(y / rect.height) * 10;   // pitch
    const rotY =  (x / rect.width)  * 10;   // yaw
    card.style.transform = `translateY(-12px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';  // reset to CSS default
  });
});


/* ══════════════════════════════════════════════════════
   5. AI CHAT ASSISTANT
   Powered by the Anthropic Claude API (claude-sonnet-4)
══════════════════════════════════════════════════════ */

/** Full knowledge of the restaurant for the AI */
const SYSTEM_PROMPT = `You are Brew Bot, the friendly and knowledgeable AI assistant for Crunch & Brew, a restaurant in Nairobi, Kenya that serves specialty coffee and legendary fried chicken.

MENU HIGHLIGHTS:

COFFEE:
- The Midnight Espresso (KSH 320): Triple-shot dark roast, notes of dark chocolate and smoked caramel
- Amber Latte (KSH 380): House espresso, steamed whole milk, brown sugar syrup, cinnamon
- 24hr Cold Brew (KSH 450): Steeped 24 hours, served over hand-chipped ice with salted cream float
- Pour Over (KSH 350): Single origin Nyeri beans, clean and bright
- Flat White (KSH 290): Double ristretto with micro-foamed milk

FRIED CHICKEN:
- Nashville Hot Thighs (KSH 850): Bone-in thighs, double-dredged, signature Nashville cayenne paste
- The Crunch Classic Sandwich (KSH 920): Crispy fillet, house pickles, gold sauce, slaw, brioche bun
- Loaded Brew Fries (KSH 620): Thick-cut fries, espresso salt, cheddar sauce, crispy chicken bits
- Crispy Wings x6 (KSH 720): Choice of Nashville Hot, Honey Garlic, or Classic
- Chicken Tenders x4 (KSH 680): Served with house dip

COMBOS:
- The Classic Combo (KSH 1,150): Crunch Classic + any coffee
- Hot & Bold (KSH 1,350): Nashville Hot Thighs + Cold Brew + Loaded Fries

ABOUT THE RESTAURANT:
- Open Mon–Fri 6am–10pm, Sat–Sun 7am–11pm
- Located in Westlands, Nairobi
- Free-range chicken, single origin coffee beans
- No frozen chicken, no pre-ground beans
- Phone: +254 700 123 456
- Allergens: contains dairy, no gluten-free options currently

Be warm, enthusiastic, knowledgeable and concise. Help customers choose meals, suggest pairings, answer allergen questions, and take note of preferences. If someone wants to order, encourage them to use the Order Now button. Keep responses under 120 words. Use occasional food emojis to be friendly but don't overdo it.`;

/** Stores the full conversation so the AI has memory within the session */
let conversationHistory = [];

/**
 * Toggle the chat panel open/closed.
 * Called by the FAB button's onclick.
 */
function toggleChat() {
  const panel = document.getElementById('chat-panel');
  panel.classList.toggle('open');
}

/** Returns the current time as "HH:MM AM/PM" */
function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Append a message bubble to the chat window.
 * @param {string} text  - The message content (may contain emoji).
 * @param {'bot'|'user'} role - Who sent it.
 */
function appendMessage(text, role) {
  const msgs = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="message-bubble">${text}</div>
    <div class="message-time">${getTime()}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;   // auto-scroll to latest
}

/** Show the animated 3-dot typing indicator while waiting for the API. */
function showTyping() {
  const msgs = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = 'message bot';
  div.id = 'typing';
  div.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/** Remove the typing indicator after the API responds. */
function removeTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

/**
 * Send a message to the Claude API and display the response.
 * @param {string} [customText] - Pre-filled text (used by quick-reply buttons).
 */
async function sendMessage(customText) {
  const input = document.getElementById('chat-input');
  const text  = customText || input.value.trim();
  if (!text) return;

  // Hide quick-reply buttons after the first interaction
  document.getElementById('quick-replies').style.display = 'none';

  // Show user bubble and clear input
  appendMessage(text, 'user');
  if (!customText) {
    input.value = '';
    input.style.height = 'auto';   // reset textarea height
  }

  // Append to conversation history for multi-turn memory
  conversationHistory.push({ role: 'user', content: text });

  showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    });

    const data  = await response.json();
    const reply = data.content?.[0]?.text
      || "Sorry, I'm having a moment! Please try again or call us at +254 700 123 456 🙏";

    removeTyping();
    conversationHistory.push({ role: 'assistant', content: reply });
    appendMessage(reply, 'bot');

  } catch (err) {
    removeTyping();
    appendMessage("Oops — looks like my connection dipped! Please try again or give us a call. ☕", 'bot');
    console.error('Chat API error:', err);
  }
}

/**
 * Shortcut used by the quick-reply button onclick handlers.
 * @param {string} text - The pre-set question to send.
 */
function sendQuick(text) {
  sendMessage(text);
}

/**
 * Allow pressing Enter (without Shift) to submit the chat message.
 * Shift+Enter inserts a newline as normal.
 * @param {KeyboardEvent} e
 */
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// Auto-expand the textarea as the user types
document.getElementById('chat-input').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

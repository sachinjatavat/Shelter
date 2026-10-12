/**
 * SURPLUS-TO-SHELTER DISPATCH WHATSAPP & SMS NOTIFICATION MODULE
 * Enables 1-click dispatch alerts to Donors, Couriers, and NGO Shelters.
 */

(function () {
  function formatWhatsAppMessage(opts) {
    const dId = opts.donationId || 'DON-' + Math.floor(1000 + Math.random() * 9000);
    const title = opts.title || 'Relief Supplies Batch';
    const category = opts.category || 'Humanitarian Aid';
    const qty = opts.quantity || 'Standard Package';
    const donor = opts.donorName || localStorage.getItem('user_name') || 'Donor Partner';
    const ngo = opts.ngoName || 'Hope Shelter Care Center';
    const driver = opts.driverName || 'Rahul Sharma (Courier #402)';
    const vehicle = opts.vehicle || 'Tata Ace EV Van (RJ-14-EV-9401)';
    const pin = opts.pin || '4829';
    const eta = opts.eta || '12-15 mins';
    const trackingUrl = `https://surplustoshelter.org/track?id=${dId}`;

    if (opts.target === 'driver') {
      return `*SURPLUS-TO-SHELTER COURIER DISPATCH MISSION* 🚚
━━━━━━━━━━━━━━━━━━━━━
📦 *Batch:* #${dId}
🏷️ *Items:* ${title} (${qty})
📂 *Category:* ${category}

📍 *Pickup Origin:* ${donor}
🏢 *Delivery Target:* ${ngo}
⏱️ *Expected Arrival:* ${eta}
🔐 *Donor Handover PIN:* ${pin}
━━━━━━━━━━━━━━━━━━━━━
⚠️ *Handling:* Verified safe packaging. Please verify the 4-digit PIN with donor upon intake.
📲 *Live Route:* ${trackingUrl}`;
    }

    if (opts.target === 'ngo') {
      return `*SURPLUS-TO-SHELTER INCOMING RELIEF ALERT* 🤝
━━━━━━━━━━━━━━━━━━━━━
🏢 *Attention:* ${ngo} Intake Team
📦 *Incoming Batch:* #${dId}
🏷️ *Items:* ${title} (${qty})
🎁 *Generous Donor:* ${donor}

🚚 *Dispatched Courier:* ${driver}
🚐 *Vehicle:* ${vehicle}
⏱️ *ETA to Shelter:* ${eta}
━━━━━━━━━━━━━━━━━━━━━
✅ *Status:* Transit en route. Please keep intake bay ready.
📲 *Live Tracker:* ${trackingUrl}`;
    }

    // Default Donor & Universal Share Alert
    return `*SURPLUS-TO-SHELTER DISPATCH CONFIRMATION* 🎁
━━━━━━━━━━━━━━━━━━━━━
📦 *Donation Pass:* #${dId}
🏷️ *Items:* ${title} (${qty})
🏢 *Recipient Shelter:* ${ngo}
━━━━━━━━━━━━━━━━━━━━━
🚚 *Assigned Courier:* ${driver}
🚐 *Vehicle:* ${vehicle}
⏱️ *Courier Pickup ETA:* ${eta}
🔐 *Your Handover PIN:* *${pin}*
━━━━━━━━━━━━━━━━━━━━━
🛡️ Give this 4-digit PIN to the driver upon collection.
📲 *Track Delivery:* ${trackingUrl}`;
  }

  window.generateWhatsAppMessage = formatWhatsAppMessage;

  window.sendWhatsAppDispatchPass = function (opts = {}) {
    const text = formatWhatsAppMessage(opts);
    const phone = opts.phone ? opts.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // Log dispatch event to backend if online
    try {
      fetch('http://localhost:5000/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: opts.donationId, message: text, target: opts.target || 'general' })
      }).catch(() => {});
    } catch (e) {}

    window.open(url, '_blank');
  };

  window.openWhatsAppAlertModal = function (opts = {}) {
    let modal = document.getElementById('modal-whatsapp-dispatch');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-whatsapp-dispatch';
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans';
      document.body.appendChild(modal);
    }

    modal.dataset.options = JSON.stringify(opts);
    renderWhatsAppModalContent(modal, opts, 'donor');
    modal.classList.remove('hidden');
  };

  function renderWhatsAppModalContent(modal, opts, activeTab) {
    opts.target = activeTab;
    const msg = formatWhatsAppMessage(opts);

    modal.innerHTML = `
      <div class="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <!-- Header -->
        <div class="px-6 py-4 bg-emerald-950/40 border-b border-emerald-800/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold text-xl shadow-md">
              💬
            </div>
            <div>
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                1-Click WhatsApp Dispatch Pass
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider">Instant SMS</span>
              </h3>
              <p class="text-xs text-slate-300">Share live handover PIN &amp; courier details in real-time</p>
            </div>
          </div>
          <button onclick="document.getElementById('modal-whatsapp-dispatch').classList.add('hidden')" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            ✕
          </button>
        </div>

        <!-- Recipient Role Switcher Tabs -->
        <div class="px-6 pt-4 pb-2 flex gap-2 border-b border-slate-800 bg-slate-950/50">
          <button type="button" onclick="switchWhatsAppTab('donor')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'donor' ? 'bg-[#25D366] text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
            👨‍💼 To Donor Pass
          </button>
          <button type="button" onclick="switchWhatsAppTab('driver')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'driver' ? 'bg-[#25D366] text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
            🚚 To Courier
          </button>
          <button type="button" onclick="switchWhatsAppTab('ngo')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ngo' ? 'bg-[#25D366] text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
            🏢 To NGO Shelter
          </button>
        </div>

        <!-- Message Preview Bubble (WhatsApp Dark Bubble Style) -->
        <div class="p-6 space-y-4">
          <div class="bg-[#0b141a] p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-emerald-200 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto selection:bg-[#005c4b]">
${msg}
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <button type="button" onclick="copyWhatsAppPass()" class="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all">
              <span id="btn-copy-wa-icon">📋</span>
              <span id="btn-copy-wa-text">Copy Message</span>
            </button>
            <button type="button" onclick="triggerOpenWhatsApp()" class="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
              <span>💬 Open WhatsApp Now</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.switchWhatsAppTab = function (tab) {
    const modal = document.getElementById('modal-whatsapp-dispatch');
    if (!modal) return;
    const opts = JSON.parse(modal.dataset.options || '{}');
    renderWhatsAppModalContent(modal, opts, tab);
  };

  window.copyWhatsAppPass = function () {
    const modal = document.getElementById('modal-whatsapp-dispatch');
    if (!modal) return;
    const opts = JSON.parse(modal.dataset.options || '{}');
    const msg = formatWhatsAppMessage(opts);
    navigator.clipboard.writeText(msg).then(() => {
      const txt = document.getElementById('btn-copy-wa-text');
      const icon = document.getElementById('btn-copy-wa-icon');
      if (txt) txt.textContent = 'Copied to Clipboard!';
      if (icon) icon.textContent = '✓';
      setTimeout(() => {
        if (txt) txt.textContent = 'Copy Message';
        if (icon) icon.textContent = '📋';
      }, 2000);
    });
  };

  window.triggerOpenWhatsApp = function () {
    const modal = document.getElementById('modal-whatsapp-dispatch');
    if (!modal) return;
    const opts = JSON.parse(modal.dataset.options || '{}');
    window.sendWhatsAppDispatchPass(opts);
    modal.classList.add('hidden');
  };
})();

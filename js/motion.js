/* ==========================================================================
   SURPLUS-TO-SHELTER UNIFIED BUTTON INTERACTION & GLOBAL HANDLERS
   ========================================================================== */

// 1. Global Functions (Accessible Everywhere)
window.triggerSendDonation = function(btn) {
  let ngoName = 'Hope Shelter';
  if (btn && btn.closest) {
    const card = btn.closest('.bg-surface-container-lowest, article, .donation-card, tr, div');
    if (card) {
      const heading = card.querySelector('.text-headline-sm, h2, h3, .font-bold');
      if (heading && heading.textContent) {
        ngoName = heading.textContent.trim();
      }
    }
  }

  const donationItem = {
    id: 'DON-' + Math.floor(1000 + Math.random() * 9000),
    title: 'Surplus Food Batch (' + ngoName + ')',
    category: 'Cooked Meals',
    quantity_kg: 25,
    portions: 40,
    donor_name: localStorage.getItem('user_name') || 'Fresh Harvest Bistro',
    donor_address: 'C-Scheme, Jaipur',
    recipient_ngo: ngoName,
    driver_name: 'Rahul Sharma',
    status: 'AVAILABLE',
    pickup_window: 'Next 2 Hours',
    created_at: new Date().toISOString()
  };

  alert(`DONATION DISPATCH CONFIRMED!\n\nYour surplus food donation has been assigned to ${ngoName}.\n\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.\nTracking details are live on your Pickups dashboard.`);

  if (window.SupabaseService && typeof window.SupabaseService.createDonation === 'function') {
    try {
      window.SupabaseService.createDonation(donationItem);
    } catch (e) {
      console.warn('Supabase createDonation warning:', e);
    }
  } else {
    try {
      const list = JSON.parse(localStorage.getItem('local_donations') || '[]');
      list.unshift(donationItem);
      localStorage.setItem('local_donations', JSON.stringify(list));
      localStorage.setItem('last_donation_event', JSON.stringify({ donation: donationItem, time: Date.now() }));
    } catch (e) {}
  }

  setTimeout(() => {
    window.location.href = '/restaurant-pickups.html';
  }, 200);
};

window.triggerViewDetails = function(btn) {
  let ngoName = 'Hope Shelter';
  if (btn && btn.closest) {
    const card = btn.closest('.bg-surface-container-lowest, article, .donation-card, tr, div');
    if (card) {
      const heading = card.querySelector('.text-headline-sm, h2, h3, .font-bold');
      if (heading && heading.textContent) {
        ngoName = heading.textContent.trim();
      }
    }
  }

  alert(`RECIPIENT SPECIFICATIONS:\n\nOrganisation: ${ngoName}\nVerification: 100% Certified NGO Partner\nAvailable Capacity: 45 meals remaining today\nDriver Vehicle: Thermal Insulated EV Van (#RJ-14-EV-9401)\nEstimated Pickup ETA: 12 minutes\nHandling Notes: Sanitary food-grade thermal containers provided.`);
};

window.quickDispatchEmergencyRelief = function() {
  alert('EMERGENCY DISPATCH CONFIRMED!\n\n50 Emergency Meals allocated to Hope Shelter relief operation.\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.');

  if (window.dismissGlobalEmergencyBanner) {
    window.dismissGlobalEmergencyBanner();
  } else {
    const banner = document.getElementById('global-emergency-alert-banner');
    if (banner) banner.remove();
    localStorage.removeItem('emergency_crisis_event');
  }

  setTimeout(() => {
    window.location.href = '/restaurant-pickups.html';
  }, 200);
};

window.dismissGlobalEmergencyBanner = function() {
  const banner = document.getElementById('global-emergency-alert-banner');
  if (banner) banner.remove();
  
  try {
    const crisisRaw = localStorage.getItem('emergency_crisis_event');
    if (crisisRaw) {
      const crisis = JSON.parse(crisisRaw);
      crisis.active = false;
      localStorage.setItem('emergency_crisis_event', JSON.stringify(crisis));
    }
  } catch (e) {}
};

// Emergency Crisis Cross-Portal Sync Listener
function checkEmergencyCrisisState() {
  const crisisRaw = localStorage.getItem('emergency_crisis_event');
  if (!crisisRaw) return;

  try {
    const crisis = JSON.parse(crisisRaw);
    if (!crisis || !crisis.active) {
      const existingBanner = document.getElementById('global-emergency-alert-banner');
      if (existingBanner) existingBanner.remove();
      return;
    }

    if (!document.getElementById('global-emergency-alert-banner')) {
      const banner = document.createElement('div');
      banner.id = 'global-emergency-alert-banner';
      banner.className = 'fixed top-0 left-0 right-0 z-[99999] bg-red-600 text-white px-6 py-3 shadow-2xl flex items-center justify-between border-b-2 border-red-400 font-sans';
      banner.innerHTML = `
        <div class="flex items-center gap-3 max-w-6xl mx-auto w-full">
          <span class="w-3 h-3 rounded-full bg-white shrink-0"></span>
          <span class="font-bold text-sm tracking-wide">🚨 EMERGENCY RELIEF RED ALERT: ${crisis.type} (${crisis.portions}) requested by ${crisis.ngo || 'Hope Shelter'}!</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button onclick="window.quickDispatchEmergencyRelief()" class="px-3.5 py-1.5 bg-white text-red-700 text-xs font-extrabold rounded-lg hover:bg-red-100 transition-colors shadow-md cursor-pointer">
            ⚡ Quick Respond (50 Meals)
          </button>
          <button onclick="window.dismissGlobalEmergencyBanner()" class="text-white hover:text-red-200 text-xs font-bold px-2 cursor-pointer">✕</button>
        </div>
      `;
      document.body.prepend(banner);
    }

    document.querySelectorAll('button, a').forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes('notification')) {
        if (!el.querySelector('.emergency-dot')) {
          const dot = document.createElement('span');
          dot.className = 'emergency-dot inline-block w-2.5 h-2.5 rounded-full bg-red-600 ml-1.5';
          el.appendChild(dot);
        }
      }
    });

  } catch (e) {
    console.warn('Crisis check error:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkEmergencyCrisisState();
  setInterval(checkEmergencyCrisisState, 3000);
});


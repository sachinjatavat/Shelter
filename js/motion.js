/* ==========================================================================
   SURPLUS-TO-SHELTER UNIFIED MOTION & GLOBAL BUTTON INTERACTION ENGINE
   ========================================================================== */

// 1. Global Functions (Accessible Everywhere)
window.triggerSendDonation = function(btn) {
  if (window.triggerConfettiBurst) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (btn && btn.getBoundingClientRect) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    window.triggerConfettiBurst(x, y);
  }

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

  alert(`🎉 DONATION DISPATCH CONFIRMED!\n\nYour surplus food donation has been assigned to ${ngoName}.\n\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.\nTracking details are live on your Pickups dashboard.`);

  if (window.SupabaseService) {
    window.SupabaseService.createDonation({
      title: 'Surplus Food Batch',
      recipient_ngo: ngoName,
      status: 'DISPATCHED'
    });
  }

  setTimeout(() => {
    window.location.href = '/restaurant-pickups.html';
  }, 600);
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

  alert(`📋 RECIPIENT SPECIFICATIONS:\n\nOrganisation: ${ngoName}\nVerification: 100% Certified NGO Partner\nAvailable Capacity: 45 meals remaining today\nDriver Vehicle: Thermal Insulated EV Van (#RJ-14-EV-9401)\nEstimated Pickup ETA: 12 minutes\nHandling Notes: Sanitary food-grade thermal containers provided.`);
};

window.quickDispatchEmergencyRelief = function() {
  if (window.triggerConfettiBurst) {
    window.triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);
  }
  alert('🎉 EMERGENCY DISPATCH CONFIRMED!\n\n50 Emergency Meals allocated to Hope Shelter relief operation.\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.');

  if (window.dismissGlobalEmergencyBanner) {
    window.dismissGlobalEmergencyBanner();
  } else {
    const banner = document.getElementById('global-emergency-alert-banner');
    if (banner) banner.remove();
    localStorage.removeItem('emergency_crisis_event');
  }

  setTimeout(() => {
    window.location.href = '/restaurant-pickups.html';
  }, 600);
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

window.triggerConfettiBurst = function(x, y) {
  const colors = ['#16803C', '#059669', '#10B981', '#3B82F6', '#EAB308', '#EC4899', '#8B5CF6', '#EF4444'];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${Math.random() * 8 + 6}px`;
    particle.style.height = `${Math.random() * 8 + 6}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    particle.style.zIndex = '99999';
    particle.style.pointerEvents = 'none';

    const angle = (i / particleCount) * 360 * (Math.PI / 180);
    const velocity = Math.random() * 90 + 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    document.body.appendChild(particle);

    const startTime = performance.now();
    function animate(time) {
      const elapsed = (time - startTime) / 1000;
      if (elapsed > 0.75) {
        particle.remove();
        return;
      }
      const px = x + vx * elapsed;
      const py = y + vy * elapsed + 0.5 * 300 * elapsed * elapsed;
      const opacity = 1 - elapsed / 0.75;
      const scale = 1 - elapsed / 0.75;
      const rotate = elapsed * 720;

      particle.style.transform = `translate(${px - x}px, ${py - y}px) scale(${scale}) rotate(${rotate}deg)`;
      particle.style.opacity = opacity;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(startTime);
  }
};

// Emergency Crisis Cross-Portal Sync Listener
function checkEmergencyCrisisState() {
  const crisisRaw = localStorage.getItem('emergency_crisis_event');
  if (!crisisRaw) return;

  try {
    const crisis = JSON.parse(crisisRaw);
    if (!crisis || !crisis.active) return;

    if (!document.getElementById('global-emergency-alert-banner')) {
      const banner = document.createElement('div');
      banner.id = 'global-emergency-alert-banner';
      banner.className = 'fixed top-0 left-0 right-0 z-[99999] bg-red-600 text-white px-6 py-3 shadow-2xl flex items-center justify-between animate-pulse border-b-2 border-red-400 font-sans';
      banner.innerHTML = `
        <div class="flex items-center gap-3 max-w-6xl mx-auto w-full">
          <span class="w-3 h-3 rounded-full bg-white animate-ping shrink-0"></span>
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
          dot.className = 'emergency-dot inline-block w-2.5 h-2.5 rounded-full bg-red-600 ml-1.5 animate-ping';
          el.appendChild(dot);
        }
      }
    });

  } catch (e) {
    console.warn('Crisis check error:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Ripple effect on all clicks
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, a.btn, input[type="submit"]');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'buttonRipple 0.6s linear';
    circle.style.pointerEvents = 'none';

    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.innerHTML = `
        @keyframes buttonRipple {
          to {
            transform: scale(3.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);

    const btnText = btn.textContent.trim();

    if (btnText.includes('Accept') || 
        btnText.includes('Claim') || 
        btnText.includes('Donate') || 
        btnText.includes('Send') ||
        btnText.includes('Post') ||
        btnText.includes('Confirm') ||
        btnText.includes('Save') ||
        btn.classList.contains('bg-brand-green') ||
        btn.classList.contains('bg-emerald-600') ||
        btn.classList.contains('bg-primary-container')) {
      triggerConfettiBurst(e.clientX, e.clientY);
    }
  });

  checkEmergencyCrisisState();
  setInterval(checkEmergencyCrisisState, 2000);
});

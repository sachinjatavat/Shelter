/* ==========================================================================
   SURPLUS-TO-SHELTER FUN INTERACTIVE MOTION, RIPPLES & EMERGENCY CRISIS SYNC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Attach Ripple Effect & Button Action Listeners to all Buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, a.btn, input[type="submit"]');
    if (!btn) return;

    // Create ripple circle
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

    // Ensure CSS animation keyframe exists
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

    // 2. Trigger Fun Confetti Burst on Action Buttons
    const isPrimaryAction = btnText.includes('Accept') || 
                            btnText.includes('Claim') || 
                            btnText.includes('Donate') || 
                            btnText.includes('Send') ||
                            btnText.includes('Post') ||
                            btnText.includes('Confirm') ||
                            btnText.includes('Save') ||
                            btn.classList.contains('bg-brand-green') ||
                            btn.classList.contains('bg-emerald-600') ||
                            btn.classList.contains('bg-primary-container');

    if (isPrimaryAction) {
      triggerConfettiBurst(e.clientX, e.clientY);
    }

    // 3. Handle "Send Donation" Buttons
    if (btnText.includes('Send Donation')) {
      e.preventDefault();
      const card = btn.closest('.bg-surface-container-lowest, article, .donation-card, div');
      const ngoName = card ? (card.querySelector('.text-headline-sm, h3, .font-bold')?.textContent || 'Hope Shelter') : 'Hope Shelter';

      alert(`🎉 DONATION DISPATCH CONFIRMED!\n\nYour surplus food donation has been assigned to ${ngoName.trim()}.\n\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.\nTracking details are live on your Pickups dashboard.`);

      setTimeout(() => {
        window.location.href = '/restaurant-pickups.html';
      }, 800);
    }

    // 4. Handle "View Details" Buttons
    if (btnText.includes('View Details') && (!btn.getAttribute('onclick') || btn.getAttribute('onclick').includes('alert'))) {
      const card = btn.closest('.bg-surface-container-lowest, article, .donation-card, div');
      const ngoName = card ? (card.querySelector('.text-headline-sm, h3, .font-bold')?.textContent || 'Hope Shelter') : 'Hope Shelter';

      alert(`📋 RECIPIENT SPECIFICATIONS:\n\nOrganisation: ${ngoName.trim()}\nVerification: 100% Certified NGO Partner\nAvailable Capacity: 45 meals remaining today\nDriver Vehicle: Thermal Insulated EV Van (#RJ-14-EV-9401)\nEstimated Pickup ETA: 12 minutes\nHandling Notes: Sanitary food-grade thermal containers provided.`);
    }
  });

  // Check for NGO Emergency Crisis Broadcast every 2 seconds
  checkEmergencyCrisisState();
  setInterval(checkEmergencyCrisisState, 2000);
});

// Fun Particle Burst Helper
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

// Emergency Crisis Cross-Portal Sync Module
function checkEmergencyCrisisState() {
  const crisisRaw = localStorage.getItem('emergency_crisis_event');
  if (!crisisRaw) return;

  try {
    const crisis = JSON.parse(crisisRaw);
    if (!crisis || !crisis.active) return;

    // 1. Inject Top Red Alert Emergency Banner if not present
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
          <button onclick="quickDispatchEmergencyRelief()" class="px-3.5 py-1.5 bg-white text-red-700 text-xs font-extrabold rounded-lg hover:bg-red-100 transition-colors shadow-md">
            ⚡ Quick Respond (50 Meals)
          </button>
          <button onclick="dismissGlobalEmergencyBanner()" class="text-white hover:text-red-200 text-xs font-bold px-2">✕</button>
        </div>
      `;
      document.body.prepend(banner);
    }

    // 2. Add Red Dot Badge to Notifications Icon in sidebar/header
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

window.quickDispatchEmergencyRelief = function() {
  if (window.triggerConfettiBurst) {
    window.triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);
  }
  alert('🎉 EMERGENCY DISPATCH CONFIRMED!\n\n50 Emergency Meals allocated to Hope Shelter relief operation.\nCourier Driver Rahul Sharma (+91 98290-XXXXX) has been dispatched for immediate pickup.');
  window.dismissGlobalEmergencyBanner();
  window.location.href = '/restaurant-pickups.html';
};

window.dismissGlobalEmergencyBanner = function() {
  const banner = document.getElementById('global-emergency-alert-banner');
  if (banner) banner.remove();
  
  // Clear active crisis
  try {
    const crisisRaw = localStorage.getItem('emergency_crisis_event');
    if (crisisRaw) {
      const crisis = JSON.parse(crisisRaw);
      crisis.active = false;
      localStorage.setItem('emergency_crisis_event', JSON.stringify(crisis));
    }
  } catch (e) {}
};

/* ==========================================================================
   SURPLUS-TO-SHELTER INTERACTIVE WELCOME & ONBOARDING TUTORIAL ENGINE
   ========================================================================== */

(function () {
  const roleConfigs = {
    restaurant: {
      title: '👋 Welcome to Surplus-To-Shelter (Restaurant Partner)',
      badge: 'STORE / RESTAURANT PORTAL',
      badgeColor: 'bg-emerald-600',
      steps: [
        {
          num: '1',
          icon: '🍲',
          title: 'Post Surplus Food Batches',
          desc: 'Click "Post Donation" to list unserved surplus meals, bakery items, or produce.'
        },
        {
          num: '2',
          icon: '🧠',
          title: 'AI Freshness & Safety Scoring',
          desc: 'Our AI calculates safety scores & shelf-life index (Tier A/B) based on prep time & temp.'
        },
        {
          num: '3',
          icon: '🤝',
          title: 'Smart NGO Matching & Dispatch',
          desc: 'Select verified nearby shelters (e.g. Hope Shelter) and dispatch courier drivers instantly.'
        },
        {
          num: '4',
          icon: '🚚',
          title: 'Track Pickup & Impact',
          desc: 'Follow driver ETA on Pickups map and receive tax deduction (80G) certificates.'
        }
      ]
    },
    ngo: {
      title: '👋 Welcome to Surplus-To-Shelter (Shelter / NGO Partner)',
      badge: 'SHELTER / NGO PORTAL',
      badgeColor: 'bg-blue-600',
      steps: [
        {
          num: '1',
          icon: '🤝',
          title: 'Browse Available Surplus Food',
          desc: 'View real-time food donations posted by nearby restaurants and commercial kitchens.'
        },
        {
          num: '2',
          icon: '⚡',
          title: 'Claim & Accept Donations',
          desc: 'Click "Accept Donation" to lock food batches for your community kitchen or shelter.'
        },
        {
          num: '3',
          icon: '🚨',
          title: 'Emergency Relief Red Alert',
          desc: 'Facing flood or crisis? Trigger Red Alert to broadcast urgent meal requests across the network.'
        },
        {
          num: '4',
          icon: '📊',
          title: 'Verify Delivery & Impact',
          desc: 'Confirm intake upon driver arrival and track total community meals served.'
        }
      ]
    },
    driver: {
      title: '👋 Welcome to Surplus-To-Shelter (Courier Driver Partner)',
      badge: 'DRIVER COURIER PORTAL',
      badgeColor: 'bg-amber-600',
      steps: [
        {
          num: '1',
          icon: '🚚',
          title: 'Browse Rescue Missions',
          desc: 'View active pickup requests near your current GPS location.'
        },
        {
          num: '2',
          icon: '⚡',
          title: 'Accept & Lock Route',
          desc: 'Click "Accept Pickup" to lock the mission to your route with turn-by-turn navigation.'
        },
        {
          num: '3',
          icon: '🌡️',
          title: 'IoT Cold-Chain Telemetry',
          desc: 'Transport under verified thermal specs (4.2°C safe refrigerated standard).'
        },
        {
          num: '4',
          icon: '💰',
          title: 'Instant Payouts & Incentives',
          desc: 'Receive per-delivery earnings, fuel allowances, and CSR bonus payouts upon delivery.'
        }
      ]
    }
  };

  window.showUserTutorial = function (force = false) {
    const isNewUser = localStorage.getItem('is_new_user') === 'true';
    if (!isNewUser && !force) return;
    if (document.getElementById('welcome-tutorial-modal')) return;

    let role = localStorage.getItem('user_role') || 'restaurant';
    const path = window.location.pathname;
    if (path.includes('ngo')) role = 'ngo';
    else if (path.includes('driver')) role = 'driver';
    else if (path.includes('restaurant')) role = 'restaurant';

    const config = roleConfigs[role] || roleConfigs.restaurant;
    const userName = localStorage.getItem('user_name') || 'Partner';

    const modal = document.createElement('div');
    modal.id = 'welcome-tutorial-modal';
    modal.className = 'fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans antialiased';
    
    modal.innerHTML = `
      <div class="bg-slate-900 text-white border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <span class="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-white ${config.badgeColor} tracking-wider mb-1.5">
              ${config.badge}
            </span>
            <h2 class="text-xl font-extrabold text-white tracking-tight">${config.title}</h2>
            <p class="text-xs text-slate-400 mt-1">Hello <strong class="text-emerald-400">${userName}</strong>! Here is how to use your dashboard in 4 simple steps:</p>
          </div>
          <button onclick="window.closeUserTutorial()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-lg font-bold">✕</button>
        </div>

        <!-- 4 Step Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          ${config.steps.map(step => `
            <div class="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3 hover:border-slate-600 transition-all">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-500/30">
                ${step.icon}
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-200">${step.num}. ${step.title}</h4>
                <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${step.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-800">
          <span class="text-[11px] text-slate-400">Step 1 of 1 • Onboarding Active</span>
          <button onclick="window.closeUserTutorial()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5">
            <span>🚀 Start Using Platform</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  };

  window.closeUserTutorial = function () {
    const modal = document.getElementById('welcome-tutorial-modal');
    if (modal) modal.remove();
    localStorage.setItem('is_new_user', 'false');
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.showUserTutorial(false);
    }, 400);
  });
})();

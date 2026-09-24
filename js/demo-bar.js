/* ==========================================================================
   SURPLUS-TO-SHELTER DEMO & SHOWCASE CONTROLLER (JUDGE PRESENTATION TOOLKIT)
   ========================================================================== */

(function () {
  if (document.getElementById('demo-showcase-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'demo-showcase-panel';
  panel.className = 'fixed bottom-4 right-4 z-[99999] font-sans antialiased';
  panel.innerHTML = `
    <!-- Toggle Button -->
    <button id="demo-panel-toggle" class="bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer">
      <span class="text-amber-400 font-extrabold text-sm">🎬 Demo Tools</span>
      <span id="demo-toggle-icon" class="text-slate-400 text-xs">▲</span>
    </button>

    <!-- Collapsible Control Box -->
    <div id="demo-panel-body" class="hidden mt-2 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 w-80 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Showcase Control Bar
        </h4>
        <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">1-Click Scenarios</span>
      </div>

      <div class="grid grid-cols-1 gap-2 text-xs">
        <!-- Action 1: Trigger Red Alert Crisis -->
        <button id="demo-trigger-crisis" class="w-full text-left px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700/60 rounded-xl text-red-200 font-medium transition-colors flex items-center justify-between">
          <span>🚨 Trigger Emergency Flood Alert</span>
          <span class="text-red-400 font-bold">LIVE</span>
        </button>

        <!-- Action 2: Simulate New Donation -->
        <button id="demo-trigger-donation" class="w-full text-left px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-emerald-200 font-medium transition-colors flex items-center justify-between">
          <span>🍲 Simulate New Surplus Food Post</span>
          <span class="text-emerald-400 font-bold">+50 Meals</span>
        </button>

        <!-- Action 3: IoT Cold-Chain Sensor Check -->
        <button id="demo-trigger-iot" class="w-full text-left px-3 py-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 rounded-xl text-sky-200 font-medium transition-colors flex items-center justify-between">
          <span>🌡️ IoT Cold-Chain Telemetry</span>
          <span class="text-sky-400 font-bold">4.2°C Safe</span>
        </button>

        <!-- Action 4: Simulate NGO Intake & Impact Boost -->
        <button id="demo-trigger-intake" class="w-full text-left px-3 py-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 rounded-xl text-amber-200 font-medium transition-colors flex items-center justify-between">
          <span>📊 NGO Intake & CO₂ Impact Boost</span>
          <span class="text-amber-400 font-bold">+125kg CO₂</span>
        </button>
      </div>

      <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <button id="demo-reset-state" class="text-slate-400 hover:text-white underline cursor-pointer">Reset Demo Data</button>
        <span class="text-slate-500 font-mono text-[10px]">Surplus-to-Shelter v2.0</span>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Toggle Box Visibility
  const toggleBtn = document.getElementById('demo-panel-toggle');
  const panelBody = document.getElementById('demo-panel-body');
  const toggleIcon = document.getElementById('demo-toggle-icon');

  toggleBtn.addEventListener('click', () => {
    panelBody.classList.toggle('hidden');
    toggleIcon.textContent = panelBody.classList.contains('hidden') ? '▲' : '▼';
  });

  // Action 1: Emergency Flood Alert
  document.getElementById('demo-trigger-crisis').addEventListener('click', () => {
    const crisis = {
      active: true,
      type: 'Heavy Rain & Flood Emergency',
      portions: '100 Meals (Urgent)',
      ngo: 'Hope Shelter',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('emergency_crisis_event', JSON.stringify(crisis));
    alert('🚨 EMERGENCY FLOOD ALERT TRIGGERED!\n\nThe Red Alert notification banner has been dispatched cross-portal to all Restaurants & Drivers.');
    window.location.reload();
  });

  // Action 2: Simulate New Surplus Donation
  document.getElementById('demo-trigger-donation').addEventListener('click', () => {
    alert('🍲 SURPLUS FOOD POST SIMULATED!\n\nBatch: Dominos Pizza - 40 Gourmet Veg Pizzas & Garlic Bread\nFreshness Score: 98% (Freshly Prepared 45m ago)\nAI Safety Clearance: Passed (Tier A)');
    window.location.href = '/restaurant-matching.html';
  });

  // Action 3: IoT Cold-Chain Telemetry Modal
  document.getElementById('demo-trigger-iot').addEventListener('click', () => {
    alert('🌡️ REAL-TIME IoT COLD-CHAIN TELEMETRY SENSOR REPORT:\n\n' +
          '• Storage Temp: 4.2°C (Optimal Refrigerated Standard < 5.0°C)\n' +
          '• Bag Humidity: 42%\n' +
          '• EV GPS Tracker: Active (#RJ-14-EV-9401)\n' +
          '• Thermal Container Seal: Tamper-Proof Intact\n' +
          '• Food Freshness Risk Index: LOW (Score 98/100)');
  });

  // Action 4: NGO Intake & CO₂ Impact Boost
  document.getElementById('demo-trigger-intake').addEventListener('click', () => {
    let savedMeals = parseInt(localStorage.getItem('demo_meals_saved') || '420', 10) + 50;
    let co2Saved = parseInt(localStorage.getItem('demo_co2_saved') || '1050', 10) + 125;
    localStorage.setItem('demo_meals_saved', savedMeals.toString());
    localStorage.setItem('demo_co2_saved', co2Saved.toString());

    alert(`📊 NGO INTAKE & IMPACT UPDATED!\n\nTotal Meals Delivered: ${savedMeals} meals\nCO₂ Emissions Prevented: ${co2Saved} kg\nWater Saved: ${savedMeals * 20} Litres\nEconomic Value Provided: ₹${savedMeals * 120}`);
  });

  // Reset Demo State
  document.getElementById('demo-reset-state').addEventListener('click', () => {
    localStorage.removeItem('emergency_crisis_event');
    localStorage.removeItem('demo_meals_saved');
    localStorage.removeItem('demo_co2_saved');
    alert('🧹 Demo state reset to default.');
    window.location.reload();
  });
})();

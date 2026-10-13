/**
 * SURPLUS-TO-SHELTER UNIVERSAL SMART SEARCH & NGO AUTO-SUGGESTION ENGINE
 * Provides instant autocomplete, verified NGO recommendations, active couriers, and donation search.
 */

(function () {
  'use strict';

  // Verified NGO & Shelter Master Catalog
  const NGO_DATABASE = [
    {
      id: 'ngo-1',
      name: 'Hope Shelter (Main Intake)',
      category: 'Emergency Shelter & Community Care',
      type: 'Emergency Shelter',
      address: '740 4th Ave, South District, Jaipur',
      distance: '2.1 km away',
      capacity: '85% Capacity (High Intake Space)',
      phone: '+91 98290-48291',
      contactPerson: 'Sarah Jenkins (Coordinator)',
      acceptedItems: ['Warm Blankets', 'Jackets & Footwear', 'Cooked Meals', 'Hygiene Kits'],
      urgency: 'HIGH PRIORITY',
      badge: 'Verified 80G Certified NGO',
      routeKey: 'hope_shelter',
      description: 'Serving 140+ individuals daily. Immediate intake active for warm clothes, thermal blankets, and hot meals.'
    },
    {
      id: 'ngo-2',
      name: 'Annapurna Relief Center & Food Bank',
      category: 'Food Security & Rations',
      type: 'Food Bank & Central Kitchen',
      address: 'Plot 14, MI Road Main Arterial, Jaipur',
      distance: '4.2 km away',
      capacity: '70% Capacity (300 Meals Daily)',
      phone: '+91 98291-77203',
      contactPerson: 'Manoj Verma (Kitchen Incharge)',
      acceptedItems: ['Cooked Hot Meals', 'Raw Grain Rations', 'Packaged Snacks', 'Dairy'],
      urgency: 'NORMAL',
      badge: 'Verified 80G Certified NGO',
      routeKey: 'annapurna',
      description: 'Central distribution hub supplying hot meals and food rations to 5 sub-shelters across the municipal zone.'
    },
    {
      id: 'ngo-3',
      name: 'Vidya Educational & Youth Care Trust',
      category: 'Children & Educational Support',
      type: 'Orphanage & Youth Learning Hub',
      address: 'Near Rajasthan University, JLN Marg, Jaipur',
      distance: '3.8 km away',
      capacity: '92% Capacity (85 Students)',
      phone: '+91 98292-11490',
      contactPerson: 'Anjali Sharma (Head Trustee)',
      acceptedItems: ['School Textbooks', 'Storybooks', 'Stationery & Bags', 'Kids Apparel', 'Snacks'],
      urgency: 'URGENT REQUISITION',
      badge: 'Verified 80G Certified NGO',
      routeKey: 'hope_shelter',
      description: 'Empowering 85 resident shelter children. High demand for Class 1-10 school books, stationery kits, and sweaters.'
    },
    {
      id: 'ngo-4',
      name: 'Community Care Mission & Transit Hub',
      category: 'Shelter & Daily Essentials',
      type: 'Community Mission Desk',
      address: 'Civil Lines West Transit Avenue, Jaipur',
      distance: '1.8 km away',
      capacity: '65% Capacity (Rapid Dispatch)',
      phone: '+91 98293-88341',
      contactPerson: 'Sister Mary / Desk 2',
      acceptedItems: ['Winter Clothes', 'Bedding Blankets', 'Packaged Food', 'Toiletries'],
      urgency: 'NORMAL',
      badge: 'Verified 80G Certified NGO',
      routeKey: 'community_care',
      description: 'Immediate neighborhood assistance center catering to homeless and displaced community members.'
    },
    {
      id: 'ngo-5',
      name: 'Aarogya Medical Aid & Relief Society',
      category: 'Healthcare & First Aid',
      type: 'Free Health Clinic & Aid Camp',
      address: 'JLN Marg Sector 4, Opposite Birla Mandir, Jaipur',
      distance: '2.9 km away',
      capacity: '80% Capacity',
      phone: '+91 98294-55120',
      contactPerson: 'Dr. R. K. Gupta',
      acceptedItems: ['First Aid Kits', 'Bandages & Antiseptics', 'OTC Medicines', 'Sanitary Pads', 'Hygiene Kits'],
      urgency: 'CRITICAL HEALTH NEED',
      badge: 'Medical NGO • 12A & 80G Reg.',
      routeKey: 'hope_shelter',
      description: 'Providing free emergency health clinics and medical care packs for slum communities and night shelters.'
    },
    {
      id: 'ngo-6',
      name: 'Rain Basera Night Shelter #4',
      category: 'Homeless Night Shelter',
      type: 'Municipal Night Shelter',
      address: 'Station Road, Railway Colony Outer, Jaipur',
      distance: '3.1 km away',
      capacity: '95% Full (Critical Need)',
      phone: '+91 98295-99411',
      contactPerson: 'Ramesh Meena (Superintendent)',
      acceptedItems: ['Double-layer Blankets', 'Warm Jackets', 'Caps & Mufflers', 'Hot Meals'],
      urgency: 'COLD WAVE RELIEF',
      badge: 'Govt. Affiliated Verified Shelter',
      routeKey: 'annapurna',
      description: 'Winter relief night shelter accommodating 160 individuals nightly during cold wave periods.'
    }
  ];

  // Active Couriers
  const COURIER_DATABASE = [
    {
      id: 'drv-402',
      name: 'Courier Rahul Sharma (#402)',
      vehicle: 'Toyota HiAce Thermal EV Van',
      status: 'En Route (Active GPS)',
      phone: '+91 98290-12345',
      eta: '8 mins away'
    },
    {
      id: 'drv-308',
      name: 'Courier Amit Verma (#308)',
      vehicle: 'Insulated Cargo Carrier',
      status: 'Available on MI Road',
      phone: '+91 98290-67890',
      eta: '12 mins away'
    }
  ];

  // Global Modal Renderer for Selected NGO
  function openNgoDetailsModal(ngo) {
    let modal = document.getElementById('search-ngo-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'search-ngo-modal';
      modal.className = 'fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm';
      document.body.appendChild(modal);
    }

    const acceptedPills = (ngo.acceptedItems || [])
      .map(item => `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">✓ ${item}</span>`)
      .join('');

    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 relative animate-in fade-in zoom-in-95 duration-200 font-sans text-on-surface">
        <!-- Close Button -->
        <button onclick="document.getElementById('search-ngo-modal').remove()" type="button" class="absolute top-4 right-4 text-outline hover:text-on-surface w-8 h-8 rounded-full bg-surface-container flex items-center justify-center transition-colors cursor-pointer">
          ✕
        </button>

        <!-- Header -->
        <div class="flex items-start gap-3.5 mb-4 pr-8">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 text-2xl font-bold">
            🤝
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-lg font-bold text-on-surface leading-tight">${ngo.name}</h2>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span class="material-symbols-outlined text-[13px]">verified</span> Verified
              </span>
            </div>
            <p class="text-xs text-outline mt-0.5">${ngo.category} • <b class="text-emerald-700">${ngo.distance}</b></p>
          </div>
        </div>

        <!-- Specifications Card -->
        <div class="bg-surface-container-low rounded-xl p-3.5 space-y-2 mb-4 text-xs border border-outline-variant/20">
          <div class="flex items-start gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">location_on</span>
            <span><b>Address:</b> ${ngo.address}</span>
          </div>
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-primary-container text-[18px] shrink-0">inventory</span>
            <span><b>Live Intake Status:</b> <span class="text-emerald-800 font-bold">${ngo.capacity}</span></span>
          </div>
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-primary-container text-[18px] shrink-0">person</span>
            <span><b>Site Contact:</b> ${ngo.contactPerson} (${ngo.phone})</span>
          </div>
        </div>

        <!-- Accepted Aid Categories -->
        <div class="mb-5">
          <span class="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Accepted Donations & Requisitions:</span>
          <div class="flex flex-wrap gap-1.5">
            ${acceptedPills}
          </div>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-outline-variant/30">
          <a href="./restaurant-post.html?ngo=${encodeURIComponent(ngo.name)}" class="h-10 rounded-xl bg-primary-container hover:bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all">
            <span class="material-symbols-outlined text-[18px]">volunteer_activism</span>
            <span>Post Donation to this NGO</span>
          </a>
          <a href="./restaurant-matching.html" class="h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 border border-outline-variant/40 transition-colors">
            <span class="material-symbols-outlined text-[18px] text-emerald-600">near_me</span>
            <span>Track on Live GPS Route</span>
          </a>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Build & Inject Universal Search Dropdown
  function setupSearchInput(input) {
    if (input.dataset.searchEnhanced) return;
    input.dataset.searchEnhanced = 'true';

    const parent = input.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';

    // Create Suggestions Popover
    const popover = document.createElement('div');
    popover.className = 'hidden absolute left-0 right-0 top-full mt-2 w-full md:w-[460px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 z-[9999] overflow-hidden max-h-[460px] overflow-y-auto select-none font-sans text-on-surface';
    parent.appendChild(popover);

    function renderSuggestions(query) {
      const q = (query || '').toLowerCase().trim();

      // Filter NGOs
      const matchedNgos = NGO_DATABASE.filter(ngo => {
        if (!q) return true; // Show all verified when empty
        return (
          ngo.name.toLowerCase().includes(q) ||
          ngo.category.toLowerCase().includes(q) ||
          ngo.address.toLowerCase().includes(q) ||
          (ngo.acceptedItems && ngo.acceptedItems.some(item => item.toLowerCase().includes(q)))
        );
      });

      // Filter Couriers
      const matchedCouriers = COURIER_DATABASE.filter(c => {
        if (!q) return false;
        return c.name.toLowerCase().includes(q) || c.vehicle.toLowerCase().includes(q);
      });

      // Fetch Local Donations
      let matchedDonations = [];
      try {
        const localList = JSON.parse(localStorage.getItem('local_donations') || '[]');
        matchedDonations = localList.filter(d => {
          if (!q) return false;
          return (d.id && d.id.toLowerCase().includes(q)) || (d.title && d.title.toLowerCase().includes(q));
        });
      } catch (e) {}

      let html = '';

      // Section 1: Verified NGOs
      if (matchedNgos.length > 0) {
        html += `
          <div class="px-3.5 py-2 bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-outline flex items-center justify-between border-b border-outline-variant/20">
            <span>🤝 Verified Recipient NGOs & Shelters (${matchedNgos.length})</span>
            <span class="text-primary-container text-[10px]">Click to Select</span>
          </div>
          <div class="divide-y divide-outline-variant/15">
        `;

        matchedNgos.forEach(ngo => {
          html += `
            <div data-ngo-id="${ngo.id}" class="search-ngo-item p-3 hover:bg-surface-container-low transition-colors cursor-pointer flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/20 font-bold text-sm">
                🤝
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <span class="font-bold text-xs text-on-surface truncate">${ngo.name}</span>
                  <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">${ngo.distance}</span>
                </div>
                <div class="text-[11px] text-outline truncate mt-0.5">${ngo.address}</div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[10px] text-primary-container font-semibold">${ngo.capacity}</span>
                  <span class="text-outline text-[10px]">•</span>
                  <span class="text-[10px] text-on-surface-variant truncate">${(ngo.acceptedItems || []).slice(0, 3).join(', ')}</span>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      // Section 2: Active Couriers
      if (matchedCouriers.length > 0) {
        html += `
          <div class="px-3.5 py-2 bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-outline border-t border-b border-outline-variant/20">
            🚚 Active Couriers (${matchedCouriers.length})
          </div>
          <div class="divide-y divide-outline-variant/15">
        `;
        matchedCouriers.forEach(c => {
          html += `
            <a href="./driver-active.html" class="p-3 hover:bg-surface-container-low transition-colors block">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface">${c.name}</span>
                <span class="text-[10px] text-emerald-700 font-bold font-mono">${c.eta}</span>
              </div>
              <div class="text-[11px] text-outline mt-0.5">${c.vehicle} • ${c.status}</div>
            </a>
          `;
        });
        html += `</div>`;
      }

      // Section 3: Donations
      if (matchedDonations.length > 0) {
        html += `
          <div class="px-3.5 py-2 bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-outline border-t border-b border-outline-variant/20">
            📦 Donations & Manifests (${matchedDonations.length})
          </div>
          <div class="divide-y divide-outline-variant/15">
        `;
        matchedDonations.forEach(d => {
          html += `
            <a href="./restaurant-history.html" class="p-3 hover:bg-surface-container-low transition-colors block">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface">${d.title}</span>
                <span class="font-mono text-[10px] font-bold text-slate-700">${d.id}</span>
              </div>
              <div class="text-[11px] text-outline mt-0.5">${d.quantity_kg || 20} kg • Status: ${d.status || 'AVAILABLE'}</div>
            </a>
          `;
        });
        html += `</div>`;
      }

      // Empty State
      if (!html) {
        html = `
          <div class="p-6 text-center text-outline text-xs">
            <span class="material-symbols-outlined text-3xl mb-1 block text-outline/50">search_off</span>
            No matching NGOs or relief dispatches found for "<b>${query}</b>".<br>
            <span class="text-[11px] text-outline/70 mt-1 block">Try searching "Hope", "Annapurna", "Vidya", or "Blankets".</span>
          </div>
        `;
      }

      popover.innerHTML = html;
      popover.classList.remove('hidden');

      // Attach click listeners to NGO rows
      popover.querySelectorAll('.search-ngo-item').forEach(el => {
        el.addEventListener('click', () => {
          const ngoId = el.getAttribute('data-ngo-id');
          const target = NGO_DATABASE.find(n => n.id === ngoId);
          if (target) {
            popover.classList.add('hidden');
            input.value = target.name;
            openNgoDetailsModal(target);
          }
        });
      });
    }

    // Events
    input.addEventListener('focus', () => {
      renderSuggestions(input.value);
    });

    input.addEventListener('input', () => {
      renderSuggestions(input.value);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) {
        popover.classList.add('hidden');
      }
    });

    // Close on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        popover.classList.add('hidden');
      }
    });
  }

  // Initialize on all search inputs across the page
  function scanAndInitSearchInputs() {
    const inputs = document.querySelectorAll('input[type="search"], input[placeholder*="Search"], #global-search-input');
    inputs.forEach(setupSearchInput);
  }

  // Auto-init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInitSearchInputs);
  } else {
    scanAndInitSearchInputs();
  }

  // Expose API globally
  window.SurplusSearchEngine = {
    NGO_DATABASE,
    COURIER_DATABASE,
    openNgoDetailsModal,
    scanAndInitSearchInputs
  };
})();

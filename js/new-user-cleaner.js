/* ==========================================================================
   SURPLUS-TO-SHELTER UNIFIED USER DATA & CLEAN SLATE ISOLATION ENGINE
   Ensures new accounts start with clean slate (0 past activity) and
   only show activity when real work is performed by them.
   Also dynamically binds Driver and Shelter names everywhere.
   ========================================================================== */

(function () {
  function getLocalDonations() {
    try {
      return JSON.parse(localStorage.getItem('local_donations') || '[]');
    } catch (e) {
      return [];
    }
  }

  function getUserInfo() {
    const email = (localStorage.getItem('user_email') || '').toLowerCase().trim();
    const role = localStorage.getItem('user_role') || '';
    const userName = localStorage.getItem('user_name') || '';
    const driverName = localStorage.getItem('driver_name') || (role === 'driver' ? userName : '') || userName || 'Courier Driver';
    const ngoName = localStorage.getItem('ngo_name') || (role === 'ngo' ? userName : '') || userName || 'Shelter Care Center';
    const restName = localStorage.getItem('restaurant_name') || (role === 'restaurant' ? userName : '') || userName || 'Restaurant Partner';

    const isSeedDemo = ['manager@freshharvest.org', 'coordinator@hopeshelter.org', 'driver402@surplusrescue.org'].includes(email);
    const isNew = localStorage.getItem('is_new_user') === 'true' || (!isSeedDemo && email !== '') || (!email && localStorage.getItem('is_new_user') === 'true');

    return { email, role, userName, driverName, ngoName, restName, isNew, isSeedDemo };
  }

  function syncNamesAcrossPage(info) {
    const path = window.location.pathname;

    // Call motion.js sync if available
    if (window.syncProfileHeaderUI) {
      window.syncProfileHeaderUI();
    }

    // Shelter Name Sync (ngo-dashboard.html)
    if (path.includes('ngo')) {
      const activeShelter = info.ngoName;
      if (activeShelter) {
        const topbarEl = document.getElementById('ngo-topbar-name');
        if (topbarEl) topbarEl.textContent = activeShelter;
        document.querySelectorAll('header span, .user-name-display').forEach(el => {
          if (!el.closest('#platform-brand-logo, .brand-logo, header a') && (el.textContent.includes('Hope Shelter') || el.id === 'ngo-topbar-name')) {
            el.textContent = activeShelter;
          }
        });
        document.querySelectorAll('h1').forEach(el => {
          if (el.textContent.includes('Good morning,')) {
            el.textContent = `Good morning, ${activeShelter}`;
          }
        });
        const inp = document.getElementById('ngoNameInput');
        if (inp && !inp.dataset.userEdited) {
          inp.value = activeShelter;
        }
        if (document.title.includes('Hope Shelter') || document.title.includes('NGO Portal')) {
          document.title = `SURPLUS-TO-SHELTER | NGO Portal - ${activeShelter}`;
        }
      }
    }

    // Driver Name Sync (driver-*.html)
    if (path.includes('driver')) {
      const activeDriver = info.driverName;
      if (activeDriver) {
        document.querySelectorAll('header .font-label-lg, header .text-label-md, header .user-name-display').forEach(el => {
          if (!el.closest('aside') && !el.closest('nav')) {
            el.textContent = activeDriver;
          }
        });
        document.querySelectorAll('h1').forEach(el => {
          if (el.textContent.includes('Good morning,')) {
            el.textContent = `Good morning, ${activeDriver}`;
          }
        });
        document.querySelectorAll('.font-headline-md').forEach(el => {
          if (el.textContent.includes('Rahul') || el.textContent.includes('(Available)')) {
            el.textContent = `${activeDriver} (Available)`;
          }
        });
        const inp = document.getElementById('driverNameInput');
        if (inp && !inp.dataset.userEdited) {
          inp.value = activeDriver;
        }
      }
    }

    // Restaurant Name Sync (restaurant-*.html)
    if (path.includes('restaurant')) {
      const activeRest = info.restName;
      if (activeRest) {
        document.querySelectorAll('header .font-label-lg, header .text-label-md, header .user-name-display').forEach(el => {
          if (!el.closest('aside') && !el.closest('nav')) {
            el.textContent = activeRest;
          }
        });
        document.querySelectorAll('h1').forEach(el => {
          if (el.textContent.includes('Good morning,')) {
            el.textContent = `Good morning, ${activeRest}`;
          }
        });
      }
    }
  }

  function cleanAndSyncDriverPortal(info, allDonations) {
    const path = window.location.pathname;
    if (!path.includes('driver')) return;

    const myDriverDonations = allDonations.filter(d => 
      d.driver_name && (
        d.driver_name.toLowerCase() === info.driverName.toLowerCase() ||
        d.driver_name.toLowerCase() === info.userName.toLowerCase()
      )
    );
    const completed = myDriverDonations.filter(d => d.status === 'DELIVERED');
    const activeMission = myDriverDonations.find(d => d.status === 'EN_ROUTE' || d.status === 'ASSIGNED');
    const totalWeightKg = completed.reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0);

    // 1. Driver History Page (driver-history.html)
    if (path.includes('driver-history') && info.isNew) {
      const historyBody = document.querySelector('tbody');
      if (historyBody) {
        historyBody.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id') && !tr.id.includes('real-delivery')) {
            tr.remove();
          }
        });

        if (completed.length === 0) {
          if (!document.getElementById('empty-driver-history')) {
            const emptyTr = document.createElement('tr');
            emptyTr.id = 'empty-driver-history';
            emptyTr.innerHTML = `
              <td colspan="8" class="p-8 text-center text-outline text-xs">
                <span class="material-symbols-outlined text-3xl mb-1 text-outline/50 block">local_shipping</span>
                No past delivery missions completed yet.<br>
                <span class="text-xs text-outline/80">Accept and complete an available pickup to log your volunteer delivery history.</span>
              </td>
            `;
            historyBody.appendChild(emptyTr);
          }
        } else {
          const emptyMsg = document.getElementById('empty-driver-history');
          if (emptyMsg) emptyMsg.remove();

          // Render real deliveries
          completed.forEach(d => {
            if (!document.getElementById(`real-delivery-${d.id}`)) {
              const tr = document.createElement('tr');
              tr.id = `real-delivery-${d.id}`;
              tr.setAttribute('data-id', d.id);
              tr.className = 'hover:bg-surface-container-low transition-colors';
              tr.innerHTML = `
                <td class="p-3 font-bold">${d.id}</td>
                <td class="p-3 font-semibold text-primary">${d.title}</td>
                <td class="p-3">${d.donor_name || 'Restaurant Partner'}</td>
                <td class="p-3">${d.recipient_ngo || 'Shelter'}</td>
                <td class="p-3 font-semibold">${d.quantity_kg || 20} kg</td>
                <td class="p-3 text-on-surface-variant">Just now</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">Completed</span></td>
                <td class="p-3"><button onclick="alert('Viewing Proof of Delivery Receipt #${d.id}')" class="text-primary-container font-bold hover:underline">View Receipt</button></td>
              `;
              historyBody.prepend(tr);
            }
          });
        }
      }

      // Update KPI metrics
      const metricEls = document.querySelectorAll('.font-metric-val');
      if (metricEls.length >= 3) {
        metricEls[0].textContent = completed.length;
        metricEls[1].textContent = totalWeightKg > 0 ? `${totalWeightKg} kg` : '0 kg';
        metricEls[2].textContent = completed.length > 0 ? '5.0 ★' : '0.0 ★';
      }
    }

    // 2. Driver Dashboard Page (driver-dashboard.html)
    if (path.includes('driver-dashboard') && info.isNew) {
      // Metric counters on driver dashboard
      const dashboardMetrics = document.querySelectorAll('.font-metric-val');
      if (dashboardMetrics.length >= 4) {
        dashboardMetrics[0].textContent = activeMission ? '1' : '0';
        dashboardMetrics[2].textContent = completed.length;
        dashboardMetrics[3].textContent = totalWeightKg > 0 ? `${totalWeightKg} kg` : '0 kg';
      }

      if (!activeMission) {
        // Reset Vehicle Load progress bar and text
        const progressFill = document.querySelector('.bg-primary-container.rounded-full');
        if (progressFill && progressFill.style) progressFill.style.width = '0%';

        document.querySelectorAll('span, p').forEach(el => {
          if (el.textContent.includes('48 / 80 kg capacity')) {
            el.textContent = '0 / 80 kg capacity';
          }
          if (el.textContent.includes('1 active drop-off scheduled')) {
            el.textContent = '0 active drop-offs scheduled';
          }
          if (el.textContent.includes('Remaining Payload: 32 kg available')) {
            el.textContent = 'Remaining Payload: 80 kg available';
          }
        });

        // Summary Active Pickup card
        document.querySelectorAll('.bg-surface-container-lowest').forEach(card => {
          const txt = card.textContent;
          if (txt.includes('Active Pickup') && (txt.includes('DON-') || txt.includes('En Route') || txt.includes('Rice & Curry') || txt.includes('Green Leaf'))) {
            card.innerHTML = `
              <div class="flex items-start justify-between mb-2">
                <span class="font-label-md text-label-md text-on-surface-variant">Active Pickup</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-outline">
                  <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
              </div>
              <p class="text-xs text-outline mt-1">No active pickup mission currently assigned.</p>
              <a href="./driver-available.html" class="inline-block mt-3 px-3 py-1 bg-primary-container text-white rounded text-[11px] font-semibold hover:bg-primary">Browse Available Pickups</a>
            `;
          }
        });
      }

      // Clean static cards from pickups grid
      const grid = document.getElementById('driver-pickups-grid');
      if (grid) {
        grid.querySelectorAll('div').forEach(child => {
          if (!child.getAttribute('data-id') && !child.classList.contains('driver-live-card')) {
            child.remove();
          }
        });
      }
    }

    // 3. Driver Active Mission Page (driver-active.html)
    if (path.includes('driver-active') && info.isNew) {
      if (!activeMission) {
        const mainContainer = document.querySelector('main .flex.flex-col.w-full');
        if (mainContainer && !document.getElementById('empty-active-mission-banner')) {
          mainContainer.innerHTML = `
            <div id="empty-active-mission-banner" class="bg-surface-container-lowest rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm border border-outline-variant/30 my-8">
              <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <span class="material-symbols-outlined text-3xl">route</span>
              </div>
              <h2 class="text-xl font-bold text-on-surface">No Active Pickup Assigned</h2>
              <p class="text-xs text-on-surface-variant mt-2 max-w-md mx-auto leading-relaxed">
                You currently do not have an active food rescue mission in progress. Pickups you accept from the courier portal will appear here with live route navigation and temperature telemetry.
              </p>
              <div class="mt-6">
                <a href="./driver-available.html" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-white font-bold text-xs shadow-md hover:bg-primary transition-all">
                  <span class="material-symbols-outlined text-sm">search</span>
                  <span>Browse Available Pickups</span>
                </a>
              </div>
            </div>
          `;
        }
      }
    }

    // 4. Driver Impact Page (driver-impact.html)
    if (path.includes('driver-impact') && info.isNew) {
      if (completed.length === 0) {
        document.querySelectorAll('.font-metric-val').forEach(el => {
          const txt = el.textContent.trim();
          if (txt.includes('1,280') || txt.includes('840') || txt.includes('42') || txt.includes('#2')) {
            if (txt.includes('1,280')) el.textContent = '0';
            else if (txt.includes('840')) el.textContent = '0 kg';
            else if (txt.includes('42')) el.textContent = '0 Hours';
            else if (txt.includes('#2')) el.textContent = 'Active Courier';
          }
        });
      }
    }

    // 5. Driver Notifications Page (driver-notifications.html)
    if (path.includes('driver-notifications') && info.isNew) {
      if (completed.length === 0) {
        document.querySelectorAll('.p-4.rounded-xl').forEach(card => {
          if (card.textContent.includes('DON-9480') || card.textContent.includes('Verified Delivery')) {
            card.remove();
          }
        });
      }
    }
  }

  function cleanAndSyncRestaurantPortal(info, allDonations) {
    const path = window.location.pathname;
    if (!path.includes('restaurant')) return;

    const myDonations = allDonations.filter(d => 
      d.donor_name && (
        d.donor_name.toLowerCase() === info.restName.toLowerCase() ||
        d.donor_name.toLowerCase() === info.userName.toLowerCase()
      )
    );
    const activeBatches = myDonations.filter(d => d.status !== 'DELIVERED' && d.status !== 'EXPIRED');
    const completed = myDonations.filter(d => d.status === 'DELIVERED');
    const totalDonatedKg = completed.reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0);

    // 1. Restaurant Dashboard Page (restaurant-dashboard.html)
    if (path.includes('restaurant-dashboard') && info.isNew) {
      if (myDonations.length === 0) {
        // Reset KPI cards
        const kpiDonations = document.getElementById('kpi-donations');
        if (kpiDonations) kpiDonations.textContent = '0';

        document.querySelectorAll('.text-display-lg').forEach(el => {
          const t = el.textContent;
          if (t.includes('142')) el.innerHTML = `0 <span class="text-headline-sm font-headline-sm font-normal text-outline">kg</span>`;
          if (t.trim() === '3') el.textContent = '0';
        });

        // Clean Active Batches table
        const activeTableBody = document.querySelector('table tbody');
        if (activeTableBody) {
          activeTableBody.querySelectorAll('tr').forEach(tr => {
            if (!tr.getAttribute('data-id') && !tr.id.includes('real-batch')) tr.remove();
          });
          if (!document.getElementById('empty-active-batches')) {
            const tr = document.createElement('tr');
            tr.id = 'empty-active-batches';
            tr.innerHTML = `
              <td colspan="5" class="py-8 text-center text-outline text-xs">
                <span class="material-symbols-outlined text-3xl mb-1 text-outline/50 block">inventory_2</span>
                No active surplus batches right now.<br>
                <span class="text-xs text-outline/80">Click <b>Post Donation</b> above to create your first surplus food lot.</span>
              </td>
            `;
            activeTableBody.appendChild(tr);
          }
        }

        // Clean Recent Completed Donations table
        const recentTable = document.querySelectorAll('table tbody')[1] || document.querySelector('.divide-y.divide-outline-variant\\/20');
        if (recentTable) {
          recentTable.querySelectorAll('tr').forEach(tr => {
            if (!tr.getAttribute('data-id')) tr.remove();
          });
          if (!document.getElementById('empty-completed-donations')) {
            const tr = document.createElement('tr');
            tr.id = 'empty-completed-donations';
            tr.innerHTML = `
              <td colspan="6" class="py-8 text-center text-outline text-xs">
                <span class="material-symbols-outlined text-3xl mb-1 text-outline/50 block">history</span>
                No past donation activity yet.<br>
                <span class="text-xs text-outline/80">Your completed food rescue deliveries will appear here automatically.</span>
              </td>
            `;
            recentTable.appendChild(tr);
          }
        }
      } else {
        // If real donations exist, render active batches
        const activeTableBody = document.querySelector('table tbody');
        if (activeTableBody) {
          const emptyActive = document.getElementById('empty-active-batches');
          if (emptyActive && activeBatches.length > 0) emptyActive.remove();

          activeBatches.forEach(b => {
            if (!document.getElementById(`real-batch-${b.id}`)) {
              const tr = document.createElement('tr');
              tr.id = `real-batch-${b.id}`;
              tr.setAttribute('data-id', b.id);
              tr.className = 'hover:bg-surface-container-low transition-colors';
              tr.innerHTML = `
                <td class="p-3 font-bold">${b.id}</td>
                <td class="p-3 font-semibold text-primary">${b.title}</td>
                <td class="p-3 font-bold">${b.quantity_kg || 20} kg</td>
                <td class="p-3 text-outline">${b.pickup_window || 'Next 2h'}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">${b.status || 'AVAILABLE'}</span></td>
              `;
              activeTableBody.prepend(tr);
            }
          });
        }
      }
    }

    // 2. Restaurant Pickups Page (restaurant-pickups.html)
    if (path.includes('restaurant-pickups') && info.isNew) {
      if (activeBatches.length === 0) {
        const pickupGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3.gap-6');
        if (pickupGrid && !document.getElementById('empty-restaurant-pickups')) {
          pickupGrid.innerHTML = `
            <div id="empty-restaurant-pickups" class="col-span-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-10 text-center shadow-sm">
              <span class="material-symbols-outlined text-4xl text-outline mb-2 block">local_shipping</span>
              <h3 class="text-base font-bold text-on-surface">No Scheduled Pickups Yet</h3>
              <p class="text-xs text-outline mt-1 max-w-md mx-auto">
                When an NGO claims your surplus food batch or a courier driver is dispatched, live driver details and pickup milestone tracking will appear here.
              </p>
              <div class="mt-4">
                <a href="./restaurant-post.html" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">add_circle</span> Post Surplus Donation
                </a>
              </div>
            </div>
          `;
        }
      }
    }

    // 3. Restaurant Notifications Page (restaurant-notifications.html)
    if (path.includes('restaurant-notifications') && info.isNew) {
      if (myDonations.length === 0) {
        document.querySelectorAll('.p-4.rounded-xl').forEach(card => {
          if (card.textContent.includes('Rahul Sharma Assigned') || card.textContent.includes('Hope Shelter')) {
            card.remove();
          }
        });
      }
    }

    // 4. Restaurant Impact Page (restaurant-impact.html)
    if (path.includes('restaurant-impact') && info.isNew) {
      if (completed.length === 0) {
        document.querySelectorAll('.font-metric-val, .text-display-lg').forEach(el => {
          const t = el.textContent;
          if (t.includes('1,850') || t.includes('3,700') || t.includes('1,48,000') || t.includes('42')) {
            if (t.includes('1,850')) el.textContent = '0 kg';
            else if (t.includes('3,700')) el.textContent = '0';
            else if (t.includes('1,48,000')) el.textContent = '₹0';
            else if (t.includes('42')) el.textContent = '0';
          }
        });
      }
    }

    // 5. Restaurant History Page (restaurant-history.html)
    if (path.includes('restaurant-history') && info.isNew) {
      if (myDonations.length === 0) {
        const emptyHistory = document.getElementById('empty-donor-history');
        const tableWrapper = document.getElementById('donor-history-table-wrapper');
        const tbody = document.getElementById('donor-history-tbody');
        const countBadge = document.getElementById('history-count-badge');

        if (tbody) tbody.innerHTML = '';
        if (emptyHistory) emptyHistory.classList.remove('hidden');
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (countBadge) countBadge.textContent = '0 Records';

        const totalEl = document.getElementById('metric-total-donations');
        const qtyEl = document.getElementById('metric-total-quantity');
        const taxEl = document.getElementById('metric-tax-claimed');
        const sheltersEl = document.getElementById('metric-shelters-supported');

        if (totalEl) totalEl.textContent = '0';
        if (qtyEl) qtyEl.textContent = '0 kg';
        if (taxEl) taxEl.textContent = '₹0';
        if (sheltersEl) sheltersEl.textContent = '0';
      }
    }
  }

  function cleanAndSyncNGOPortal(info, allDonations) {
    const path = window.location.pathname;
    if (!path.includes('ngo')) return;

    const myRescues = allDonations.filter(d => 
      d.recipient_ngo && (
        d.recipient_ngo.toLowerCase() === info.ngoName.toLowerCase() ||
        d.recipient_ngo.toLowerCase() === info.userName.toLowerCase()
      )
    );
    const completed = myRescues.filter(d => d.status === 'DELIVERED');
    const claimedIncoming = myRescues.filter(d => d.status === 'CLAIMED' || d.status === 'EN_ROUTE');
    const totalRescuedKg = completed.reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0);

    if (info.isNew && myRescues.length === 0) {
      // 1. Reset 4 Statistics Grid
      const statAccepted = document.getElementById('stat-accepted-today');
      if (statAccepted) statAccepted.textContent = '0';
      const statActive = document.getElementById('stat-active-rescues');
      if (statActive) statActive.textContent = '0';
      const statImpact = document.getElementById('stat-verified-impact');
      if (statImpact) statImpact.textContent = '0 kg';

      // 2. Reset Capacity Gauges
      const capText = document.getElementById('capacity-stat-text');
      if (capText) capText.textContent = '0 / 100 kg';
      const capBar = document.getElementById('capacity-progress-bar');
      if (capBar && capBar.style) capBar.style.width = '0%';
      const capRem = document.getElementById('capacity-remaining-text');
      if (capRem) capRem.innerHTML = 'Available capacity: <strong class="text-brand-dark font-medium">100 kg remaining</strong>';
      const capBadge = document.getElementById('capacity-badge');
      if (capBadge) capBadge.textContent = 'Optimal (Empty Buffer)';

      const capHeading = document.getElementById('capacity-tab-heading');
      if (capHeading) capHeading.textContent = '0 / 100 kg';
      const capTabBar = document.getElementById('capacity-tab-bar');
      if (capTabBar && capTabBar.style) capTabBar.style.width = '0%';
      const capTabSub = document.getElementById('capacity-tab-sub');
      if (capTabSub) capTabSub.innerHTML = 'Remaining buffer: <strong>100 kg</strong>';

      // 3. Hide / Clean Active En Route Card
      const enRouteTracker = document.getElementById('active-shipment-card');
      if (enRouteTracker && (enRouteTracker.textContent.includes('TRK-9821') || enRouteTracker.textContent.includes('Rahul Sharma') || enRouteTracker.textContent.includes('Pasta & Marinara'))) {
        enRouteTracker.innerHTML = `
          <div class="p-6 text-center text-xs text-brand-secondary">
            <span class="material-symbols-outlined text-3xl mb-1 text-brand-secondary/50 block">local_shipping</span>
            No shipments currently en route.<br>
            <span class="text-xs text-brand-secondary/80">Claim an available donation from the feed below to schedule your delivery.</span>
          </div>
        `;
      }

      // 4. Clean Completed Deliveries Today Table (TRK-9780)
      const completedTableBody = document.getElementById('completed-deliveries-table-body');
      if (completedTableBody) {
        completedTableBody.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id') && !tr.id.includes('real-ngo')) tr.remove();
        });
        if (!document.getElementById('empty-ngo-completed')) {
          const tr = document.createElement('tr');
          tr.id = 'empty-ngo-completed';
          tr.innerHTML = `
            <td colspan="7" class="p-8 text-center text-brand-secondary text-xs">
              <span class="material-symbols-outlined text-3xl mb-1 text-brand-secondary/50 block">inventory_2</span>
              No past delivery activity yet.<br>
              <span class="text-xs text-brand-secondary/80">Claim available surplus food from the donations feed to receive fresh meals.</span>
            </td>
          `;
          completedTableBody.appendChild(tr);
        }
      }

      // 5. Clean History Tab
      const historyTable = document.querySelector('#history-tab tbody');
      if (historyTable) {
        historyTable.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id')) tr.remove();
        });
        if (!document.getElementById('empty-ngo-history')) {
          const tr = document.createElement('tr');
          tr.id = 'empty-ngo-history';
          tr.innerHTML = `
            <td colspan="8" class="p-8 text-center text-brand-secondary text-xs">
              <span class="material-symbols-outlined text-3xl mb-1 text-brand-secondary/50 block">history</span>
              No historical rescue archives logged yet for this shelter.
            </td>
          `;
          historyTable.appendChild(tr);
        }
      }
    } else if (info.isNew && myRescues.length > 0) {
      // Dynamic updates if real rescues were done
      const statAccepted = document.getElementById('stat-accepted-today');
      if (statAccepted) statAccepted.textContent = completed.length;
      const statActive = document.getElementById('stat-active-rescues');
      if (statActive) statActive.textContent = claimedIncoming.length;
      const statImpact = document.getElementById('stat-verified-impact');
      if (statImpact) statImpact.textContent = `${totalRescuedKg} kg`;

      const capText = document.getElementById('capacity-stat-text');
      if (capText) capText.textContent = `${totalRescuedKg} / 100 kg`;
      const capBar = document.getElementById('capacity-progress-bar');
      if (capBar && capBar.style) capBar.style.width = `${Math.min(100, totalRescuedKg)}%`;
    }
  }

  function checkAndCleanUserData() {
    const info = getUserInfo();
    syncNamesAcrossPage(info);

    const allDonations = getLocalDonations();
    cleanAndSyncDriverPortal(info, allDonations);
    cleanAndSyncRestaurantPortal(info, allDonations);
    cleanAndSyncNGOPortal(info, allDonations);
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAndCleanUserData();
    setTimeout(checkAndCleanUserData, 100);
    setTimeout(checkAndCleanUserData, 400);
    setTimeout(checkAndCleanUserData, 1200);

    window.addEventListener('storage', checkAndCleanUserData);
    window.addEventListener('profileUpdated', checkAndCleanUserData);
  });
})();

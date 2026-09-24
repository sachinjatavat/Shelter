/* ==========================================================================
   SURPLUS-TO-SHELTER NEW USER CLEAN SLATE & HISTORY ISOLATION ENGINE
   ========================================================================== */

(function () {
  function checkAndCleanNewUserHistory() {
    const isNewUser = localStorage.getItem('is_new_user') === 'true';
    if (!isNewUser) return;

    const path = window.location.pathname;

    // 1. Driver History Page (driver-history.html)
    if (path.includes('driver-history')) {
      const historyBody = document.querySelector('tbody');
      if (historyBody) {
        historyBody.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id')) {
            tr.remove();
          }
        });
      }
      // Reset metrics for new user
      document.querySelectorAll('.font-metric-val').forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('142') || text.includes('2.4') || text.includes('4.98')) {
          if (text.includes('142')) el.textContent = '0';
          else if (text.includes('2.4')) el.textContent = '0 kg';
          else if (text.includes('4.98')) el.textContent = '5.0 ★';
        }
      });
    }

    // 2. Driver Dashboard Page (driver-dashboard.html)
    if (path.includes('driver-dashboard')) {
      const grid = document.getElementById('driver-pickups-grid');
      if (grid) {
        grid.querySelectorAll('div').forEach(child => {
          if (!child.getAttribute('data-id') && !child.classList.contains('driver-live-card')) {
            child.remove();
          }
        });
      }
    }

    // 3. Driver Available Page (driver-available.html)
    if (path.includes('driver-available')) {
      const pickupsBody = document.getElementById('pickupsBody');
      if (pickupsBody) {
        pickupsBody.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id')) {
            tr.remove();
          }
        });
      }
    }

    // 4. NGO Dashboard Page (ngo-dashboard.html)
    if (path.includes('ngo-dashboard')) {
      const ngoGrid = document.getElementById('donations-grid-container');
      if (ngoGrid) {
        ngoGrid.querySelectorAll('article, .donation-card').forEach(card => {
          if (!card.getAttribute('data-id')) {
            card.remove();
          }
        });
      }
      const ngoTableBody = document.querySelector('#donations-tab tbody');
      if (ngoTableBody) {
        ngoTableBody.querySelectorAll('tr').forEach(tr => {
          if (!tr.getAttribute('data-id')) {
            tr.remove();
          }
        });
      }
    }

    // 5. Restaurant Donations & Pickups Pages
    if (path.includes('restaurant-donations') || path.includes('restaurant-pickups') || path.includes('restaurant-dashboard')) {
      document.querySelectorAll('tr, .donation-card, article').forEach(el => {
        const hasId = el.getAttribute('data-id');
        const text = el.textContent;
        if (!hasId && (text.includes('DON-') || text.includes('Hope Shelter') || text.includes('Annapurna'))) {
          el.remove();
        }
      });
    }

    // 6. Update dynamic counters
    const liveCardsCount = document.querySelectorAll('[data-id]').length;
    const availStat = document.getElementById('stat-available-donations');
    if (availStat) availStat.textContent = liveCardsCount;
    const badgeCount = document.getElementById('donations-badge-count');
    if (badgeCount) badgeCount.textContent = liveCardsCount;
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAndCleanNewUserHistory();
    setTimeout(checkAndCleanNewUserHistory, 300);
    setTimeout(checkAndCleanNewUserHistory, 800);
  });
})();

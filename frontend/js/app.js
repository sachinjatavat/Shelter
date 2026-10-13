/**
 * SURPLUS-TO-SHELTER Unified Platform Controller
 */

// State Management
const AppState = {
  currentPortal: 'auth',
  currentRole: 'restaurant',
  user: {
    name: 'Fresh Harvest Bistro',
    role: 'restaurant',
    avatar: 'FH',
    email: 'manager@freshharvest.org'
  },
  subviews: {
    restaurant: 'dashboard',
    ngo: 'dashboard',
    admin: 'dashboard',
    driver: 'dashboard'
  },
  donations: [
    {
      id: 'DON-9482',
      title: '50 Meals - Fresh Prepared Rice & Curry',
      donor: 'Fresh Harvest Bistro',
      ngo: 'Hope Shelter',
      status: 'Ready for Pickup',
      weight: '35 kg',
      expiry: '4 Hours',
      pickupWindow: '6:30 PM - 8:00 PM'
    },
    {
      id: 'DON-9483',
      title: '30 Meals - Bakery Bread & Pastries',
      donor: 'Artisan Bakery',
      ngo: 'City Food Bank',
      status: 'Claimed',
      weight: '18 kg',
      expiry: '6 Hours',
      pickupWindow: '7:00 PM - 9:00 PM'
    }
  ]
};

// Portal Metadata
const PortalConfig = {
  auth: {
    badge: 'Login & Auth Portal',
    subnav: []
  },
  restaurant: {
    badge: 'Restaurant Portal',
    user: 'Fresh Harvest Bistro',
    avatar: 'FH',
    subnav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'post', label: 'Post Surplus Food', icon: 'plus-circle' },
      { id: 'match', label: 'Recipient Matching', icon: 'git-merge' }
    ]
  },
  ngo: {
    badge: 'NGO / Shelter Portal',
    user: 'Hope Shelter & Care Center',
    avatar: 'HS',
    subnav: [
      { id: 'dashboard', label: 'Shelter Dashboard', icon: 'home' },
      { id: 'claims', label: 'Claim Food', icon: 'shopping-bag' },
      { id: 'log', label: 'Intake Log', icon: 'clipboard-list' }
    ]
  },
  admin: {
    badge: 'Admin Command Center',
    user: 'System Administrator',
    avatar: 'SA',
    subnav: [
      { id: 'dashboard', label: 'Command Dashboard', icon: 'shield' },
      { id: 'live', label: 'Live Operations', icon: 'radar' },
      { id: 'dispatch', label: 'Matching & Dispatch', icon: 'send' }
    ]
  },
  driver: {
    badge: 'Driver Courier Portal',
    user: 'Marco R. (Fleet Driver #402)',
    avatar: 'MR',
    subnav: [
      { id: 'dashboard', label: 'Driver Dashboard', icon: 'truck' },
      { id: 'available', label: 'Available Pickups', icon: 'list-todo' },
      { id: 'active', label: 'Active Pickup', icon: 'navigation-2' },
      { id: 'route', label: 'Smart Route Navigation', icon: 'map-pin' }
    ]
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Surplus-To-Shelter Unified Web Platform Loaded.');
  refreshLucide();
  setupFormListeners();
});

function refreshLucide() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Toggle Portal Menu Dropdown
function togglePortalMenu() {
  const menu = document.getElementById('portalMenuDropdown');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Close portal menu when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('portalSwitcherDropdown');
  const menu = document.getElementById('portalMenuDropdown');
  if (dropdown && !dropdown.contains(e.target) && menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
  }
});

// Switch Main Portal
function switchPortal(portalName) {
  if (!PortalConfig[portalName]) return;

  AppState.currentPortal = portalName;

  // Hide all portal containers
  document.querySelectorAll('.portal-container').forEach(el => {
    el.classList.remove('active');
  });

  // Show target portal
  const target = document.getElementById(`portal-${portalName}`);
  if (target) {
    target.classList.add('active');
  }

  // Update Topbar Badge & User Info
  const config = PortalConfig[portalName];
  document.getElementById('portalBadgeText').textContent = config.badge;

  if (config.user) {
    document.getElementById('topUserName').textContent = config.user;
    document.getElementById('topUserAvatar').textContent = config.avatar;
  }

  // Update Sub-nav Tabs in Topbar
  renderTopbarSubnav(portalName);

  // Close dropdown menu if open
  const menu = document.getElementById('portalMenuDropdown');
  if (menu) menu.classList.add('hidden');

  // Trigger Lucide Icon refresh
  setTimeout(refreshLucide, 50);

  showToast(`Switched to ${config.badge}`, 'info');
}

// Render Topbar Subnav Tabs
function renderTopbarSubnav(portalName) {
  const container = document.getElementById('portal-subnav-container');
  if (!container) return;

  const config = PortalConfig[portalName];
  if (!config.subnav || config.subnav.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  const activeSub = AppState.subviews[portalName] || config.subnav[0].id;

  container.innerHTML = config.subnav.map(tab => `
    <button onclick="switchSubview('${portalName}', '${tab.id}')"
      class="px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
        activeSub === tab.id
          ? 'bg-[#16803C] text-white shadow-sm'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }">
      <i data-lucide="${tab.icon}" class="w-3.5 h-3.5"></i>
      <span>${tab.label}</span>
    </button>
  `).join('');

  refreshLucide();
}

// Switch Subview within a Portal
function switchSubview(portalName, subviewName) {
  AppState.subviews[portalName] = subviewName;

  // Prefix mapping for DOM IDs
  let prefix = '';
  if (portalName === 'restaurant') prefix = 'rest-subview-';
  else if (portalName === 'ngo') prefix = 'ngo-subview-';
  else if (portalName === 'admin') prefix = 'admin-subview-';
  else if (portalName === 'driver') prefix = 'driver-subview-';

  const container = document.getElementById(`portal-${portalName}`);
  if (container) {
    container.querySelectorAll('.subview').forEach(el => {
      el.classList.remove('active');
    });

    const target = document.getElementById(`${prefix}${subviewName}`);
    if (target) {
      target.classList.add('active');
    }
  }

  // Update topbar subnav highlight
  renderTopbarSubnav(portalName);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(refreshLucide, 50);
}

// Role Selection on Login Screen
function selectLoginRole(role) {
  AppState.currentRole = role;

  document.querySelectorAll('.role-card').forEach(card => {
    card.classList.remove('selected');
  });

  const card = document.getElementById(`role-btn-${role}`);
  if (card) {
    card.classList.add('selected');
  }

  const label = document.getElementById('selectedRoleLabel');
  if (label) {
    const rolesMap = {
      restaurant: '<i data-lucide="store" class="w-3.5 h-3.5"></i> Restaurant',
      ngo: '<i data-lucide="heart-handshake" class="w-3.5 h-3.5"></i> NGO / Shelter',
      driver: '<i data-lucide="truck" class="w-3.5 h-3.5"></i> Driver',
      admin: '<i data-lucide="shield" class="w-3.5 h-3.5"></i> Admin Command'
    };
    label.innerHTML = rolesMap[role] || role;
  }

  refreshLucide();
}

// Fill Test Account Helper
function fillTestAccount(role) {
  selectLoginRole(role);
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  const credentials = {
    restaurant: { email: 'manager@freshharvest.org', pass: 'password123' },
    ngo: { email: 'coordinator@hopeshelter.org', pass: 'password123' },
    driver: { email: 'driver402@surplusrescue.org', pass: 'password123' },
    admin: { email: 'admin@surplusrescue.org', pass: 'admin2026' }
  };

  if (emailInput && passwordInput && credentials[role]) {
    emailInput.value = credentials[role].email;
    passwordInput.value = credentials[role].pass;
  }
}

// Handle Login Form Submit
function handleLoginSubmit(e) {
  if (e) e.preventDefault();

  const spinner = document.getElementById('loginBtnSpinner');
  const text = document.getElementById('loginBtnText');

  if (spinner) spinner.classList.remove('hidden');
  if (text) text.classList.add('hidden');

  setTimeout(() => {
    if (spinner) spinner.classList.add('hidden');
    if (text) text.classList.remove('hidden');

    switchPortal(AppState.currentRole);
  }, 400);
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
  }
  refreshLucide();
}

// Navigation Helper
function navigateTo(view) {
  if (view === 'login') {
    switchPortal('auth');
  } else if (view === 'signup') {
    const loginView = document.getElementById('view-login');
    const signupView = document.getElementById('view-signup');
    if (loginView) loginView.classList.add('hidden');
    if (signupView) signupView.classList.remove('hidden');
    refreshLucide();
  }
}

// Setup Form Submission Interactivity
function setupFormListeners() {
  document.addEventListener('submit', (e) => {
    const form = e.target;

    // Check if it's a Surplus Food Post Form
    if (form.id === 'postSurplusForm' || form.action.includes('post') || form.querySelector('button[type="submit"]')?.textContent.toLowerCase().includes('post')) {
      e.preventDefault();
      showToast('🎉 Surplus Food Batch Posted! NGO & Driver notifications sent.', 'success');
      setTimeout(() => {
        switchSubview('restaurant', 'dashboard');
      }, 1000);
    }
  });
}

// Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : type === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-100 border border-slate-700';

  toast.className = `toast-anim px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center justify-between pointer-events-auto gap-3 ${bgClass}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}

// Global Exports
window.switchPortal = switchPortal;
window.switchSubview = switchSubview;
window.togglePortalMenu = togglePortalMenu;
window.selectLoginRole = selectLoginRole;
window.fillTestAccount = fillTestAccount;
window.handleLoginSubmit = handleLoginSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.navigateTo = navigateTo;
window.showToast = showToast;

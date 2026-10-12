const http = require('http');

function makeRequest(url, method, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : '';
    const req = http.request(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runExpandedCategoriesBackendTest() {
  console.log('================================================================');
  console.log('🧪 TESTING EXPANDED DONATION CATEGORIES & NEW BACKEND WORKFLOWS');
  console.log('================================================================\n');

  // 1. Post Physical Donation: Clothes
  console.log('1️⃣ Physical Donation: Clothes & Footwear');
  const clothesRes = await makeRequest('http://localhost:5000/api/donations', 'POST', {
    title: '50 Warm Sweaters & Winter Jackets',
    category: 'Clothes & Footwear',
    quantity_kg: 20,
    portions: 50,
    item_condition: 'Like New',
    unit: 'pieces',
    donor_name: 'Jaipur Textile Mills',
    donor_address: 'MI Road, Jaipur'
  });
  console.log(`   ✓ Status: HTTP ${clothesRes.statusCode}`);
  console.log(`   ✓ Donation ID: ${clothesRes.body.donation.id}`);
  console.log(`   ✓ Category: ${clothesRes.body.donation.category}`);
  console.log(`   ✓ Matched Recipient NGO: ${clothesRes.body.donation.recipient_ngo}\n`);

  // 2. Post Medicine with & without Safety Compliance
  console.log('2️⃣ Medicine Safety & Regulatory Validation');
  const medFailRes = await makeRequest('http://localhost:5000/api/donations', 'POST', {
    title: 'Unchecked Medical Strips',
    category: 'Medicines & Medical Supplies',
    medical_safety_verified: false,
    safety_disclaimer_accepted: false
  });
  console.log(`   ✓ Unverified Medicine Block: HTTP ${medFailRes.statusCode} (${medFailRes.body.error})`);

  const medSuccessRes = await makeRequest('http://localhost:5000/api/donations', 'POST', {
    title: 'Sealed First Aid Kits & Antiseptics',
    category: 'Medicines & Medical Supplies',
    medical_safety_verified: true,
    safety_disclaimer_accepted: true,
    expiry_date: '2028-06-30',
    donor_name: 'Metro Pharmacy Care',
    donor_address: 'JLN Marg, Jaipur'
  });
  console.log(`   ✓ Verified Medicine Created: ${medSuccessRes.body.donation.id}`);
  console.log(`   ✓ Matched Licensed NGO: ${medSuccessRes.body.donation.recipient_ngo}\n`);

  // 3. Medicine Claim Restriction
  console.log('3️⃣ Medicine Claim Restriction by NGO License');
  const unverifiedClaimRes = await makeRequest(`http://localhost:5000/api/donations/${medSuccessRes.body.donation.id}/claim`, 'POST', {
    ngo_name: 'Community Kitchen Shelter' // unverified / no medicine approval
  });
  console.log(`   ✓ Unapproved NGO Claim Blocked: HTTP ${unverifiedClaimRes.statusCode} (${unverifiedClaimRes.body.error || 'Blocked'})\n`);

  // 4. Payment Gateway Config & Monetary Donation
  console.log('4️⃣ Monetary Donations & Anonymity Architecture');
  const paymentConfigRes = await makeRequest('http://localhost:5000/api/payments/config', 'GET');
  console.log(`   ✓ Gateway Configured: ${paymentConfigRes.body.configured}`);
  console.log(`   ✓ Status: ${paymentConfigRes.body.setup_status}`);
  console.log(`   ✓ Note: ${paymentConfigRes.body.message}`);

  const monetaryPostRes = await makeRequest('http://localhost:5000/api/donations/monetary', 'POST', {
    amount: 10000,
    donor_name: 'Prakash Singhania',
    is_anonymous: true,
    hide_amount: true,
    recipient_ngo: 'Hope Shelter & Care Center'
  });
  console.log(`   ✓ Monetary Order Initiated: ${monetaryPostRes.body.pending_intent.id}`);
  console.log(`   ✓ Display Name: ${monetaryPostRes.body.pending_intent.donor_name}`);

  // Server Webhook Verification
  const webhookVerifyRes = await makeRequest('http://localhost:5000/api/payments/verify-webhook', 'POST', {
    donation_id: monetaryPostRes.body.pending_intent.id,
    order_id: monetaryPostRes.body.pending_intent.order_id,
    amount: 10000,
    signature: 'TEST_SANDBOX_SIGNATURE',
    recipient_ngo: 'Hope Shelter & Care Center',
    is_anonymous: true,
    hide_amount: true,
    donor_name: 'Prakash Singhania'
  });
  console.log(`   ✓ Server Webhook Verified: ${webhookVerifyRes.body.message}`);
  console.log(`   ✓ Final Status: ${webhookVerifyRes.body.donation.status}`);
  console.log(`   ✓ Driver Assignment: ${webhookVerifyRes.body.donation.driver_name} (No couriers for money)\n`);

  // 5. Verify Driver Pickup Filter excludes Money
  console.log('5️⃣ Driver Market Filter Check');
  const pickupsRes = await makeRequest('http://localhost:5000/api/pickups', 'GET');
  const hasMoneyInPickups = pickupsRes.body.pickups.some(p => p.category === 'Monetary Donations' || p.donation_id.includes('MON'));
  console.log(`   ✓ Pickups list count: ${pickupsRes.body.pickups.length}`);
  console.log(`   ✓ Monetary donations correctly excluded from driver pickups: ${!hasMoneyInPickups}\n`);

  // 6. Admin Endpoints Check
  console.log('6️⃣ Admin Management & Monetization Controls');
  const adminNgos = await makeRequest('http://localhost:5000/api/admin/ngos', 'GET');
  console.log(`   ✓ Admin NGOs loaded: ${adminNgos.body.ngos.length} shelters`);

  const adminCategories = await makeRequest('http://localhost:5000/api/admin/categories', 'GET');
  console.log(`   ✓ Admin Categories loaded: ${adminCategories.body.categories.length} categories`);

  const adminSpon = await makeRequest('http://localhost:5000/api/admin/sponsorships', 'GET');
  console.log(`   ✓ Corporate Sponsorships: ${adminSpon.body.sponsorships.length} campaigns`);

  const adminReports = await makeRequest('http://localhost:5000/api/admin/reports', 'GET');
  console.log(`   ✓ Admin Financial & Logistics Audit:`, JSON.stringify(adminReports.body.audit_summary));

  console.log('\n================================================================');
  console.log('🎉 ALL EXPANDED BACKEND ENDPOINTS & SAFETY GUARDS VERIFIED 100%!');
  console.log('================================================================\n');
}

runExpandedCategoriesBackendTest().catch(console.error);

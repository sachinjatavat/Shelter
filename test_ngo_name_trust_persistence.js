/**
 * End-to-End Validation: NGO Name Persistence & Government Trustability Evaluation
 */
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = { ...options, headers: { ...options.headers } };
    if (payload) {
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING NGO NAME PERSISTENCE & TRUSTABILITY EVAL');
  console.log('====================================================');
  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      process.exitCode = 1;
    }
  }

  // 1. Rename to an unverified / non-trustable NGO
  console.log('\n📌 STEP 1: Rename to Non-Trustable Unverified Organization');
  const renameFake = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'ngo',
      'x-user-email': 'coordinator@hopeshelter.org'
    }
  }, {
    old_name: 'Hope Shelter',
    new_name: 'Unknown Random Charitable Trust',
    role: 'ngo',
    email: 'coordinator@hopeshelter.org'
  });

  assert('Profile update API responds 200 OK', renameFake.status === 200);
  assert('Profile update returns new name', renameFake.body.updated_name === 'Unknown Random Charitable Trust');

  // Check application endpoint
  const checkApp = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ngo/verification/application/coordinator@hopeshelter.org',
    method: 'GET',
    headers: { 'x-user-role': 'admin' }
  });

  assert('Application persists new legal name', checkApp.body.application && checkApp.body.application.legal_name === 'Unknown Random Charitable Trust');
  assert('Non-trustable entity unlinks Darpan ID', !checkApp.body.application.darpan_id || checkApp.body.application.darpan_id === '');
  assert('Non-trustable entity status is PENDING_REVIEW', checkApp.body.application.status === 'PENDING_REVIEW');

  // Check registry lookup for this non-trustable entity
  const checkRegistryFake = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ngo/verification/lookup-registry?name=Unknown%20Random%20Charitable%20Trust',
    method: 'GET',
    headers: { 'x-user-role': 'admin' }
  });

  assert('Registry returns found: false for unknown NGO', checkRegistryFake.body.found === false);
  assert('Registry returns is_trustable: false for unknown NGO', checkRegistryFake.body.is_trustable === false);

  // 2. Admin verification list shows updated name
  console.log('\n📌 STEP 2: Admin Portal Application List');
  const adminApps = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/verification/applications',
    method: 'GET',
    headers: { 'x-user-role': 'admin' }
  });

  assert('Admin applications returned successfully', adminApps.status === 200 && Array.isArray(adminApps.body.applications));
  const targetApp = adminApps.body.applications.find(a => a.ngo_id === 'coordinator@hopeshelter.org');
  assert('Admin sees updated NGO name (NOT Hope Shelter)', targetApp && targetApp.legal_name === 'Unknown Random Charitable Trust');

  // 3. Rename to authentic, registered trustable NGO (Akshaya Patra Foundation)
  console.log('\n📌 STEP 3: Rename to Genuine Registered Trustable NGO (Akshaya Patra)');
  const renameReal = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'ngo',
      'x-user-email': 'coordinator@hopeshelter.org'
    }
  }, {
    old_name: 'Unknown Random Charitable Trust',
    new_name: 'The Akshaya Patra Foundation',
    role: 'ngo',
    email: 'coordinator@hopeshelter.org'
  });

  assert('Rename to Akshaya Patra responds 200 OK', renameReal.status === 200);

  const checkRealApp = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ngo/verification/application/coordinator@hopeshelter.org',
    method: 'GET',
    headers: { 'x-user-role': 'admin' }
  });

  assert('Application reflects The Akshaya Patra Foundation', checkRealApp.body.application.legal_name === 'The Akshaya Patra Foundation');
  assert('Government Darpan ID automatically linked (KA/2016/0109283)', checkRealApp.body.application.darpan_id === 'KA/2016/0109283');
  assert('Verified government status established', checkRealApp.body.application.status === 'VERIFIED');

  // Check registry lookup for Akshaya Patra
  const checkRegistryReal = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ngo/verification/lookup-registry?name=The%20Akshaya%20Patra%20Foundation',
    method: 'GET',
    headers: { 'x-user-role': 'admin' }
  });

  assert('Registry returns found: true for registered NGO', checkRegistryReal.body.found === true);
  assert('Registry marks entity as is_trustable: true', checkRegistryReal.body.is_trustable === true);
  assert('Registry returns past grants and age', checkRegistryReal.body.data && checkRegistryReal.body.data.past_grants && checkRegistryReal.body.data.past_grants.length > 0);

  console.log('\n====================================================');
  console.log(`🏁 TESTS COMPLETED: ${passed}/${total} PASSED`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

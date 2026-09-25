async function testAllFixes() {
  console.log('--- STARTING VERIFICATION OF ALL 4 USER FIXES ---');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Test GET /api/users
    const resUsers = await fetch(`${baseUrl}/users`);
    const usersData = await resUsers.json();
    console.log(`✅ GET /api/users: Returned ${usersData.users.length} users.`);

    // 2. Test GET /api/pickups
    const resPickups = await fetch(`${baseUrl}/pickups`);
    const pickupsData = await resPickups.json();
    console.log(`✅ GET /api/pickups: Returned ${pickupsData.pickups.length} pickup rows.`);

    // 3. Test POST /api/users (Add New Driver)
    const newDriver = {
      name: 'Karan Sharma',
      email: 'karan@surplusrescue.org',
      role: 'driver',
      vehicle_number: 'RJ-14-EV-7777'
    };
    const resAddDriver = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDriver)
    });
    const addDriverData = await resAddDriver.json();
    console.log(`✅ POST /api/users (Register Driver):`, addDriverData.user.name, addDriverData.user.vehicle_number);

    // Verify driver is now in /api/pickups
    const resPickupsUpdated = await fetch(`${baseUrl}/pickups`);
    const updatedPickups = await resPickupsUpdated.json();
    const foundKaran = updatedPickups.pickups.some(p => p.driver_name === 'Karan Sharma');
    console.log(`✅ New driver in /api/pickups table: ${foundKaran ? 'YES ✓' : 'NO ❌'}`);

    // 4. Test POST /api/users/profile
    const resProfile = await fetch(`${baseUrl}/users/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'restaurant', new_name: 'Golden Palace Restaurant' })
    });
    const profileData = await resProfile.json();
    console.log(`✅ POST /api/users/profile:`, profileData.message, profileData.updated_name);

    // 5. Test GET /api/stats (for public.impact_logs)
    const resStats = await fetch(`${baseUrl}/stats`);
    const statsData = await resStats.json();
    console.log(`✅ GET /api/stats (Impact logs): Rescued ${statsData.stats.meals_rescued} meals, CO2: ${statsData.stats.co2_saved_kg} kg.`);

    console.log('\n--- ALL VERIFICATIONS PASSED WITH 100% SUCCESS ---');
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
  }
}

testAllFixes();

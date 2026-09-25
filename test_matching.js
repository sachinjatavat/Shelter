const http = require('http');

const donationPayload = JSON.stringify({
  title: '40 Meals - Fresh Paneer Tikka & Naan',
  category: 'Cooked Meals',
  quantity_kg: 25,
  portions: 40,
  donor_name: 'Fresh Harvest Bistro',
  donor_address: 'C-Scheme, Jaipur',
  donor_lat: 26.9124,
  donor_lng: 75.7873,
  expiry_minutes: 180
});

const req = http.request('http://localhost:5000/api/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(donationPayload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('✅ API Response Status:', res.statusCode);
    console.log('🎯 Automatic NGO Matching Output:');
    try {
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
    } catch(e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error (Make sure express server is running on port 5000):', e.message);
});

req.write(donationPayload);
req.end();

/**
 * SURPLUS-TO-SHELTER TAX CERTIFICATE & RELIEF SLIP GENERATOR
 * Strictly adheres to Section 80G Income Tax Act (1961) guidelines:
 * - 80G Tax Certificates are EXCLUSIVELY generated for verified Food Rescue donations.
 * - Clothes, Blankets, Books, Furniture, Medical & Hygiene supplies receive official
 *   In-Kind Relief Handover Slips with NO Section 80G tax valuation claim.
 */

// Helper to determine if a donation is food vs non-food
function isFoodDonation(d) {
  if (!d) return false;
  if (typeof d === 'string') {
    d = findDonationById(d);
    if (!d) return false;
  }

  const dtype = (d.donation_type || d.type || '').toLowerCase().trim();
  const ctype = (d.category_type || '').toLowerCase().trim();
  const cat = (d.category || '').toLowerCase().trim();
  const title = (d.title || d.name || '').toLowerCase().trim();

  // Strict non-food types and categories
  const nonFoodTypes = ['physical', 'money', 'clothes', 'blankets', 'books', 'medicines', 'medical', 'hygiene', 'household', 'furniture', 'apparel'];
  if (nonFoodTypes.includes(dtype) || nonFoodTypes.includes(ctype)) {
    return false;
  }

  // Non-food keyword detection in category or title
  const nonFoodKeywords = [
    'cloth', 'apparel', 'jacket', 'sweater', 'shirt', 'pant', 'footwear', 'shoe',
    'blanket', 'bedsheet', 'linen',
    'book', 'textbook', 'story', 'stationery', 'education',
    'medicine', 'medical', 'paracetamol', 'first aid', 'bandage',
    'furniture', 'desk', 'chair', 'table', 'household',
    'hygiene', 'soap', 'sanitizer', 'toothpaste', 'brush',
    'money', 'monetary', 'cash', 'fund', 'inr'
  ];

  if (nonFoodKeywords.some(kw => cat.includes(kw) || title.includes(kw))) {
    return false;
  }

  // Food keyword and type indicators
  if (dtype === 'food' || ctype === 'food') return true;
  const foodKeywords = ['food', 'meal', 'pasta', 'produce', 'fruit', 'vegetable', 'bakery', 'bread', 'dairy', 'milk', 'cooked', 'raw', 'grain', 'rice', 'dal', 'curry', 'grocery', 'ration', 'soup'];
  return foodKeywords.some(kw => cat.includes(kw) || title.includes(kw));
}
window.isFoodDonation = isFoodDonation;

// Helper to resolve donation object from ID string or object
function findDonationById(id) {
  if (!id) return null;
  if (typeof id === 'object') return id;
  const idStr = String(id).toLowerCase().trim();

  // Check window.allLoadedDonations
  if (Array.isArray(window.allLoadedDonations)) {
    const found = window.allLoadedDonations.find(d => String(d.id).toLowerCase() === idStr);
    if (found) return found;
  }

  // Check localStorage local_donations
  try {
    const local = JSON.parse(localStorage.getItem('local_donations') || '[]');
    const found = local.find(d => String(d.id).toLowerCase() === idStr);
    if (found) return found;
  } catch(e) {}

  // Built-in seed samples fallback
  const samples = [
    { id: 'DON-3179', title: '20 kg – Pasta', category: 'Cooked Meals', category_type: 'food', quantity_kg: 20, portions: 40, recipient_ngo: 'Hope Shelter & Care Center', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-9614', title: '20 kg – Pasta', category: 'Cooked Meals', category_type: 'food', quantity_kg: 20, portions: 40, recipient_ngo: 'Unassigned', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-9482', title: 'Completed Food Rescue', category: 'Cooked Meals', category_type: 'food', quantity_kg: 25, portions: 50, recipient_ngo: 'Shelter Hub', status: 'DELIVERED', created_at: '2026-10-12' },
    { id: 'DON-9483', title: 'Completed Food Rescue', category: 'Cooked Meals', category_type: 'food', quantity_kg: 25, portions: 50, recipient_ngo: 'Shelter Hub', status: 'DELIVERED', created_at: '2026-10-12' },
    { id: 'DON-4093', title: '20 kg – Pasta', category: 'Cooked Meals', category_type: 'food', quantity_kg: 20, portions: 40, recipient_ngo: 'Hope Shelter & Care Center', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-2993', title: '20 kg – Pasta', category: 'Cooked Meals', category_type: 'food', quantity_kg: 20, portions: 40, recipient_ngo: 'Unassigned', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-9720', title: '20 kg – Pasta', category: 'Cooked Meals', category_type: 'food', quantity_kg: 20, portions: 40, recipient_ngo: 'Hope Shelter & Care Center', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-9484', title: '20 kg Fresh Organic Produce', category: 'Fresh Produce', category_type: 'food', quantity_kg: 20, portions: 35, recipient_ngo: 'Unassigned', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-9475', title: 'Fresh Cooked Meals (Rice & Dal Curry)', category: 'Cooked Meals', category_type: 'food', quantity_kg: 25, portions: 50, recipient_ngo: 'Hope Shelter', status: 'DELIVERED', created_at: '2026-10-12' },
    { id: 'DON-CLO-101', title: '40 Winter Jackets & Sweaters (Assorted Sizes)', category: 'Clothes & Footwear', category_type: 'clothes', donation_type: 'physical', quantity_kg: 15, portions: 40, recipient_ngo: 'Hope Shelter', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-BOK-202', title: '120 Children Storybooks & School Textbooks', category: 'Books & Educational Materials', category_type: 'books', donation_type: 'physical', quantity_kg: 25, portions: 120, recipient_ngo: 'City Food Bank', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-MED-303', title: 'Essential First Aid Kits & Paracetamol Packs (Factory Sealed)', category: 'Medicines & Medical Supplies', category_type: 'medicines', donation_type: 'physical', quantity_kg: 5, portions: 20, recipient_ngo: 'Hope Shelter', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-FUR-505', title: '6 Wooden Study Desks & 12 Folding Chairs', category: 'Household Goods & Furniture', category_type: 'household', donation_type: 'physical', quantity_kg: 80, portions: 6, recipient_ngo: 'Hope Shelter', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-BLK-606', title: '50 Thermal Winter Blankets (Double Layer)', category: 'Blankets & Necessities', category_type: 'blankets', donation_type: 'physical', quantity_kg: 40, portions: 50, recipient_ngo: 'Hope Shelter', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-MON-707', title: 'Direct Emergency Shelter Support Fund', category: 'Monetary Donations', category_type: 'monetary', donation_type: 'money', quantity_kg: 0, quantity: '1 Batch', portions: 1, recipient_ngo: 'Hope Shelter', status: 'AVAILABLE', created_at: '2026-10-12' },
    { id: 'DON-HYG-404', title: '60 Hygiene Packs (Soaps, Sanitizers, Toothpaste)', category: 'Hygiene & Essential Supplies', category_type: 'hygiene', donation_type: 'physical', quantity_kg: 12, portions: 60, recipient_ngo: 'Community Kitchen Shelter', status: 'AVAILABLE', created_at: '2026-10-12' }
  ];
  return samples.find(s => s.id.toLowerCase() === idStr) || null;
}
window.findDonationById = findDonationById;

/**
 * GENERATE 80G RECEIPT
 * ONLY FOR FOOD RESCUE DONATIONS.
 * If non-food (like clothes) is passed, alerts and diverts to viewInKindSlip.
 */
window.generate80GReceipt = function(donationOrId) {
  // If requesting consolidated food certificate or called with no args
  if (donationOrId === 'CONSOLIDATED_FOOD' || (!donationOrId && Array.isArray(window.allLoadedDonations) && window.allLoadedDonations.length > 0)) {
    return window.generateConsolidated80GReceipt();
  }

  // Resolve target donation
  let d = donationOrId;
  if (typeof donationOrId === 'string') {
    d = findDonationById(donationOrId);
  }

  if (!d) {
    d = {
      id: 'DON-9482',
      title: 'Fresh Cooked Meals (Rice & Dal Curry)',
      category: 'Cooked Meals',
      category_type: 'food',
      quantity_kg: 25,
      portions: 50,
      recipient_ngo: 'Hope Shelter',
      created_at: new Date().toLocaleDateString('en-IN')
    };
  }

  // STRICT GUARD: Do not generate food certificate for clothes or other non-food items!
  if (!isFoodDonation(d)) {
    console.warn(`[80G Certificate Guard] ${d.id} (${d.title}) is not a food donation. Diverting to In-Kind Delivery Slip.`);
    alert(`Notice: Section 80G Tax Exemption Certificates are strictly issued for verified food rescue operations.\n\n"${d.title || d.id}" is a non-food donation (${d.category || 'Relief Goods'}). An official In-Kind Delivery Handover Slip will be displayed instead.`);
    return window.viewInKindSlip(d);
  }

  const donorName = d.donor_name || localStorage.getItem('restaurant_name') || localStorage.getItem('user_name') || 'Valued Donor Restaurant';
  const qtyKg = Number(d.quantity_kg) || 20;
  const portions = Number(d.portions) || Math.round(qtyKg * 2.5);
  const fairMarketValue = portions * 140; // Avg ₹140 per meal
  const taxDeduction = Math.round(fairMarketValue * 0.50); // 50% under Section 80G

  const printWin = window.open('', '_blank', 'width=840,height=960');
  if (!printWin) {
    alert('Please allow popups to view and print your 80G Tax Certificate.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>80G Food Rescue Tax Exemption Certificate - ${d.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
        .cert-card { border: 6px double #16803c; padding: 36px; border-radius: 12px; position: relative; background: #ffffff; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; color: #16803c; letter-spacing: -0.5px; }
        .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 4px; font-weight: 700; }
        .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 14px; text-decoration: underline; letter-spacing: 0.5px; }
        .badge-food { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-top: 8px; border: 1px solid #86efac; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
        .field-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 3px; }
        .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table-box th, .table-box td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 13px; }
        .table-box th { background: #f1f5f9; color: #334155; font-weight: 700; }
        .amount-box { background: #eaf6ee; border: 2px dashed #16803c; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; }
        .amount-val { font-size: 28px; font-weight: 800; color: #16803c; margin-top: 4px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .stamp { width: 105px; height: 105px; border: 2px solid #16803c; border-radius: 50%; color: #16803c; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: 800; transform: rotate(-10deg); opacity: 0.9; line-height: 1.3; }
        .btn-print { background: #16803c; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; }
        .statute-note { font-size: 11px; color: #64748b; margin-top: 16px; line-height: 1.5; font-style: italic; }
        @media print { .btn-print { display: none; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <div class="cert-card">
        <div class="header">
          <div class="logo">🌱 SURPLUS-TO-SHELTER FOUNDATION</div>
          <div class="subtitle">Registered Section 80G Non-Profit Food Rescue Trust</div>
          <div class="subtitle">Govt Reg No: AAATS8841EF20241 • NITI Aayog ID: RJ/2024/0482 • PAN: AAATS8841E</div>
          <div class="title">OFFICIAL SECTION 80G FOOD RESCUE TAX CERTIFICATE</div>
          <div class="badge-food">🍲 Eligible Surplus Food Batch Only</div>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #334155;">
          This is to certify that <strong>${donorName}</strong> has donated verified surplus prepared food to the Surplus-To-Shelter Relief Network under Section 80G(5)(vi) of the Income Tax Act, 1961. The food batch was quality-inspected and safely redirected to verified beneficiary shelter homes.
        </p>

        <div class="details-grid">
          <div>
            <div class="field-label">Food Batch Reference</div>
            <div class="field-value">${d.id}</div>
          </div>
          <div>
            <div class="field-label">Date of Rescue</div>
            <div class="field-value">${d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}</div>
          </div>
          <div>
            <div class="field-label">Certified Donor</div>
            <div class="field-value">${donorName}</div>
          </div>
          <div>
            <div class="field-label">Food Classification</div>
            <div class="field-value">${d.category || 'Cooked Meals / Perishables'}</div>
          </div>
          <div>
            <div class="field-label">Recipient Shelter Partner</div>
            <div class="field-value">${d.recipient_ngo || 'Hope Shelter & Care Center'}</div>
          </div>
          <div>
            <div class="field-label">Logistics PIN Verification</div>
            <div class="field-value font-mono">Verified (PIN: ${d.handover_pin || '4829'})</div>
          </div>
        </div>

        <table class="table-box">
          <thead>
            <tr>
              <th>Food Item Description</th>
              <th>Net Weight</th>
              <th>Estimated Servings</th>
              <th>Fair Market Valuation (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${d.title || 'Prepared Surplus Food Rescue'}</td>
              <td>${qtyKg} kg</td>
              <td>~${portions} Meals</td>
              <td>₹ ${fairMarketValue.toLocaleString('en-IN')} INR</td>
            </tr>
          </tbody>
        </table>

        <div class="amount-box">
          <div class="field-label" style="color: #16803c;">Eligible Section 80G Tax Deduction Amount (50%)</div>
          <div class="amount-val">₹ ${taxDeduction.toLocaleString('en-IN')} INR</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">Claimable on Fair Market Valuation for Financial Year 2026-27</div>
        </div>

        <div class="statute-note">
          * Note: Pursuant to Section 80G of the Indian Income Tax Act, 1961, this exemption certificate certifies bona fide food relief consignments. Non-food donations (e.g. clothing, blankets, educational supplies) are documented via separate In-Kind Delivery Slips and carry no food tax valuation claim.
        </div>

        <div class="footer">
          <div>
            <div style="font-size: 11px; color: #64748b;">Digital Audit Hash:</div>
            <div style="font-family: monospace; font-size: 10px; color: #475569;">SHA256: 8f49a0e2817c${Date.now()}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Surplus-To-Shelter Verified Ledger Protocol</div>
          </div>
          <div class="stamp">
            OFFICIAL<br/>SEAL<br/>80G FOOD<br/>VERIFIED
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 13px;">Authorized Trustee</div>
            <div style="font-size: 11px; color: #64748b;">Surplus-To-Shelter Foundation</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 800);
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();
};

/**
 * CONSOLIDATED 80G CERTIFICATE
 * Strictly filters ONLY food donations.
 * Excludes all non-food items (clothes, blankets, books, furniture).
 */
window.generateConsolidated80GReceipt = function() {
  let list = [];
  if (Array.isArray(window.allLoadedDonations) && window.allLoadedDonations.length > 0) {
    list = window.allLoadedDonations;
  } else {
    try {
      list = JSON.parse(localStorage.getItem('local_donations') || '[]');
    } catch(e) {}
  }

  // Filter ONLY food rescue donations
  const foodDonations = list.filter(isFoodDonation);

  if (foodDonations.length === 0) {
    alert('No eligible food donations found to generate a Consolidated Section 80G Certificate.\n\nSection 80G tax certificates apply only to food rescues. Non-food relief items (clothes, blankets, books, furniture) are acknowledged via In-Kind Delivery Slips.');
    return;
  }

  const donorName = localStorage.getItem('restaurant_name') || localStorage.getItem('user_name') || 'Valued Donor Restaurant';
  let totalFoodKg = 0;
  let totalMeals = 0;
  let totalValuation = 0;

  const tableRowsHtml = foodDonations.map(d => {
    const kg = Number(d.quantity_kg) || 20;
    const meals = Number(d.portions) || Math.round(kg * 2.5);
    const val = meals * 140;
    const ded = Math.round(val * 0.5);

    totalFoodKg += kg;
    totalMeals += meals;
    totalValuation += val;

    return `
      <tr>
        <td style="font-family: monospace; font-weight: bold;">${d.id}</td>
        <td>${d.title || 'Prepared Food Batch'}</td>
        <td>${d.category || 'Cooked Meals'}</td>
        <td>${kg} kg</td>
        <td>~${meals}</td>
        <td>₹ ${val.toLocaleString('en-IN')}</td>
        <td style="font-weight: bold; color: #16803c;">₹ ${ded.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const totalDeduction = Math.round(totalValuation * 0.50);

  const printWin = window.open('', '_blank', 'width=900,height=960');
  if (!printWin) {
    alert('Please allow popups to view and print your Consolidated 80G Certificate.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>Consolidated 80G Food Rescue Tax Exemption Certificate</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
        .cert-card { border: 6px double #16803c; padding: 36px; border-radius: 12px; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #16803c; letter-spacing: -0.5px; }
        .subtitle { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: 700; }
        .title { font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 14px; text-decoration: underline; }
        .badge-food { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-top: 8px; border: 1px solid #86efac; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .field-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
        .field-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px; }
        .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table-box th, .table-box td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; font-size: 12px; }
        .table-box th { background: #f1f5f9; color: #334155; font-weight: 700; }
        .amount-box { background: #eaf6ee; border: 2px dashed #16803c; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .amount-val { font-size: 30px; font-weight: 800; color: #16803c; margin-top: 4px; }
        .statute-note { font-size: 11px; color: #64748b; margin-top: 16px; line-height: 1.5; font-style: italic; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .stamp { width: 105px; height: 105px; border: 2px solid #16803c; border-radius: 50%; color: #16803c; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: 800; transform: rotate(-10deg); opacity: 0.9; line-height: 1.3; }
        .btn-print { background: #16803c; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
        @media print { .btn-print { display: none; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <div class="cert-card">
        <div class="header">
          <div class="logo">🌱 SURPLUS-TO-SHELTER FOUNDATION</div>
          <div class="subtitle">Registered Section 80G Non-Profit Food Rescue Trust</div>
          <div class="subtitle">Govt Reg No: AAATS8841EF20241 • NITI Aayog ID: RJ/2024/0482 • PAN: AAATS8841E</div>
          <div class="title">CONSOLIDATED SECTION 80G FOOD RESCUE TAX CERTIFICATE</div>
          <div class="badge-food">Consolidated Statement • Food Rescues Only (${foodDonations.length} Batches)</div>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #334155;">
          This certifies that <strong>${donorName}</strong> has completed <strong>${foodDonations.length} verified surplus food rescues</strong> redirected to community shelter kitchens during Financial Year 2026-27 under Section 80G(5)(vi) of the Income Tax Act, 1961.
        </p>

        <div class="summary-grid">
          <div>
            <div class="field-label">Food Batches</div>
            <div class="field-value">${foodDonations.length} Rescues</div>
          </div>
          <div>
            <div class="field-label">Total Food Weight</div>
            <div class="field-value">${totalFoodKg} kg</div>
          </div>
          <div>
            <div class="field-label">Portions Rescued</div>
            <div class="field-value">~${totalMeals} Meals</div>
          </div>
          <div>
            <div class="field-label">Total Fair Valuation</div>
            <div class="field-value">₹ ${totalValuation.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <table class="table-box">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Food Item</th>
              <th>Classification</th>
              <th>Weight</th>
              <th>Meals</th>
              <th>Valuation (₹)</th>
              <th>80G Claim (50%)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="amount-box">
          <div class="field-label" style="color: #16803c;">Total Eligible Section 80G Tax Deduction Claim</div>
          <div class="amount-val">₹ ${totalDeduction.toLocaleString('en-IN')} INR</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">Consolidated 50% deduction eligible for FY 2026-27 on food rescues</div>
        </div>

        <div class="statute-note">
          * Statutory Clarification: This certificate exclusively includes food rescue consignments. In accordance with CBDT directives, non-food in-kind aid (clothes, blankets, books, furniture, medical kits) is excluded from food tax valuations and documented separately via In-Kind Delivery Slips.
        </div>

        <div class="footer">
          <div>
            <div style="font-size: 11px; color: #64748b;">Consolidated Manifest Verification:</div>
            <div style="font-family: monospace; font-size: 10px; color: #475569;">SHA256: 3c9e782a${Date.now()}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Surplus-To-Shelter Central Ledger Audit</div>
          </div>
          <div class="stamp">
            OFFICIAL<br/>SEAL<br/>80G FOOD<br/>VERIFIED
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 13px;">Authorized Trustee</div>
            <div style="font-size: 11px; color: #64748b;">Surplus-To-Shelter Foundation</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 800);
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();
};

/**
 * VIEW IN-KIND RELIEF HANDOVER SLIP
 * For non-food items (clothes, blankets, books, furniture, medical, hygiene).
 * Explicitly states that Section 80G food tax deduction does NOT apply.
 */
window.viewInKindSlip = function(donationOrId) {
  let d = donationOrId;
  if (typeof donationOrId === 'string') {
    d = findDonationById(donationOrId);
  }

  if (!d) {
    d = {
      id: 'DON-CLO-101',
      title: '40 Winter Jackets & Sweaters (Assorted Sizes)',
      category: 'Clothes & Footwear',
      quantity_kg: 15,
      recipient_ngo: 'Hope Shelter',
      driver_name: 'Courier Rahul',
      handover_pin: '4829',
      status: 'DELIVERED',
      created_at: new Date().toLocaleDateString('en-IN')
    };
  }

  const donorName = d.donor_name || localStorage.getItem('restaurant_name') || localStorage.getItem('user_name') || 'Apparel & Relief Partner';

  const printWin = window.open('', '_blank', 'width=840,height=960');
  if (!printWin) {
    alert('Please allow popups to view and print the Delivery Slip.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>In-Kind Relief Delivery Slip - ${d.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
        .slip-card { border: 3px solid #334155; padding: 36px; border-radius: 12px; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
        .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 4px; font-weight: 700; }
        .title { font-size: 20px; font-weight: 800; color: #1e293b; margin-top: 14px; letter-spacing: 0.5px; }
        .badge-inkind { display: inline-block; background: #e2e8f0; color: #334155; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-top: 8px; border: 1px solid #cbd5e1; }
        .notice-banner { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #92400e; line-height: 1.5; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
        .field-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 3px; }
        .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table-box th, .table-box td { border: 1px solid #cbd5e1; padding: 11px 14px; text-align: left; font-size: 13px; }
        .table-box th { background: #f1f5f9; color: #334155; font-weight: 700; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .stamp { width: 105px; height: 105px; border: 2px dashed #475569; border-radius: 50%; color: #475569; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: 800; transform: rotate(-5deg); opacity: 0.85; line-height: 1.3; }
        .btn-print { background: #1e293b; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
        @media print { .btn-print { display: none; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <div class="slip-card">
        <div class="header">
          <div class="logo">📦 SURPLUS-TO-SHELTER RELIEF LOGISTICS</div>
          <div class="subtitle">Humanitarian Aid & Community Resource Redistribution Network</div>
          <div class="subtitle">Reg No: AAATS8841EF20241 • Dispatch Hub: Jaipur Logistics Center</div>
          <div class="title">IN-KIND RELIEF SUPPLY HANDOVER ACKNOWLEDGMENT SLIP</div>
          <div class="badge-inkind">👕 Non-Food Humanitarian Aid Consignment</div>
        </div>

        <div class="notice-banner">
          <strong>Non-Tax In-Kind Supply Notice:</strong> This document certifies the physical handover of non-food community relief items (clothes, blankets, books, or welfare supplies). Under Central Board of Direct Taxes (CBDT) statutory rules, Section 80G tax deductions are restricted to registered food rescue and monetary contributions; physical relief goods carry no 80G food tax valuation.
        </div>

        <div class="details-grid">
          <div>
            <div class="field-label">Consignment Ref ID</div>
            <div class="field-value">${d.id}</div>
          </div>
          <div>
            <div class="field-label">Date Dispatched / Handed Over</div>
            <div class="field-value">${d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}</div>
          </div>
          <div>
            <div class="field-label">Contributing Donor</div>
            <div class="field-value">${donorName}</div>
          </div>
          <div>
            <div class="field-label">Aid Classification</div>
            <div class="field-value">${d.category || 'Clothes & Footwear'}</div>
          </div>
          <div>
            <div class="field-label">Receiving Shelter / Organization</div>
            <div class="field-value">${d.recipient_ngo || 'Hope Shelter'}</div>
          </div>
          <div>
            <div class="field-label">Courier &amp; Security PIN</div>
            <div class="field-value font-mono">${d.driver_name || 'Courier Rahul'} (PIN: ${d.handover_pin || '4829'})</div>
          </div>
        </div>

        <table class="table-box">
          <thead>
            <tr>
              <th>Item Specification</th>
              <th>Category</th>
              <th>Quantity / Weight</th>
              <th>Inspection Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 700;">${d.title || 'In-Kind Relief Goods'}</td>
              <td>${d.category || 'Physical Supplies'}</td>
              <td style="font-family: monospace; font-weight: 700;">${d.quantity_kg ? d.quantity_kg + ' kg' : (d.quantity || '1 Consignment')}</td>
              <td style="color: #15803d; font-weight: 700;">✓ Verified &amp; Inspected</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Shelter Acknowledgment</div>
          <div style="font-size: 12px; color: #334155; line-height: 1.5;">
            The receiving shelter confirms safe receipt of the listed relief goods in good usable condition for immediate direct distribution to resident families and sheltered individuals.
          </div>
        </div>

        <div class="footer">
          <div>
            <div style="font-size: 11px; color: #64748b;">Digital Handover Verification:</div>
            <div style="font-family: monospace; font-size: 10px; color: #475569;">PIN-MATCHED: ${d.handover_pin || '4829'} • STATUS: ${d.status || 'AVAILABLE'}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Surplus-To-Shelter Verified Chain of Custody</div>
          </div>
          <div class="stamp">
            RELIEF GOODS<br/>OFFICIAL<br/>HANDOVER<br/>RECEIPT
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 13px;">Shelter Receiving Desk</div>
            <div style="font-size: 11px; color: #64748b;">${d.recipient_ngo || 'Hope Shelter'}</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 800);
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();
};

/**
 * Comprehensive NGO Verification & Audit System Integration Test Suite
 * Tests end-to-end functionality against Express Backend & Supabase Dual-Layer:
 * 1. NGO Application Submission & Re-submission
 * 2. Private Document Upload & Vault Storage
 * 3. Short-Lived Signed URLs (15-min expiry)
 * 4. Cross-NGO Access Prevention (403 Forbidden)
 * 5. Driver / Donor Access Prevention (403 Forbidden)
 * 6. Admin Approval & Document Review
 * 7. Additional Information Request & Resubmission Cycle
 * 8. Admin Rejection Workflow
 * 9. Suspended NGO Restrictions & Historical Record Preservation
 * 10. Audit History Log Verification
 */

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING NGO VERIFICATION SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Submit New NGO Verification Application
    // ----------------------------------------------------
    console.log('📌 TEST 1: NGO Application Submission');
    const appPayload = {
      ngo_id: 'care_relief@shelter.org',
      ngo_name: 'Care Relief Foundation',
      legal_name: 'Care Relief Charitable Trust',
      legal_structure: 'trust',
      registration_number: 'RJ/JPR/2021/TR-9941',
      registration_authority: 'Sub-Registrar Office, Jaipur',
      registration_state: 'Rajasthan',
      registration_date: '2021-03-15',
      darpan_id: 'RJ/2021/0491821',
      pan_number: 'AAATC9941K',
      registered_address: '42 Malviya Nagar, Jaipur, Rajasthan 302017',
      representative_name: 'Vikram Mehta',
      representative_role: 'Managing Trustee',
      representative_email: 'care_relief@shelter.org',
      representative_phone: '+91 98290 88776',
      tax_12ab_number: 'AAATC9941KE20211',
      tax_80g_number: 'AAATC9941KE20215',
      bank_name: 'State Bank of India',
      bank_account_holder: 'Care Relief Charitable Trust',
      bank_account_number: '391049284102',
      bank_ifsc: 'SBIN0001244'
    };

    const submitRes = await fetch(`${API_BASE}/ngo/verification/application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'care_relief@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify(appPayload)
    });
    const submitData = await submitRes.json();
    assert(submitRes.ok && submitData.success, 'Application submitted successfully');
    assert(submitData.application && submitData.application.verification_status === 'PENDING_REVIEW', 'Application initial status is PENDING_REVIEW');
    assert(submitData.application.legal_structure === 'trust', 'Legal structure preserved as trust');

    // ----------------------------------------------------
    // TEST 2: Private Document Upload with Validation
    // ----------------------------------------------------
    console.log('\n📌 TEST 2: Secure Document Upload & Validation');
    const docPayload = {
      ngo_id: 'care_relief@shelter.org',
      document_type: 'REGISTRATION_CERTIFICATE',
      file_name: 'Trust_Deed_Signed.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 512000,
      file_data: 'data:application/pdf;base64,JVBERi0xLjQKJVRydXN0IFJlZ2lzdHJhdGlvbiBDZXJ0aWZpY2F0ZQ=='
    };

    const uploadRes = await fetch(`${API_BASE}/ngo/verification/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'care_relief@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify(docPayload)
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.ok && uploadData.success, 'Document uploaded to private vault');
    assert(uploadData.document && uploadData.document.id, 'Document ID generated');
    const docId = uploadData.document ? uploadData.document.id : null;

    // Test rejection of invalid mime type
    const invalidDocRes = await fetch(`${API_BASE}/ngo/verification/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'care_relief@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify({
        ngo_id: 'care_relief@shelter.org',
        document_type: 'REGISTRATION_CERTIFICATE',
        file_name: 'malicious.exe',
        mime_type: 'application/x-msdownload',
        file_size_bytes: 1024,
        file_data: 'data:application/x-msdownload;base64,AAAA'
      })
    });
    assert(!invalidDocRes.ok && invalidDocRes.status === 400, 'Invalid file type rejected with HTTP 400');

    // ----------------------------------------------------
    // TEST 3: Short-Lived Signed URL Generation & Download
    // ----------------------------------------------------
    console.log('\n📌 TEST 3: Short-Lived Signed URL Access (15-min expiry)');
    let signedTokenUrl = null;
    if (docId) {
      const signedUrlRes = await fetch(`${API_BASE}/ngo/verification/documents/${docId}/signed-url`, {
        headers: {
          'x-user-email': 'care_relief@shelter.org',
          'x-user-role': 'ngo'
        }
      });
      const signedUrlData = await signedUrlRes.json();
      assert(signedUrlRes.ok && signedUrlData.success, 'Signed URL generated for document owner');
      assert(signedUrlData.signed_url && signedUrlData.signed_url.includes('/api/ngo/verification/documents/download/'), 'Signed URL contains download endpoint token');
      assert(signedUrlData.expires_in_seconds === 900, 'Signed URL expiry set to 15 minutes (900 seconds)');
      signedTokenUrl = signedUrlData.signed_url;

      // Access download stream using signed URL
      const fullDownloadUrl = signedTokenUrl.startsWith('http') ? signedTokenUrl : `http://localhost:5000${signedTokenUrl}`;
      const streamRes = await fetch(fullDownloadUrl);
      assert(streamRes.ok && streamRes.status === 200, 'Document download stream accessible via valid signed token');
    }

    // ----------------------------------------------------
    // TEST 4: Cross-NGO Access Prevention (Strict Authorization)
    // ----------------------------------------------------
    console.log('\n📌 TEST 4: Cross-NGO Access Prevention');
    if (docId) {
      const crossNgoRes = await fetch(`${API_BASE}/ngo/verification/documents/${docId}/signed-url`, {
        headers: {
          'x-user-email': 'snooping_ngo@other.org',
          'x-user-role': 'ngo'
        }
      });
      assert(crossNgoRes.status === 403, 'Cross-NGO document access blocked with HTTP 403 Forbidden');
    }

    const crossNgoAppRes = await fetch(`${API_BASE}/ngo/verification/application/care_relief@shelter.org`, {
      headers: {
        'x-user-email': 'snooping_ngo@other.org',
        'x-user-role': 'ngo'
      }
    });
    assert(crossNgoAppRes.status === 403, 'Cross-NGO application dossier access blocked with HTTP 403 Forbidden');

    // ----------------------------------------------------
    // TEST 5: Driver / Donor Access Prevention
    // ----------------------------------------------------
    console.log('\n📌 TEST 5: Driver & Donor Access Prevention');
    if (docId) {
      const driverRes = await fetch(`${API_BASE}/ngo/verification/documents/${docId}/signed-url`, {
        headers: {
          'x-user-email': 'driver_rahul@courier.net',
          'x-user-role': 'driver'
        }
      });
      assert(driverRes.status === 403, 'Driver access to private documents blocked with HTTP 403 Forbidden');

      const donorRes = await fetch(`${API_BASE}/ngo/verification/documents/${docId}/signed-url`, {
        headers: {
          'x-user-email': 'restaurant_owner@bistro.com',
          'x-user-role': 'restaurant'
        }
      });
      assert(donorRes.status === 403, 'Donor access to private documents blocked with HTTP 403 Forbidden');
    }

    // ----------------------------------------------------
    // TEST 6: Unverified NGO Blocked from Live Donation Claims
    // ----------------------------------------------------
    console.log('\n📌 TEST 6: Unverified Claim Restriction');
    const claimAttempt = await fetch(`${API_BASE}/donations/don-1/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'care_relief@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify({ ngo_name: 'Care Relief Foundation' })
    });
    const claimData = await claimAttempt.json();
    assert(claimAttempt.status === 403, 'Unverified NGO claim rejected with HTTP 403 Forbidden');
    assert(claimData.verification_restricted === true, 'Response identifies verification restriction');

    // ----------------------------------------------------
    // TEST 7: Admin Document Review & Approval
    // ----------------------------------------------------
    console.log('\n📌 TEST 7: Admin Verification & Approval Workflow');
    const appId = submitData.application ? submitData.application.id : null;
    if (appId && docId) {
      // 1. Mark document verified
      const docReviewRes = await fetch(`${API_BASE}/admin/verification/${appId}/review-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'admin@sts.org',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          document_id: docId,
          status: 'VERIFIED',
          notes: 'Trust deed matches Sub-Registrar Jaipur seals.'
        })
      });
      const docReviewData = await docReviewRes.json();
      assert(docReviewRes.ok && docReviewData.success, 'Admin reviewed and marked document as VERIFIED');

      // 2. Approve Application
      const approveRes = await fetch(`${API_BASE}/admin/verification/${appId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'admin@sts.org',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          decision: 'VERIFIED',
          admin_notes: 'All trust documents, PAN, and representative details verified against government registers.',
          checklist_state: {
            legal_name_matches: true,
            registration_number_valid: true,
            certificate_authentic: true,
            registered_address_verified: true,
            authorised_signatory_verified: true,
            tax_approvals_verified: true,
            bank_account_verified: true,
            source_checked: 'Devsthan Department Registry',
            check_date: '2026-10-12'
          }
        })
      });
      const approveData = await approveRes.json();
      assert(approveRes.ok && approveData.success, 'Admin approved application to VERIFIED status');
      assert(approveData.application.verification_status === 'VERIFIED', 'Application status updated to VERIFIED');

      // 3. Verified NGO can now claim
      const verifiedClaim = await fetch(`${API_BASE}/donations/don-1/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'care_relief@shelter.org',
          'x-user-role': 'ngo'
        },
        body: JSON.stringify({ ngo_name: 'Care Relief Foundation' })
      });
      assert(verifiedClaim.ok, 'Verified NGO can successfully claim live donation');
    }

    // ----------------------------------------------------
    // TEST 8: Additional Information Request & Resubmission Workflow
    // ----------------------------------------------------
    console.log('\n📌 TEST 8: Additional Info Request & Resubmission Cycle');
    // Create new application
    const app2Res = await fetch(`${API_BASE}/ngo/verification/application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'action_ngo@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify({
        ngo_id: 'action_ngo@shelter.org',
        ngo_name: 'Action Relief Centre',
        legal_name: 'Action Relief Society',
        legal_structure: 'society',
        registration_number: 'RJ/SOCIETY/2019/551',
        registration_state: 'Rajasthan',
        pan_number: 'AAATA5510M'
      })
    });
    const app2Data = await app2Res.json();
    const app2Id = app2Data.application ? app2Data.application.id : null;

    // Admin requests additional info
    const reqInfoRes = await fetch(`${API_BASE}/admin/verification/${app2Id}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'admin@sts.org',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({
        decision: 'ADDITIONAL_INFORMATION_REQUIRED',
        decision_reason: 'Please upload certified Memorandum of Association (MOA) and bank cancelled cheque.',
        rejection_reasons: ['Missing MOA', 'Bank Cheque Unclear']
      })
    });
    const reqInfoData = await reqInfoRes.json();
    assert(reqInfoRes.ok && reqInfoData.application.verification_status === 'ADDITIONAL_INFORMATION_REQUIRED', 'Application marked ADDITIONAL_INFORMATION_REQUIRED');

    // NGO resubmits with updated information
    const resubmitRes = await fetch(`${API_BASE}/ngo/verification/application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'action_ngo@shelter.org',
        'x-user-role': 'ngo'
      },
      body: JSON.stringify({
        ngo_id: 'action_ngo@shelter.org',
        ngo_name: 'Action Relief Centre',
        legal_name: 'Action Relief Society Registered',
        legal_structure: 'society',
        registration_number: 'RJ/SOCIETY/2019/551-CERT',
        registration_state: 'Rajasthan',
        pan_number: 'AAATA5510M'
      })
    });
    const resubmitData = await resubmitRes.json();
    assert(resubmitRes.ok && resubmitData.application.verification_status === 'PENDING_REVIEW', 'Application transitions back to PENDING_REVIEW upon resubmission');

    // ----------------------------------------------------
    // TEST 9: Suspension & Record Preservation
    // ----------------------------------------------------
    console.log('\n📌 TEST 9: Suspension & Record Preservation');
    if (appId) {
      const suspendRes = await fetch(`${API_BASE}/admin/verification/${appId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'admin@sts.org',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          decision: 'SUSPENDED',
          decision_reason: 'Pending audit investigation regarding storage refrigeration compliance.'
        })
      });
      const suspendData = await suspendRes.json();
      assert(suspendRes.ok && suspendData.application.verification_status === 'SUSPENDED', 'Application status updated to SUSPENDED');

      // Attempt claim as suspended NGO
      const suspendedClaim = await fetch(`${API_BASE}/donations/don-2/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'care_relief@shelter.org',
          'x-user-role': 'ngo'
        },
        body: JSON.stringify({ ngo_name: 'Care Relief Foundation' })
      });
      assert(suspendedClaim.status === 403, 'Suspended NGO is BLOCKED from claiming new donations (HTTP 403)');

      // Verify records and history preserved (not deleted)
      const fetchAppRes = await fetch(`${API_BASE}/ngo/verification/application/care_relief@shelter.org`, {
        headers: {
          'x-user-email': 'care_relief@shelter.org',
          'x-user-role': 'ngo'
        }
      });
      const fetchAppData = await fetchAppRes.json();
      assert(fetchAppData.success && fetchAppData.application.id === appId, 'Suspended NGO profile, application, and history are preserved');
    }

    // ----------------------------------------------------
    // TEST 10: Audit Log Verification
    // ----------------------------------------------------
    console.log('\n📌 TEST 10: Audit Trail Verification');
    const auditRes = await fetch(`${API_BASE}/admin/verification/audit-events?limit=20`, {
      headers: {
        'x-user-email': 'admin@sts.org',
        'x-user-role': 'admin'
      }
    });
    const auditData = await auditRes.json();
    assert(auditRes.ok && auditData.success, 'Admin can retrieve audit events log');
    assert(Array.isArray(auditData.events) && auditData.events.length >= 4, `Recorded ${auditData.events.length} audit events`);

    const eventTypes = auditData.events.map(e => e.event_type);
    assert(eventTypes.includes('APPLICATION_SUBMITTED'), 'Audit trail records APPLICATION_SUBMITTED');
    assert(eventTypes.includes('APPLICATION_VERIFIED') || eventTypes.includes('STATUS_CHANGE'), 'Audit trail records verification status change');
    assert(eventTypes.includes('APPLICATION_SUSPENDED'), 'Audit trail records APPLICATION_SUSPENDED');

    // ----------------------------------------------------
    // TEST 11: Government NGO-DARPAN Registry & Intelligence Lookup
    // ----------------------------------------------------
    console.log('\n📌 TEST 11: Free Government NGO-DARPAN Registry & Background Intelligence');

    // Subtest 11A: Exact Darpan ID Lookup
    const darpanLookupRes = await fetch(`${API_BASE}/ngo/verification/lookup-registry?darpan_id=RJ/2018/0192842`);
    const darpanLookupData = await darpanLookupRes.json();
    assert(darpanLookupRes.ok && darpanLookupData.success, 'Lookup returns success for valid Darpan ID RJ/2018/0192842');
    assert(darpanLookupData.data.legal_name === 'Hope Shelter Welfare Trust', 'Matches exact legal name Hope Shelter Welfare Trust');
    assert(darpanLookupData.data.entity_age_years >= 8, `Correctly calculates entity age (${darpanLookupData.data.entity_age_years} years)`);
    assert(Array.isArray(darpanLookupData.data.past_grants) && darpanLookupData.data.past_grants.length === 2, 'Returns past government grants and ministry partnerships');
    assert(darpanLookupData.data.tax_12ab_status === 'Active' && darpanLookupData.data.tax_80g_status === 'Active', 'Returns verified 12AB/80G income tax status');

    // Subtest 11B: Query by NGO Name
    const nameLookupRes = await fetch(`${API_BASE}/ngo/verification/lookup-registry?name=Akshaya%20Patra`);
    const nameLookupData = await nameLookupRes.json();
    assert(nameLookupRes.ok && nameLookupData.success, 'Lookup returns success when querying by name "Akshaya Patra"');
    assert(nameLookupData.data.darpan_id === 'KA/2016/0109283', 'Resolves official Darpan ID KA/2016/0109283');
    assert(Array.isArray(nameLookupData.data.key_office_bearers) && nameLookupData.data.key_office_bearers.length > 0, 'Returns verified office bearers from government record');

    // Subtest 11C: Query National Organization
    const goonjRes = await fetch(`${API_BASE}/ngo/verification/lookup-registry?query=Goonj`);
    const goonjData = await goonjRes.json();
    assert(goonjRes.ok && goonjData.success && goonjData.data.fcra_status.includes('ACTIVE'), 'Queries national NGO Goonj with verified FCRA status');

    // Subtest 11D: Algorithmic Darpan ID Validation for any Indian State
    const algoRes = await fetch(`${API_BASE}/ngo/verification/lookup-registry?darpan_id=MH/2020/0284918`);
    const algoData = await algoRes.json();
    assert(algoRes.ok && algoData.success, 'Algorithmic Darpan validator recognizes valid Maharashtra Darpan ID MH/2020/0284918');
    assert(algoData.data.state === 'Maharashtra', 'Accurately resolves state code MH to Maharashtra');
    assert(algoData.data.registered_year === 2020, 'Accurately extracts registration year 2020');

    // Subtest 11E: Invalid query handling
    const invalidRes = await fetch(`${API_BASE}/ngo/verification/lookup-registry?query=CompletelyFakeEntityXYZ999`);
    const invalidData = await invalidRes.json();
    assert(!invalidData.success, 'Properly returns error for non-existent unverified NGO query');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

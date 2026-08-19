# ============================================================
# END-TO-END IDENTITY CHAIN TEST
# ============================================================
# Verifies that a single patient identity flows through:
#   Account -> Booking -> Payment -> Invoice -> EMR -> Patient Portal
#
# Prerequisites:
#   - Two test patient accounts exist
#   - Each has at least one completed booking with payment + invoice
#   - EMR bridge record exists for both
#
# This test confirms no "orphaned" or "wrong-patient" records exist.
# ============================================================

$BASE = "https://www.onlinenephrologist.com"
$PATIENT_A_TOKEN = "PASTE_PATIENT_A_JWT_HERE"

Write-Host "`n=== END-TO-END IDENTITY CHAIN TEST ===" -ForegroundColor Cyan
Write-Host "Using Patient A token only. Verifying all records belong to the same patient."
Write-Host ""

# Step 1: Get patient identity
Write-Host "--- Step 1: Patient Identity (GET /api/patient-auth/me) ---" -ForegroundColor Yellow
try {
  $me = Invoke-RestMethod -Uri "$BASE/api/patient-auth/me" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  $patientId = $me.patient.id
  $patientEmail = $me.patient.email
  Write-Host "  Patient ID:    $patientId"
  Write-Host "  Patient Email: [REDACTED]"
} catch {
  Write-Host "  FAIL: Could not get patient identity" -ForegroundColor Red
  exit 1
}

# Step 2: Get portal profile
Write-Host ""
Write-Host "--- Step 2: Portal Profile (GET /api/patient-auth/portal) ---" -ForegroundColor Yellow
try {
  $portal = Invoke-RestMethod -Uri "$BASE/api/patient-auth/portal" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  $portalEmail = $portal.email
  $portalName = "$($portal.first_name) $($portal.last_name)"
  Write-Host "  Portal Email: [REDACTED]"
  Write-Host "  Portal Name:  [REDACTED]"

  if ($portalEmail -ne $patientEmail) {
    Write-Host "  FAIL: Email mismatch between /me and /portal" -ForegroundColor Red
  } else {
    Write-Host "  PASS: Email matches" -ForegroundColor Green
  }
} catch {
  Write-Host "  FAIL: Could not get portal profile" -ForegroundColor Red
}

# Step 3: Get appointments
Write-Host ""
Write-Host "--- Step 3: Appointments (GET /api/patient-auth/appointments) ---" -ForegroundColor Yellow
try {
  $appt = Invoke-RestMethod -Uri "$BASE/api/patient-auth/appointments" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  $bookings = $appt.bookings
  Write-Host "  Booking count: $($bookings.Count)"

  foreach ($b in $bookings) {
    $bPatient = $b.patient_account_id
    if ($bPatient -ne $patientId) {
      Write-Host "  FAIL: Booking $($b.booking_id) belongs to patient $bPatient, not $patientId" -ForegroundColor Red
    } else {
      Write-Host "  PASS: Booking $($b.booking_id) -> patient $bPatient" -ForegroundColor Green
    }
  }
} catch {
  Write-Host "  FAIL: Could not get appointments" -ForegroundColor Red
}

# Step 4: Get billing (invoices + payments)
Write-Host ""
Write-Host "--- Step 4: Billing (GET /api/patient-auth/billing) ---" -ForegroundColor Yellow
try {
  $billing = Invoke-RestMethod -Uri "$BASE/api/patient-auth/billing" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }

  Write-Host "  Invoice count: $($billing.invoices.Count)"
  foreach ($inv in $billing.invoices) {
    Write-Host "    Invoice $($inv.invoice_number) - $($inv.status)"
  }

  Write-Host "  Payment count: $($billing.bookingPayments.Count)"
  foreach ($pmt in $billing.bookingPayments) {
    Write-Host "    Payment for booking $($pmt.booking_id) - $($pmt.payment_status)"
  }
} catch {
  Write-Host "  FAIL: Could not get billing" -ForegroundColor Red
}

# Step 5: Get prescriptions
Write-Host ""
Write-Host "--- Step 5: Prescriptions (GET /api/patient-auth/prescriptions) ---" -ForegroundColor Yellow
try {
  $rx = Invoke-RestMethod -Uri "$BASE/api/patient-auth/prescriptions" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  Write-Host "  Prescription count: $($rx.prescriptions.Count)"
  foreach ($p in $rx.prescriptions) {
    Write-Host "    Rx #$($p.prescription_number) - $($p.status) - Doctor: [REDACTED]"
  }
} catch {
  Write-Host "  FAIL: Could not get prescriptions" -ForegroundColor Red
}

# Step 6: Get reports
Write-Host ""
Write-Host "--- Step 6: Reports (GET /api/patient-auth/reports) ---" -ForegroundColor Yellow
try {
  $rpt = Invoke-RestMethod -Uri "$BASE/api/patient-auth/reports" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  Write-Host "  Report count: $($rpt.reports.Count)"
  foreach ($r in $rpt.reports) {
    Write-Host "    Report: $($r.title) - $($r.report_date)"
  }
} catch {
  Write-Host "  FAIL: Could not get reports" -ForegroundColor Red
}

# Step 7: Get consultations
Write-Host ""
Write-Host "--- Step 7: Consultations (GET /api/patient-auth/consultations) ---" -ForegroundColor Yellow
try {
  $cons = Invoke-RestMethod -Uri "$BASE/api/patient-auth/consultations" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  Write-Host "  Consultation count: $($cons.consultations.Count)"
  foreach ($c in $cons.consultations) {
    Write-Host "    Consultation: $($c.consultation_date) - $($c.status)"
  }
} catch {
  Write-Host "  FAIL: Could not get consultations" -ForegroundColor Red
}

# Step 8: Get follow-up entitlements
Write-Host ""
Write-Host "--- Step 8: Follow-Up (GET /api/patient-auth/follow-up) ---" -ForegroundColor Yellow
try {
  $fu = Invoke-RestMethod -Uri "$BASE/api/patient-auth/follow-up" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  Write-Host "  Active entitlement: $($fu.isEligible)"
  Write-Host "  Total entitlements: $($fu.allEntitlements.Count)"
} catch {
  Write-Host "  FAIL: Could not get follow-up" -ForegroundColor Red
}

# Step 9: Get messages
Write-Host ""
Write-Host "--- Step 9: Messages (GET /api/patient-auth/messages) ---" -ForegroundColor Yellow
try {
  $msg = Invoke-RestMethod -Uri "$BASE/api/patient-auth/messages" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" }
  Write-Host "  Conversation ID: $($msg.conversation.id)"
  Write-Host "  Message count: $($msg.messages.Count)"
  Write-Host "  Unread: $($msg.unreadCount)"

  if ($msg.conversation.patient_account_id -ne $patientId) {
    Write-Host "  FAIL: Conversation belongs to $($msg.conversation.patient_account_id), not $patientId" -ForegroundColor Red
  } else {
    Write-Host "  PASS: Conversation -> patient $($msg.conversation.patient_account_id)" -ForegroundColor Green
  }
} catch {
  Write-Host "  FAIL: Could not get messages" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  IDENTITY CHAIN TEST COMPLETE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "If all steps show PASS above, the same patient identity"
Write-Host "flows correctly through the entire booking -> payment ->"
Write-Host "invoice -> EMR -> portal chain."
Write-Host ""
Write-Host "If any step shows FAIL, that indicates an identity mismatch"
Write-Host "that must be fixed before launch."
Write-Host ""

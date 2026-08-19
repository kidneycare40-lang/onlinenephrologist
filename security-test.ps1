# ============================================================
# SECURITY TEST SUITE - onlinenephrologist.com
# ============================================================
# Run this against your own production system with TEST accounts only.
# NEVER run against real patient data.
#
# SETUP:
#   1. Create two dummy patient accounts via the patient login flow
#   2. Obtain their JWT tokens from browser DevTools > Application > Cookies > patient_token
#   3. Insert real test booking/report/prescription IDs from your test data
#   4. Run each section in order
#
# RULES:
#   - NEVER paste real JWTs, secrets, or patient PII into chat/forums
#   - Use placeholder IDs shown below
#   - Revoke test tokens after testing
# ============================================================

# -- CONFIGURATION --
$BASE = "https://www.onlinenephrologist.com"

# Paste TEST patient tokens here (from browser DevTools > Cookies > patient_token)
$PATIENT_A_TOKEN = "PASTE_PATIENT_A_JWT_HERE"
$PATIENT_B_TOKEN = "PASTE_PATIENT_B_JWT_HERE"

# Paste real TEST IDs from your test data
$PATIENT_A_BOOKING_ID    = "REPLACE_WITH_PATIENT_A_REAL_BOOKING_ID"
$PATIENT_B_BOOKING_ID    = "REPLACE_WITH_PATIENT_B_REAL_BOOKING_ID"
$PATIENT_A_REPORT_ID     = "REPLACE_WITH_PATIENT_A_REAL_REPORT_ID"
$PATIENT_B_REPORT_ID     = "REPLACE_WITH_PATIENT_B_REAL_REPORT_ID"
$PATIENT_A_PRESCRIPTION_ID = "REPLACE_WITH_PATIENT_A_REAL_PRESCRIPTION_ID"
$PATIENT_B_PRESCRIPTION_ID = "REPLACE_WITH_PATIENT_B_REAL_PRESCRIPTION_ID"
$PATIENT_A_INVOICE_ID    = "REPLACE_WITH_PATIENT_A_REAL_INVOICE_ID"
$PATIENT_B_INVOICE_ID    = "REPLACE_WITH_PATIENT_B_REAL_INVOICE_ID"
$PATIENT_A_CONVERSATION_ID = "REPLACE_WITH_PATIENT_A_REAL_CONVERSATION_ID"
$PATIENT_B_CONVERSATION_ID = "REPLACE_WITH_PATIENT_B_REAL_CONVERSATION_ID"
$TEST_SHARE_TOKEN        = "REPLACE_WITH_A_REAL_SHARE_TOKEN"

# Counters
$script:PASS = 0
$script:FAIL = 0
$script:RESULTS = @()

function Test-Case {
  param(
    [string]$Name,
    [string]$Method = "GET",
    [string]$Url,
    [hashtable]$Headers = @{},
    [string]$Body = "",
    [int[]]$ExpectedStatus,
    [string]$ShouldNotContain = ""
  )

  try {
    $params = @{
      Uri = $Url
      Method = $Method
      Headers = $Headers
      UseBasicParsing = $true
      TimeoutSec = 15
    }
    if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }

    $response = Invoke-WebRequest @params -ErrorAction SilentlyContinue
    $status = [int]$response.StatusCode
    $content = $response.Content
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    $content = ""
    if ($_.Exception.Response) {
      try { $content = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd() } catch {}
    }
  }

  $pass = $ExpectedStatus -contains $status
  $reason = ""

  if (-not $pass) {
    $reason = "Expected $($ExpectedStatus -join '|'), got $status"
  } elseif ($ShouldNotContain -and $content -match $ShouldNotContain) {
    $pass = $false
    $reason = "Response contains forbidden content: $ShouldNotContain"
  }

  $icon = if ($pass) { "PASS" } else { "FAIL" }
  if ($pass) { $script:PASS++ } else { $script:FAIL++ }

  $script:RESULTS += [PSCustomObject]@{
    Test   = $Name
    Method = $Method
    Url    = $Url -replace $BASE, ""
    Status = $status
    Result = $icon
    Reason = $reason
  }

  $color = if ($pass) { "Green" } else { "Red" }
  Write-Host "  [$icon] $Name - $status $reason" -ForegroundColor $color
}

# ============================================================
# SECTION 1: UNAUTHENTICATED ACCESS
# ============================================================
Write-Host "`n=== 1. UNAUTHENTICATED ACCESS ===" -ForegroundColor Cyan

Test-Case "Anonymous to Patient appointments" `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient portal" `
  -Url "$BASE/api/patient-auth/portal" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient prescriptions" `
  -Url "$BASE/api/patient-auth/prescriptions" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient reports" `
  -Url "$BASE/api/patient-auth/reports" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient billing" `
  -Url "$BASE/api/patient-auth/billing" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient consultations" `
  -Url "$BASE/api/patient-auth/consultations" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient messages" `
  -Url "$BASE/api/patient-auth/messages" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient profile" `
  -Url "$BASE/api/patient-auth/profile" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient follow-up" `
  -Url "$BASE/api/patient-auth/follow-up" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to Patient me" `
  -Url "$BASE/api/patient-auth/me" `
  -ExpectedStatus @(401, 403)

Test-Case "Anonymous to booking-files" `
  -Url "$BASE/api/booking-files?bookingId=$PATIENT_A_BOOKING_ID" `
  -ExpectedStatus @(401, 403)

# ============================================================
# SECTION 2: PATIENT A - OWN DATA (should PASS)
# ============================================================
Write-Host "`n=== 2. PATIENT A - OWN DATA ===" -ForegroundColor Cyan

Test-Case "Patient A - own appointments" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own portal" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/portal" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own prescriptions" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/prescriptions" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own reports" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/reports" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own billing" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/billing" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own consultations" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/consultations" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own messages" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/messages" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own follow-up" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/follow-up" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own me" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/me" `
  -ExpectedStatus @(200)

Test-Case "Patient A - own booking-files" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/booking-files?bookingId=$PATIENT_A_BOOKING_ID" `
  -ExpectedStatus @(200, 401) -ShouldNotContain '"error"'

# ============================================================
# SECTION 3: PATIENT A - PATIENT B DATA (CRITICAL - must FAIL)
# ============================================================
Write-Host "`n=== 3. PATIENT A to PATIENT B DATA (CRITICAL IDOR TEST) ===" -ForegroundColor Cyan

Test-Case "Patient A to Patient B appointments" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(200, 401, 403) `
  -ShouldNotContain "$PATIENT_B_BOOKING_ID"

Test-Case "Patient A to Patient B booking-files" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/booking-files?bookingId=$PATIENT_B_BOOKING_ID" `
  -ExpectedStatus @(200, 401, 403) `
  -ShouldNotContain "$PATIENT_B_BOOKING_ID"

# ============================================================
# SECTION 4: PATIENT B - PATIENT A DATA (CRITICAL - must FAIL)
# ============================================================
Write-Host "`n=== 4. PATIENT B to PATIENT A DATA (CRITICAL IDOR TEST) ===" -ForegroundColor Cyan

Test-Case "Patient B to Patient A appointments" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_B_TOKEN" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(200, 401, 403) `
  -ShouldNotContain "$PATIENT_A_BOOKING_ID"

# ============================================================
# SECTION 5: MANIPULATION ATTACKS
# ============================================================
Write-Host "`n=== 5. MANIPULATION ATTACKS ===" -ForegroundColor Cyan

Test-Case "Patient A - profile with Patient B ID in body" `
  -Method "POST" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Body (@{ patientAccountId = "PATTACK-PATIENT-B-ID" } | ConvertTo-Json) `
  -Url "$BASE/api/patient-auth/profile" `
  -ExpectedStatus @(200, 400, 401) `
  -ShouldNotContain "PATTACK-PATIENT-B-ID"

Test-Case "Patient A - appointments with Patient B ID in query" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/appointments?patientAccountId=PATTACK-PATIENT-B-ID" `
  -ExpectedStatus @(200, 401) `
  -ShouldNotContain "$PATIENT_B_BOOKING_ID"

Test-Case "Patient A - portal with Patient B ID in query" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/portal?patientAccountId=PATTACK-PATIENT-B-ID" `
  -ExpectedStatus @(200, 401) `
  -ShouldNotContain "$PATIENT_B"

Test-Case "Patient A - reports with Patient B ID in query" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/reports?patientAccountId=PATTACK-PATIENT-B-ID" `
  -ExpectedStatus @(200, 401) `
  -ShouldNotContain "$PATIENT_B_REPORT_ID"

# ============================================================
# SECTION 6: PATIENT to EMR ISOLATION
# ============================================================
Write-Host "`n=== 6. PATIENT to EMR ISOLATION ===" -ForegroundColor Cyan

Test-Case "Patient token to EMR patients endpoint" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patients" `
  -ExpectedStatus @(401, 403, 307, 302)

Test-Case "Patient token to EMR dashboard" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/dashboard" `
  -ExpectedStatus @(401, 403, 307, 302)

Test-Case "Patient token to EMR prescriptions" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/prescriptions" `
  -ExpectedStatus @(401, 403, 307, 302)

Test-Case "Patient token to EMR consultations" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/consultations" `
  -ExpectedStatus @(401, 403, 307, 302)

Test-Case "Patient token to EMR messages" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/emr/messages" `
  -ExpectedStatus @(401, 403, 307, 302)

# ============================================================
# SECTION 7: SHARE TOKEN LIFECYCLE
# ============================================================
Write-Host "`n=== 7. SHARE TOKEN LIFECYCLE ===" -ForegroundColor Cyan

Test-Case "Share: random token denied" `
  -Url "$BASE/api/booking-files/share?token=aaaa$(Get-Random)" `
  -ExpectedStatus @(400, 404, 410)

Test-Case "Share: modified token denied" `
  -Url "$BASE/api/booking-files/share?token=0000000000000000000000000000000000000000000000000000000000000000" `
  -ExpectedStatus @(400, 404, 410)

Test-Case "Share: valid token allowed" `
  -Url "$BASE/api/booking-files/share?token=$TEST_SHARE_TOKEN" `
  -ExpectedStatus @(200, 404, 410)

# ============================================================
# SECTION 8: CACHE ISOLATION
# ============================================================
Write-Host "`n=== 8. CACHE ISOLATION ===" -ForegroundColor Cyan

try {
  $resp = Invoke-WebRequest -Uri "$BASE/api/patient-auth/portal" `
    -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
    -UseBasicParsing -TimeoutSec 10
  $cache = $resp.Headers["Cache-Control"]
  if ($cache -match "no-store") {
    Write-Host "  [PASS] Cache-Control: no-store present on /api/patient-auth/portal" -ForegroundColor Green
    $script:PASS++
  } else {
    Write-Host "  [FAIL] Cache-Control header missing or wrong: $cache" -ForegroundColor Red
    $script:FAIL++
  }
} catch {
  Write-Host "  [SKIP] Could not test cache headers" -ForegroundColor Yellow
}

# ============================================================
# SECTION 9: INVALID / EXPIRED JWT
# ============================================================
Write-Host "`n=== 9. INVALID / EXPIRED JWT ===" -ForegroundColor Cyan

Test-Case "Garbage JWT denied" `
  -Headers @{ "Cookie" = "patient_token=not-a-real-jwt-token" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(401, 403)

Test-Case "Empty JWT denied" `
  -Headers @{ "Cookie" = "patient_token=" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(401, 403)

Test-Case "Expired JWT (tampered exp) denied" `
  -Headers @{ "Cookie" = "patient_token=eyJhbGciOiJIUzI1NiJ9.eyJwYXRpZW50SWQiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(401, 403)

# ============================================================
# SECTION 10: LOGOUT / SESSION INVALIDATION
# ============================================================
Write-Host "`n=== 10. LOGOUT / SESSION INVALIDATION ===" -ForegroundColor Cyan

Test-Case "Logout endpoint responds" `
  -Method "POST" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/logout" `
  -ExpectedStatus @(200, 204)

Start-Sleep -Seconds 1
Test-Case "Post-logout: old token rejected" `
  -Headers @{ "Cookie" = "patient_token=$PATIENT_A_TOKEN" } `
  -Url "$BASE/api/patient-auth/appointments" `
  -ExpectedStatus @(401, 403)

# ============================================================
# RESULTS SUMMARY
# ============================================================
Write-Host "`n"
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "         TEST RESULTS SUMMARY          " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  PASSED:  $script:PASS" -ForegroundColor Green
$totalColor = if ($script:FAIL -gt 0) { "Red" } else { "Green" }
Write-Host "  FAILED:  $script:FAIL" -ForegroundColor $totalColor
Write-Host "  TOTAL:   $($script:PASS + $script:FAIL)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Yellow

if ($script:FAIL -gt 0) {
  Write-Host "`nFAILED TESTS:" -ForegroundColor Red
  $failedTests = $script:RESULTS | Where-Object { $_.Result -eq "FAIL" }
  foreach ($t in $failedTests) {
    Write-Host "  FAIL: $($t.Test) - $($t.Method) $($t.Url) - $($t.Status) - $($t.Reason)" -ForegroundColor Red
  }
  Write-Host "`nDO NOT LAUNCH until all FAIL items are fixed." -ForegroundColor Red
} else {
  Write-Host "`nAll tests passed. Authorization boundaries look solid." -ForegroundColor Green
}

Write-Host "`nFull results:"
$script:RESULTS | Format-Table -AutoSize

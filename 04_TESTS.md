# Tests

Manual test cases run before submission.

## Test 1 — Cursor Business Overspend
- Input: 3 seats, Cursor Business, $120/mo
- Expected: Recommend Cursor Pro, save $60/mo
- Result: PASS ✓

## Test 2 — GitHub Copilot Small Team
- Input: 4 seats, Business plan, $76/mo
- Expected: Recommend Individual plan, save $36/mo
- Result: PASS ✓

## Test 3 — ChatGPT Correct Plan
- Input: 6 seats, Team plan, $180/mo
- Expected: No savings, plan is appropriate
- Result: PASS ✓

## Test 4 — Consultation CTA Trigger
- Input: Total savings > $500
- Expected: Amber CTA banner appears
- Result: PASS ✓

## Test 5 — localStorage Persistence
- Input: Fill form halfway, reload page
- Expected: Company name and team size restored
- Result: PASS ✓

## Test 6 — Empty Form Validation
- Input: Submit with no tools added
- Expected: Alert shown, no redirect
- Result: PASS ✓

## Test 7 — Share Link
- Input: Click copy share link
- Expected: URL copied to clipboard with encoded audit data
- Result: PASS ✓

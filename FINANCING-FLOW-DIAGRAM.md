# Financing Application Flow - Visual Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSES FINANCING PAGE                  │
│  - Sees list of financing offers                               │
│  - Adjusts amount slider ($5K - $50K)                          │
│  - Adjusts term slider (3-24 months)                           │
│  - Views eligibility score                                     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER SELECTS OFFER & CLICKS "APPLY"                │
│  Button: onClick={() => handleApply(offer.id)}                 │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND: handleApply()                     │
│  1. setApplyingOfferId(offerId) - Show loading state           │
│  2. Prepare application data:                                  │
│     - amount: financeAmount                                    │
│     - term_days: financeTerm * 30                              │
│     - purpose: "Working capital for {industry} operations"     │
│  3. Call: unifiedApi.financing.apply(offerId, application)     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              API: unifiedApi.financing.apply()                  │
│                                                                 │
│  Step 1: Authentication Check                                  │
│  ├─ Get current user from Supabase Auth                       │
│  └─ Throw error if not authenticated                           │
│                                                                 │
│  Step 2: Fetch Offer                                           │
│  ├─ Query: financing_offers WHERE id = offerId                │
│  └─ Get: provider_name, provider_type, interest_rate, etc.    │
│                                                                 │
│  Step 3: Get User Profile                                      │
│  ├─ Query: user_profiles WHERE id = user.id                    │
│  └─ Get: name, email, company, country, industry             │
│                                                                 │
│  Step 4: Partner Integration Check                             │
│  ├─ IF provider_type === 'fintech' OR 'bank':                 │
│  │   ├─ Import financingPartnerService                         │
│  │   ├─ Call: forwardApplication(provider_name, request)       │
│  │   ├─ Partner Service:                                       │
│  │   │   ├─ Find partner by name                              │
│  │   │   ├─ Prepare partner API request                       │
│  │   │   ├─ Call partner API (placeholder)                    │
│  │   │   └─ Return: {success, partnerApplicationId,           │
│  │   │                redirectUrl}                            │
│  │   └─ IF success: Store partnerApplicationId & redirectUrl  │
│  └─ ELSE: Continue with internal application                   │
│                                                                 │
│  Step 5: Save to Database                                       │
│  ├─ INSERT INTO financing_applications:                        │
│  │   ├─ user_id: user.id                                       │
│  │   ├─ offer_id: offerId                                      │
│  │   ├─ amount: application.amount                            │
│  │   ├─ term_days: application.term_days                       │
│  │   ├─ purpose: application.purpose                           │
│  │   ├─ status: 'pending'                                      │
│  │   ├─ partner_application_id: (if partner)                  │
│  │   └─ metadata: {redirectUrl} (if partner)                   │
│  └─ Return: application record                                 │
│                                                                 │
│  Step 6: Log Activity                                          │
│  ├─ unifiedApi.user.logActivity(                              │
│  │     'financing_applied',                                    │
│  │     'financing_application',                                │
│  │     applicationId                                           │
│  │   )                                                          │
│  └─ Creates entry in user_activities table                     │
│                                                                 │
│  Step 7: Return Result                                         │
│  └─ Return: { ...application, redirectUrl }                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: Handle Response                         │
│                                                                 │
│  IF result.redirectUrl exists:                                │
│  ├─ Show info toast: "Redirecting to Partner"                 │
│  └─ window.open(redirectUrl, '_blank')                         │
│     └─ User completes application on partner site             │
│                                                                 │
│  ELSE:                                                          │
│  ├─ Show success toast: "Application Submitted"                │
│  └─ Application saved with status 'pending'                    │
│                                                                 │
│  THEN:                                                          │
│  └─ Refresh applications list                                  │
│     └─ unifiedApi.financing.getApplications()                  │
│        └─ Update UI with new application                        │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION STATUS: "pending"                     │
│  Application appears in:                                       │
│  ├─ "Your Applications" card on dashboard                      │
│  ├─ Shows: Provider name, Amount, Term                        │
│  └─ Status badge: PENDING (yellow)                            │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN REVIEW (AdminFinancingManager)               │
│                                                                 │
│  Admin Actions:                                                │
│  ├─ View all applications                                      │
│  ├─ Filter by status                                           │
│  ├─ Click "Review" on application                              │
│  └─ Update status:                                             │
│     ├─ 'pending' → 'under_review'                              │
│     ├─ 'under_review' → 'approved'                             │
│     └─ 'under_review' → 'rejected'                             │
│                                                                 │
│  Status Update Process:                                         │
│  ├─ unifiedApi.financing.updateApplicationStatus()             │
│  ├─ UPDATE financing_applications SET:                         │
│  │   ├─ status: newStatus                                      │
│  │   ├─ approval_notes: notes                                 │
│  │   └─ reviewed_at: NOW()                                     │
│  └─ (Future: Send notification to user)                       │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION STATUS: "approved" / "rejected"       │
│                                                                 │
│  User sees updated status:                                     │
│  ├─ Status badge changes color:                                │
│  │   ├─ APPROVED: Green                                        │
│  │   └─ REJECTED: Red                                          │
│  ├─ If approved: Shows approved_amount                         │
│  └─ (Future: Email notification sent)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Partner Integration Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│         PARTNER INTEGRATION: forwardApplication()               │
│                                                                 │
│  Input:                                                         │
│  ├─ partnerId: provider_name (e.g., "M-Pesa", "Flutterwave") │
│  └─ request: { offerId, amount, termDays, purpose, userData }  │
│                                                                 │
│  Process:                                                       │
│  ├─ Find partner in partners list                              │
│  ├─ Check if partner.active === true                           │
│  ├─ IF partner.provider_type === 'fintech':                    │
│  │   └─ forwardToFintechPartner()                              │
│  │      ├─ Prepare fintech API request                        │
│  │      ├─ Call fintech API (placeholder)                     │
│  │      └─ Return: {success, partnerApplicationId,            │
│  │                  redirectUrl}                               │
│  ├─ ELSE IF partner.provider_type === 'bank':                 │
│  │   └─ forwardToBankPartner()                                 │
│  │      ├─ Prepare bank API request                           │
│  │      ├─ Call bank API (placeholder)                        │
│  │      └─ Return: {success, partnerApplicationId,            │
│  │                  redirectUrl}                               │
│  └─ ELSE (platform):                                           │
│     └─ forwardToPlatformPartner()                               │
│        └─ Return: {success, partnerApplicationId}               │
│                                                                 │
│  Output:                                                        │
│  └─ PartnerApplicationResponse:                                │
│     ├─ success: boolean                                        │
│     ├─ partnerApplicationId: string                           │
│     ├─ status: string                                          │
│     ├─ redirectUrl: string (if external)                     │
│     └─ error: string (if failed)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE OPERATIONS                          │
│                                                                 │
│  1. INSERT financing_applications:                              │
│     └─ Creates new application record                          │
│                                                                 │
│  2. INSERT user_activities:                                     │
│     └─ Logs 'financing_applied' activity                       │
│                                                                 │
│  3. SELECT financing_applications:                               │
│     └─ Fetches user's applications for display                │
│                                                                 │
│  4. UPDATE financing_applications:                              │
│     └─ Admin updates status                                    │
│                                                                 │
│  5. (Future) SELECT notifications:                             │
│     └─ User receives status update notification                │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                              │
│                                                                 │
│  Error 1: Not Authenticated                                    │
│  ├─ Thrown: "Not authenticated"                                │
│  ├─ Frontend: Show error toast                                 │
│  └─ Action: Redirect to login                                  │
│                                                                 │
│  Error 2: Offer Not Found                                      │
│  ├─ Thrown: "Financing offer not found"                        │
│  ├─ Frontend: Show error toast                                  │
│  └─ Action: Refresh offers list                                │
│                                                                 │
│  Error 3: Partner Integration Failed                            │
│  ├─ Logged: Warning message                                    │
│  ├─ Frontend: No error shown                                   │
│  └─ Action: Continue with internal application                  │
│                                                                 │
│  Error 4: Database Error                                        │
│  ├─ Thrown: Database error message                             │
│  ├─ Frontend: Show error toast                                 │
│  └─ Action: Show retry option                                  │
└─────────────────────────────────────────────────────────────────┘
```


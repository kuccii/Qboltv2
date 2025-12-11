# Post-Application Flow - Financing & Insurance

## Overview
This document explains what happens after users submit applications for financing and insurance, including the complete lifecycle from submission to final outcome.

---

## Financing Application Flow (After Submission)

### 1. Application Submitted
**Status:** `pending`

**What happens:**
- Application saved to `financing_applications` table
- Activity logged: `financing_applied`
- Notification created (if configured)
- Application appears in "Your Applications" card
- User sees success toast

### 2. Admin Review Process
**Status:** `pending` → `under_review`

**Admin Actions (AdminFinancingManager):**
1. Admin views application in `/admin/financing`
2. Admin can:
   - View application details
   - Review user profile and eligibility
   - Check supporting documents
   - Update status to `under_review`
   - Add review notes

**What happens:**
- Status updated in database
- `reviewed_at` timestamp set
- Notification sent to user (if configured)
- Application status badge updates

### 3. Approval/Rejection Decision
**Status:** `under_review` → `approved` OR `rejected`

#### If Approved:
**Status:** `approved`

**What happens:**
1. **Admin Updates Status:**
   ```typescript
   await unifiedApi.financing.updateApplicationStatus(
     applicationId,
     'approved',
     'Application approved. Funds will be disbursed within 3-5 business days.'
   );
   ```

2. **Database Update:**
   - Status: `approved`
   - `approved_amount`: Set (may differ from requested)
   - `approval_notes`: Admin notes
   - `reviewed_at`: Timestamp

3. **Notification Created:**
   - Type: `success`
   - Title: "Financing Application Approved"
   - Message: Includes approved amount
   - Action URL: `/app/financing`
   - Priority: `high`

4. **User Sees:**
   - Notification in dropdown
   - Updated status badge (green)
   - Approved amount displayed
   - Application details updated

5. **Next Steps (Future Implementation):**
   - **Disbursement Process:**
     - Funds transferred to user's account
     - Payment schedule created
     - First payment due date set
   - **Document Generation:**
     - Loan agreement generated
     - Payment schedule document
     - Terms and conditions
   - **Payment Tracking:**
     - Monthly payment reminders
     - Payment history tracking
     - Early repayment options

#### If Rejected:
**Status:** `rejected`

**What happens:**
1. **Admin Updates Status:**
   ```typescript
   await unifiedApi.financing.updateApplicationStatus(
     applicationId,
     'rejected',
     'Application rejected due to insufficient credit history. Please reapply after 6 months.'
   );
   ```

2. **Database Update:**
   - Status: `rejected`
   - `approval_notes`: Rejection reason
   - `reviewed_at`: Timestamp

3. **Notification Created:**
   - Type: `error`
   - Title: "Financing Application Rejected"
   - Message: Includes rejection reason
   - Action URL: `/app/financing`

4. **User Sees:**
   - Notification in dropdown
   - Updated status badge (red)
   - Rejection reason displayed
   - Option to reapply (after waiting period)

5. **Next Steps:**
   - User can view rejection reason
   - User can improve eligibility
   - User can reapply after waiting period (if applicable)

### 4. Partner Integration Flow (If Applicable)

**If `provider_type === 'fintech'` or `'bank'`:**

#### Initial Application:
- Application forwarded to partner API
- `partner_application_id` stored
- `redirectUrl` provided (if needed)
- User redirected to partner portal

#### Partner Processing:
- Partner processes application independently
- Partner updates status via webhook (future)
- Status synced back to Qivook

#### Status Updates from Partner:
**Webhook Endpoint (Future):**
```
POST /api/webhooks/financing-partner
{
  "partnerId": "fintech_123",
  "applicationId": "partner_app_456",
  "status": "approved",
  "approvedAmount": 10000,
  "notes": "Application approved"
}
```

**What happens:**
1. Webhook received
2. Find application by `partner_application_id`
3. Update application status
4. Create notification
5. Sync data

---

## Insurance Application Flow (After Submission)

### 1. Quote Request
**Status:** Quote created with `status: 'pending'`

**What happens:**
- Quote saved to `insurance_quotes` table
- Quote appears in "Your Insurance Quotes" section
- Quote expires after `expires_at` date (default 7 days)
- User can view quote details

### 2. Application Submission
**Status:** Application created with `status: 'pending'`

**What happens:**
1. **User Submits Application:**
   ```typescript
   await unifiedApi.insurance.submitApplication({ quoteId });
   ```

2. **Database Operations:**
   - Application saved to `insurance_applications` table
   - Quote status updated to `'accepted'`
   - Partner integration attempted (if applicable)
   - `partner_application_id` stored (if partner)

3. **Partner Integration (If Applicable):**
   - Application forwarded to insurance partner
   - User redirected to partner portal (if needed)
   - Partner processes independently

4. **Notification Created:**
   - Type: `info`
   - Title: "Insurance Application Submitted"
   - Message: "Your insurance application has been submitted successfully."

5. **User Sees:**
   - Application in "Your Applications" section
   - Status: `pending`
   - Application details

### 3. Application Review
**Status:** `pending` → `under_review` → `approved` OR `rejected`

#### Admin Review (Future):
- Admin reviews application
- Checks eligibility
- Verifies documents
- Updates status

#### Partner Review (If Partner):
- Partner reviews application
- Partner updates status via webhook
- Status synced to Qivook

### 4. Policy Creation (If Approved)
**Status:** `approved` → Policy created

**What happens:**
1. **Policy Created:**
   ```typescript
   await unifiedApi.insurance.createPolicy({
     applicationId: application.id,
     providerId: application.provider_id,
     policyType: application.application_type,
     coverageAmount: application.coverage_amount,
     startDate: new Date(),
     endDate: new Date(Date.now() + application.term_days * 24 * 60 * 60 * 1000),
     status: 'active'
   });
   ```

2. **Database Operations:**
   - Policy saved to `insurance_policies` table
   - Application status: `approved`
   - Policy number generated
   - Coverage details stored

3. **Notification Created:**
   - Type: `success`
   - Title: "Insurance Policy Active"
   - Message: "Your insurance policy is now active. Policy number: {policy_number}"

4. **User Sees:**
   - Policy in "Active Insurance Policies" section
   - Policy details
   - Coverage amount
   - Expiry date
   - Policy number

### 5. Policy Management

#### Active Policy:
- Policy appears in insurance overview
- Coverage included in risk metrics
- Expiry tracking
- Renewal reminders

#### Policy Expiry:
- Expiring soon alert (30 days before)
- Renewal options
- Policy status: `expired`

#### Claims (Future):
- User can submit claims
- Claims tracked in `insurance_claims` table
- Claim status: `pending` → `approved`/`rejected`
- Payout processed (if approved)

---

## Notification Flow

### When Status Changes:

1. **Financing Application:**
   - `pending` → `under_review`: Info notification
   - `under_review` → `approved`: Success notification (high priority)
   - `under_review` → `rejected`: Error notification
   - Notification includes:
     - Status change
     - Approved amount (if approved)
     - Rejection reason (if rejected)
     - Action link to view application

2. **Insurance Application:**
   - `pending` → `under_review`: Info notification
   - `under_review` → `approved`: Success notification
   - Policy created: Success notification with policy number
   - Notification includes:
     - Status change
     - Policy details (if approved)
     - Action link to view policy

### Notification Display:
- Appears in notification dropdown
- Shows in "Your Applications" card
- Email notification (if configured)
- SMS notification (if configured)

---

## User Experience After Application

### Financing:

1. **Application Submitted:**
   - Success toast shown
   - Application appears in sidebar card
   - User can view in "My Applications" tab

2. **During Review:**
   - Status: `pending` or `under_review`
   - User can view application details
   - User can see review notes (if any)

3. **If Approved:**
   - Status badge: Green "APPROVED"
   - Approved amount displayed
   - Payment schedule (future)
   - Document downloads (future)

4. **If Rejected:**
   - Status badge: Red "REJECTED"
   - Rejection reason displayed
   - Option to reapply (after waiting period)

### Insurance:

1. **Quote Requested:**
   - Quote appears in quotes list
   - Quote valid until expiry date
   - User can apply from quote

2. **Application Submitted:**
   - Application appears in applications list
   - Status: `pending`
   - User can track status

3. **If Approved:**
   - Policy created
   - Policy appears in "Active Policies"
   - Coverage included in risk metrics
   - Policy documents available (future)

4. **If Rejected:**
   - Status: `rejected`
   - Rejection reason displayed
   - User can request new quote

---

## Future Enhancements

### Financing:
1. **Disbursement:**
   - Automatic fund transfer
   - Payment gateway integration
   - Payment confirmation

2. **Payment Management:**
   - Payment schedule display
   - Payment reminders
   - Payment history
   - Early repayment options

3. **Document Management:**
   - Loan agreement generation
   - Document signing (e-signature)
   - Document storage

### Insurance:
1. **Policy Management:**
   - Policy renewal
   - Coverage updates
   - Policy cancellation

2. **Claims Processing:**
   - Claim submission
   - Claim tracking
   - Claim payout

3. **Document Management:**
   - Policy documents
   - Claim documents
   - Certificate generation

---

## Summary

**After Financing Application:**
1. ✅ Application saved → Status: `pending`
2. ✅ Admin reviews → Status: `under_review`
3. ✅ Admin approves/rejects → Status: `approved`/`rejected`
4. ✅ Notification sent → User sees update
5. ✅ (Future) Funds disbursed → Payment tracking begins

**After Insurance Application:**
1. ✅ Quote requested → Quote created
2. ✅ Application submitted → Status: `pending`
3. ✅ Application reviewed → Status: `under_review`
4. ✅ Application approved → Policy created
5. ✅ Policy active → Coverage included in risk metrics
6. ✅ (Future) Claims can be submitted

Both flows include:
- ✅ Real-time status updates
- ✅ Notification system
- ✅ User tracking
- ✅ Admin management
- ✅ Partner integration (when applicable)





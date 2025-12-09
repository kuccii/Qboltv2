# Financing Application Flow - Complete Documentation

## Overview
This document explains the complete flow when a user clicks "Apply" for financing, from initial application to final approval/rejection.

---

## Step-by-Step Flow

### 1. User Clicks "Apply" Button
**Location:** `src/pages/Financing.tsx` - `handleApply()` function

**What happens:**
- User selects a financing offer and clicks "Apply"
- `setApplyingOfferId(offerId)` sets loading state
- Application data is prepared:
  ```typescript
  {
    amount: financeAmount,        // User-selected amount (e.g., $10,000)
    term_days: financeTerm * 30, // User-selected term in days (e.g., 180 days)
    purpose: `Working capital for ${currentIndustry} operations`
  }
  ```

---

### 2. API Call: `unifiedApi.financing.apply()`
**Location:** `src/services/unifiedApi.ts` - `financing.apply()` method

**Process:**

#### 2.1 Authentication Check
- Verifies user is authenticated via Supabase
- Throws error if not authenticated

#### 2.2 Fetch Offer Details
```typescript
// Gets the financing offer from database
const offer = await supabase
  .from('financing_offers')
  .select('*')
  .eq('id', offerId)
  .single();
```
- Retrieves offer details (provider_name, provider_type, interest_rate, etc.)
- Validates offer exists

#### 2.3 Get User Profile
```typescript
const profile = await unifiedApi.user.getProfile(user.id);
```
- Retrieves user data: name, email, company, country, industry

#### 2.4 Partner Integration Attempt
**Location:** `src/services/financingPartners.ts`

**If provider_type is 'fintech' or 'bank':**
- Attempts to forward application to partner API
- Calls `financingPartnerService.forwardApplication()`
- **Partner Service Process:**
  1. Finds partner by provider_name
  2. Prepares partner request:
     ```typescript
     {
       offerId,
       amount: application.amount,
       termDays: application.term_days,
       purpose: application.purpose,
       userData: {
         name, email, company, country, industry
       }
     }
     ```
  3. Calls partner API (placeholder implementation)
  4. Returns response:
     ```typescript
     {
       success: true,
       partnerApplicationId: "fintech_1234567890",
       status: "pending",
       redirectUrl: "https://partner-portal.com/apply/123"
     }
     ```

**If partner integration fails:**
- Logs warning
- Continues with internal application (no partner redirect)

#### 2.5 Save Application to Database
```typescript
const { data, error } = await supabase
  .from('financing_applications')
  .insert({
    amount: application.amount,
    term_days: application.term_days,
    purpose: application.purpose,
    user_id: user.id,
    offer_id: offerId,
    partner_application_id: partnerApplicationId, // If partner integration succeeded
    metadata: { redirectUrl } // If partner redirect needed
  })
  .select()
  .single();
```

**Database Record Created:**
- `id`: UUID (auto-generated)
- `user_id`: User's UUID
- `offer_id`: Financing offer UUID
- `amount`: Requested amount
- `term_days`: Requested term
- `purpose`: Application purpose
- `status`: "pending" (default)
- `partner_application_id`: Partner's application ID (if applicable)
- `metadata`: JSONB with redirectUrl (if applicable)
- `created_at`: Timestamp

#### 2.6 Log User Activity
```typescript
unifiedApi.user.logActivity(
  'financing_applied',
  'financing_application',
  data.id
);
```
- Creates activity log entry
- Used for user history and analytics

#### 2.7 Return Application Data
```typescript
return {
  ...data,           // Full application record
  redirectUrl        // Partner redirect URL (if applicable)
};
```

---

### 3. Frontend Response Handling
**Location:** `src/pages/Financing.tsx` - `handleApply()` function

**Two Scenarios:**

#### Scenario A: Partner Redirect Required
```typescript
if (result.redirectUrl) {
  // Show info toast
  addToast({
    type: 'info',
    title: 'Redirecting to Partner',
    message: 'You will be redirected to complete your application...'
  });
  
  // Open partner portal in new tab
  window.open(result.redirectUrl, '_blank');
}
```

**What happens:**
- User sees notification
- New tab opens with partner's application portal
- User completes application on partner's website
- Partner processes application independently
- Partner sends webhook/status update back to Qivook (future implementation)

#### Scenario B: Internal Application
```typescript
else {
  addToast({
    type: 'success',
    title: 'Application Submitted',
    message: 'Your financing application has been submitted successfully...'
  });
}
```

**What happens:**
- Application saved to database with status "pending"
- Admin reviews application (via AdminFinancingManager)
- Admin updates status: "under_review" → "approved" or "rejected"

---

### 4. Refresh Applications List
```typescript
const data = await unifiedApi.financing.getApplications();
setApplications(data);
```

**Fetches all user applications:**
```typescript
// From unifiedApi.financing.getApplications()
const applications = await supabase
  .from('financing_applications')
  .select('*, financing_offers(*)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Displays in UI:**
- Shows in "Your Applications" card on dashboard
- Shows status badge: PENDING, APPROVED, REJECTED
- Shows amount and term
- Shows approved amount (if approved)

---

### 5. Application Status Tracking

#### 5.1 Initial Status: "pending"
- Application created
- Waiting for review

#### 5.2 Admin Review (AdminFinancingManager)
**Location:** `src/pages/AdminFinancingManager.tsx`

**Admin Actions:**
1. View all applications
2. Filter by status
3. Update status:
   ```typescript
   await unifiedApi.financing.updateApplicationStatus(
     applicationId,
     'approved',  // or 'rejected', 'under_review'
     'Approval notes...'
   );
   ```

**Status Updates:**
- `pending` → `under_review` (Admin starts review)
- `under_review` → `approved` (Application approved)
- `under_review` → `rejected` (Application rejected)

#### 5.3 Status Update Process
```typescript
// unifiedApi.financing.updateApplicationStatus()
await supabase
  .from('financing_applications')
  .update({
    status: newStatus,
    approval_notes: notes,
    reviewed_at: NOW()
  })
  .eq('id', applicationId);
```

#### 5.4 User Notification (Future)
- Email notification when status changes
- In-app notification
- Push notification (mobile)

---

### 6. Application Display

#### 6.1 Dashboard Card
**Location:** `src/pages/Financing.tsx` - "Your Applications" card

**Shows:**
- Up to 3 most recent applications
- Application name (from financing_offers)
- Status badge (color-coded)
- Amount and term
- Approved amount (if approved)
- "View All" button if more than 3

#### 6.2 Application Details (Future Enhancement)
- Full application details page
- Status history timeline
- Documents uploaded
- Communication log
- Payment schedule (if approved)

---

### 7. Partner Webhook Integration (Future)

**When Partner Updates Status:**
```typescript
// Webhook endpoint (to be implemented)
POST /api/webhooks/financing-partner

{
  "partnerId": "fintech_123",
  "applicationId": "partner_app_456",
  "status": "approved",
  "approvedAmount": 10000,
  "notes": "Application approved"
}
```

**Process:**
1. Receive webhook from partner
2. Find application by `partner_application_id`
3. Update application status
4. Notify user
5. Log activity

---

## Database Schema

### `financing_applications` Table
```sql
CREATE TABLE financing_applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  offer_id UUID REFERENCES financing_offers(id),
  amount DECIMAL(10, 2) NOT NULL,
  term_days INTEGER NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending',
  partner_application_id TEXT,
  approved_amount DECIMAL(10, 2),
  approval_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Error Handling

### Common Errors:

1. **Not Authenticated**
   - Error: "Not authenticated"
   - Action: Redirect to login

2. **Offer Not Found**
   - Error: "Financing offer not found"
   - Action: Show error toast, refresh offers

3. **Partner Integration Failed**
   - Warning logged
   - Action: Continue with internal application

4. **Database Error**
   - Error: Database error message
   - Action: Show error toast, retry option

---

## User Experience Flow

```
1. User browses financing offers
   ↓
2. User adjusts amount and term
   ↓
3. User clicks "Apply" on an offer
   ↓
4. Loading state shown
   ↓
5a. IF Partner Integration:
    → Redirect to partner portal
    → User completes on partner site
    → Partner processes independently
    
5b. IF Internal Application:
    → Application saved to database
    → Status: "pending"
    ↓
6. Admin reviews application
    → Status: "under_review"
    ↓
7. Admin approves/rejects
    → Status: "approved" or "rejected"
    ↓
8. User sees updated status
    → Notification sent
    → Application card updated
```

---

## Future Enhancements

1. **Real-time Status Updates**
   - WebSocket connection for live status
   - Push notifications

2. **Document Upload**
   - Upload required documents
   - Document verification

3. **Payment Processing**
   - Disbursement upon approval
   - Payment tracking

4. **Application History**
   - Full timeline view
   - Status change history

5. **Automated Eligibility Check**
   - Pre-approval scoring
   - Instant approval for qualified users

6. **Multi-step Application Form**
   - Detailed application wizard
   - Progress tracking

---

## Summary

**When user clicks "Apply":**
1. ✅ Application data prepared
2. ✅ Offer validated
3. ✅ Partner integration attempted (if applicable)
4. ✅ Application saved to database
5. ✅ Activity logged
6. ✅ User redirected (if partner) or notified (if internal)
7. ✅ Applications list refreshed
8. ✅ Admin can review and update status
9. ✅ User sees status updates in real-time

**The complete flow ensures:**
- ✅ Data integrity
- ✅ User experience
- ✅ Partner integration (when available)
- ✅ Admin oversight
- ✅ Status tracking
- ✅ Error handling



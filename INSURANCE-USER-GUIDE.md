# Insurance Access & Usage Guide

## 📍 How to Access Insurance

### Primary Access Point: Risk Management Page

**Navigation Path:**
1. Click **"Risk"** in the main navigation menu (top navigation bar)
2. Or navigate directly to `/app/risk`
3. Once on the Risk page, click the **"Insurance"** tab

**Visual Indicators:**
- The Insurance tab shows a badge with the number of coverage gaps (if any)
- The tab icon is a shield checkmark (✓)

---

## 🎯 What Users Can See & Do

### 1. **Overview Tab - Insurance Coverage Card**

**Location:** Risk page → Overview tab → Insurance Coverage card (5th metric card)

**What it shows:**
- **Total Coverage Amount**: Current insurance coverage in millions (e.g., "$2.5M")
- **Coverage Status**: 
  - "Fully covered" (green) - No gaps detected
  - "X gaps" (yellow) - Areas needing protection
- **Expiring Policies Alert**: Shows count of policies expiring within 30 days

**Quick Actions:**
- Click the card to navigate to the Insurance tab for details

---

### 2. **Insurance Tab - Full Insurance Dashboard**

**Location:** Risk page → Insurance tab

#### A. **Overview Cards (Top Section)**

Three key metrics displayed:

1. **Active Policies**
   - Number of active insurance policies
   - Total coverage amount
   - Visual: Blue gradient card with shield checkmark icon

2. **Coverage Gaps**
   - Number of areas needing protection
   - Status indicator (green = fully covered, yellow = gaps exist)
   - Visual: Dynamic color based on status

3. **Recommended Coverage**
   - Optimal coverage amount based on current risk profile
   - Calculated dynamically from risk alerts
   - Visual: Purple gradient card with dollar sign icon

#### B. **Active Insurance Policies List**

**What users see:**
- List of all active insurance policies
- For each policy:
  - **Insurance Type Badge**: Shows type (Cargo, Liability, Credit, etc.)
  - **Policy Name**: e.g., "Cargo Insurance"
  - **Coverage Amount**: e.g., "$1.5M USD"
  - **Expiry Date**: e.g., "Expires: Dec 15, 2024"
  - **Provider Name**: Insurance company name
  - **Description**: What the policy covers

**Actions available:**
- **View Details** button: Opens policy details (can be implemented)
- **Renew Policy** button: Appears for policies expiring soon

**Special Alerts:**
- Orange alert banner for policies expiring within 30 days
- Shows count and "Renew Policy" button

#### C. **Coverage Recommendations**

**When shown:** Only appears if coverage gaps exist

**Dynamic Recommendations:**

1. **Price Volatility Protection**
   - Triggered when: Price alerts are active
   - Shows: Number of active price alerts
   - Recommendation: Price risk insurance to protect against sudden spikes
   - Action: "Explore Options" button

2. **Supply Chain Disruption Coverage**
   - Triggered when: Supply disruption alerts detected
   - Shows: Number of supply alerts
   - Recommendation: Business interruption insurance
   - Action: "Learn More" button

**How it works:**
- Recommendations are automatically generated based on:
  - Current risk alerts
  - Risk severity levels
  - Coverage gaps detected

#### D. **Insurance Providers Directory**

**What users see:**
- List of recommended insurance providers
- For each provider:
  - **Provider Name**: e.g., "East Africa Trade Insurance"
  - **Specialization**: What they focus on
  - **Coverage Types**: Checkmarks showing available insurance types
    - ✓ Cargo Insurance
    - ✓ Trade Credit
    - ✓ Liability
    - ✓ Business Interruption
    - ✓ Price Risk
    - ✓ Supplier Risk

**Actions available:**
- **Get Quote** button: Opens quote request (can be implemented)

---

## 🔍 Insurance in Other Parts of the Platform

### 1. **Supplier Directory**

**Location:** `/app/supplier-directory`

**What users see:**
- Suppliers with active insurance show an **Insurance Indicator badge**
- Badge shows:
  - Status: "Insured" (green) or "Not Insured" (gray)
  - Type: e.g., "Cargo Insurance"
  - Coverage amount (if configured)

**Filtering:**
- Users can filter suppliers by insurance status
- Helps find insured suppliers for safer transactions

### 2. **Supplier Detail Pages**

**Location:** `/app/supplier-directory/:id`

**What users see:**
- Detailed insurance information for each supplier
- Insurance status badge prominently displayed
- Insurance expiry dates (if applicable)
- Coverage details

**Use Case:**
- Verify supplier insurance before placing orders
- Check if insurance is still active
- Understand what risks are covered

### 3. **Supplier Scores Page**

**Location:** `/app/supplier-scores`

**What users see:**
- Insurance status as part of supplier scoring
- Insurance indicators in supplier cards
- Insurance contributes to reliability score

### 4. **Logistics Page**

**Location:** `/app/logistics`

**What users see:**
- Shipment insurance status
- Insurance options when creating shipments
- Insurance details in shipment tracking

**Database Fields:**
- `shipments.insurance_active` - Boolean
- `shipments.insurance_details` - JSONB with policy details

---

## 💡 How Insurance Works

### Risk-Based Recommendations

The system automatically analyzes:

1. **Current Risk Profile**
   - High-risk items count
   - Active alerts (price, supply, logistics)
   - Compliance score

2. **Coverage Gaps**
   - Calculated by comparing:
     - Current coverage vs. recommended coverage
     - Risk types vs. insurance types
     - Policy expiry dates

3. **Dynamic Recommendations**
   - If price alerts exist → Recommend price risk insurance
   - If supply alerts exist → Recommend business interruption insurance
   - If high-risk items → Increase recommended coverage amount

### Insurance Types Available

1. **Cargo Insurance**
   - Covers goods in transit
   - Protection against theft, damage, loss
   - Essential for cross-border trade

2. **Professional Liability**
   - Protects against claims of negligence
   - Covers errors in professional services
   - Important for service providers

3. **Trade Credit Insurance**
   - Protects against buyer non-payment
   - Covers credit risks
   - Essential for trade financing

4. **Business Interruption**
   - Covers losses from supply disruptions
   - Protects against operational downtime
   - Recommended when supply alerts exist

5. **Price Risk Insurance**
   - Protects against sudden price spikes
   - Covers volatility risks
   - Recommended when price alerts are active

---

## 🚀 User Workflows

### Workflow 1: Checking Insurance Coverage

1. Navigate to **Risk** page (`/app/risk`)
2. View **Insurance Coverage** card in Overview tab
3. See total coverage and gaps at a glance
4. Click **Insurance** tab for details
5. Review active policies
6. Check for expiring policies

### Workflow 2: Getting Insurance Recommendations

1. Navigate to **Risk** page → **Insurance** tab
2. View **Coverage Recommendations** section
3. See recommendations based on current risks
4. Click **"Explore Options"** or **"Learn More"**
5. Review recommended providers
6. Click **"Get Quote"** to request quotes

### Workflow 3: Finding Insured Suppliers

1. Navigate to **Supplier Directory** (`/app/supplier-directory`)
2. Filter by insurance status (if filter available)
3. Look for suppliers with **Insurance Indicator** badges
4. Click on supplier to see detailed insurance information
5. Verify insurance is active and covers your needs

### Workflow 4: Renewing Expiring Policies

1. Navigate to **Risk** page → **Insurance** tab
2. See orange alert banner for expiring policies
3. Click **"Renew Policy"** button
4. Complete renewal process (can be implemented)

---

## 📊 Insurance Metrics Explained

### Coverage Gaps
- **What it means**: Areas where you have risks but no insurance coverage
- **How it's calculated**: Compares your risk profile to your insurance coverage
- **What to do**: Review recommendations and add coverage

### Recommended Coverage
- **What it means**: Optimal insurance amount based on your risk level
- **How it's calculated**: 
  - Base: $3M for low-risk profiles
  - Increased: $5M for high-risk profiles
- **What to do**: Compare to current coverage and adjust if needed

### Active Policies
- **What it means**: Number of insurance policies currently active
- **Includes**: All types (Cargo, Liability, Credit, etc.)
- **What to do**: Review each policy to understand coverage

---

## 🔔 Insurance Alerts & Notifications

### Expiring Policy Alerts
- **When**: Policies expiring within 30 days
- **Where**: Insurance tab, orange alert banner
- **Action**: Renew policy to maintain coverage

### Coverage Gap Alerts
- **When**: Risks detected without corresponding insurance
- **Where**: Insurance tab, Coverage Recommendations section
- **Action**: Review recommendations and add coverage

### High-Risk Alerts
- **When**: High-risk items detected
- **Where**: Overview tab, Insurance Coverage card
- **Action**: Review insurance coverage and consider increasing

---

## 🎯 Best Practices

1. **Regular Reviews**: Check insurance coverage monthly
2. **Risk Alignment**: Ensure insurance matches your risk profile
3. **Expiry Tracking**: Set reminders for policy renewals
4. **Supplier Verification**: Always check supplier insurance before orders
5. **Coverage Updates**: Update coverage when risks change

---

## 🔗 Related Features

- **Risk Alerts**: Insurance recommendations based on alerts
- **Supplier Directory**: Find insured suppliers
- **Financing**: Insurance can improve financing eligibility
- **Document Vault**: Store insurance certificates
- **Analytics**: Track insurance costs and claims

---

## 📝 Future Enhancements (Can be implemented)

1. **Insurance Claims Tracking**
   - File claims through the platform
   - Track claim status
   - View claim history

2. **Insurance Marketplace**
   - Compare quotes from multiple providers
   - One-click policy purchase
   - Automated renewals

3. **Insurance Analytics**
   - Cost analysis
   - Coverage optimization
   - ROI calculations

4. **Integration with Financing**
   - Bundle insurance with financing
   - Automatic insurance for financed deals
   - Insurance-backed credit

5. **Supplier Insurance Verification**
   - Automated verification
   - Insurance expiry alerts
   - Coverage validation


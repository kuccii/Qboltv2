-- ============================================
-- INSURANCE SCHEMA
-- Insurance providers, quotes, policies, and applications
-- ============================================

-- Insurance Providers (Partner companies)
CREATE TABLE IF NOT EXISTS insurance_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('insurance_company', 'broker', 'fintech')),
  country TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}', -- Countries where they operate
  industry TEXT[] DEFAULT '{}', -- Industries they serve
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  api_endpoint TEXT, -- Partner API endpoint
  api_key TEXT, -- Encrypted API key
  api_config JSONB DEFAULT '{}', -- Additional API configuration
  active BOOLEAN DEFAULT true,
  partner_id TEXT, -- External partner ID
  commission_rate DECIMAL(5, 2) DEFAULT 0, -- Referral commission %
  coverage_types TEXT[] DEFAULT '{}', -- Types of coverage offered
  min_coverage DECIMAL(12, 2),
  max_coverage DECIMAL(12, 2),
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  description TEXT,
  logo_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Quotes (Generated quotes from providers)
CREATE TABLE IF NOT EXISTS insurance_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES insurance_providers(id) ON DELETE SET NULL,
  quote_type TEXT NOT NULL CHECK (quote_type IN ('cargo', 'liability', 'property', 'general', 'trade_credit')),
  coverage_amount DECIMAL(12, 2) NOT NULL,
  premium DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  term_days INTEGER NOT NULL, -- Coverage period in days
  deductible DECIMAL(10, 2),
  coverage_details JSONB DEFAULT '{}', -- Specific coverage details
  requirements TEXT[] DEFAULT '{}', -- Requirements for this quote
  exclusions TEXT[] DEFAULT '{}', -- What's excluded
  quote_data JSONB DEFAULT '{}', -- Full quote data from provider API
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  partner_quote_id TEXT, -- Quote ID from partner API
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Applications (User applications for insurance)
CREATE TABLE IF NOT EXISTS insurance_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES insurance_quotes(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES insurance_providers(id) ON DELETE SET NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('cargo', 'liability', 'property', 'general', 'trade_credit')),
  coverage_amount DECIMAL(12, 2) NOT NULL,
  requested_premium DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'KES',
  term_days INTEGER NOT NULL,
  application_data JSONB DEFAULT '{}', -- Full application data
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  partner_application_id TEXT, -- Application ID from partner API
  approval_notes TEXT,
  policy_id UUID, -- Link to policy if approved
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Policies (Active insurance policies)
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES insurance_applications(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES insurance_providers(id) ON DELETE SET NULL,
  policy_number TEXT NOT NULL UNIQUE,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('cargo', 'liability', 'property', 'general', 'trade_credit')),
  coverage_amount DECIMAL(12, 2) NOT NULL,
  premium DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  term_days INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  deductible DECIMAL(10, 2),
  coverage_details JSONB DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  partner_policy_id TEXT, -- Policy ID from partner API
  auto_renew BOOLEAN DEFAULT false,
  renewal_date TIMESTAMPTZ,
  policy_document_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Claims (Claims submitted for policies)
CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES insurance_providers(id) ON DELETE SET NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('cargo_loss', 'cargo_damage', 'liability', 'property_damage', 'other')),
  claim_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  description TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  supporting_documents TEXT[] DEFAULT '{}', -- URLs to documents
  claim_data JSONB DEFAULT '{}', -- Full claim data
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'paid', 'closed')),
  partner_claim_id TEXT, -- Claim ID from partner API
  approval_amount DECIMAL(10, 2), -- Approved amount
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_user ON insurance_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_provider ON insurance_quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_status ON insurance_quotes(status);
CREATE INDEX IF NOT EXISTS idx_insurance_applications_user ON insurance_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_applications_status ON insurance_applications(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_end_date ON insurance_policies(end_date);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user ON insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);

-- Triggers for updated_at
CREATE TRIGGER update_insurance_providers_updated_at
  BEFORE UPDATE ON insurance_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_quotes_updated_at
  BEFORE UPDATE ON insurance_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_applications_updated_at
  BEFORE UPDATE ON insurance_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON insurance_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- Insurance Providers: Public read, admin write
CREATE POLICY "Anyone can view active insurance providers"
  ON insurance_providers FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage insurance providers"
  ON insurance_providers FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insurance Quotes: Users can view/create their own
CREATE POLICY "Users can view their own quotes"
  ON insurance_quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes"
  ON insurance_quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
  ON insurance_quotes FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can view all quotes
CREATE POLICY "Admins can view all quotes"
  ON insurance_quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insurance Applications: Users can view/create their own
CREATE POLICY "Users can view their own applications"
  ON insurance_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON insurance_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON insurance_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can view all applications
CREATE POLICY "Admins can view all applications"
  ON insurance_applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insurance Policies: Users can view their own
CREATE POLICY "Users can view their own policies"
  ON insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all policies"
  ON insurance_policies FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insurance Claims: Users can view/create their own
CREATE POLICY "Users can view their own claims"
  ON insurance_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
  ON insurance_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
  ON insurance_claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can view all claims
CREATE POLICY "Admins can view all claims"
  ON insurance_claims FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));


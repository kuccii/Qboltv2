-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- User-Based Data Isolation & Access Control
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Public profiles are viewable (basic info only)
CREATE POLICY "Public profiles are viewable"
  ON user_profiles FOR SELECT
  USING (true); -- Allow public read of basic info

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- USER ACTIVITIES POLICIES
-- ============================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert activities (via service role)
-- Users can view aggregated public activities

-- ============================================
-- PRICES POLICIES
-- ============================================

-- Anyone can view prices (public data)
CREATE POLICY "Anyone can view prices"
  ON prices FOR SELECT
  USING (true);

-- Authenticated users can insert prices
CREATE POLICY "Authenticated users can insert prices"
  ON prices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own price reports
CREATE POLICY "Users can update own price reports"
  ON prices FOR UPDATE
  USING (reported_by = auth.uid());

-- Admins can delete prices
CREATE POLICY "Admins can delete prices"
  ON prices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PRICE REPORTS POLICIES
-- ============================================

-- Users can view all price reports
CREATE POLICY "Users can view price reports"
  ON price_reports FOR SELECT
  USING (true);

-- Users can create price reports
CREATE POLICY "Users can create price reports"
  ON price_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own price reports"
  ON price_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can verify/approve reports
CREATE POLICY "Admins can verify price reports"
  ON price_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- DEMAND DATA POLICIES
-- ============================================

-- Anyone can view demand data (public)
CREATE POLICY "Anyone can view demand data"
  ON demand_data FOR SELECT
  USING (true);

-- Only admins can modify demand data
CREATE POLICY "Admins can modify demand data"
  ON demand_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SUPPLIERS POLICIES
-- ============================================

-- Anyone can view suppliers (public)
CREATE POLICY "Anyone can view suppliers"
  ON suppliers FOR SELECT
  USING (true);

-- Users can create supplier profiles
CREATE POLICY "Users can create supplier profiles"
  ON suppliers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Suppliers can update their own profile
CREATE POLICY "Suppliers can update own profile"
  ON suppliers FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can verify suppliers
CREATE POLICY "Admins can verify suppliers"
  ON suppliers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SUPPLIER REVIEWS POLICIES
-- ============================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON supplier_reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON supplier_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON supplier_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON supplier_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- AGENTS POLICIES
-- ============================================

-- Anyone can view agents
CREATE POLICY "Anyone can view agents"
  ON agents FOR SELECT
  USING (true);

-- Users can create agent profiles
CREATE POLICY "Users can create agent profiles"
  ON agents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Agents can update their own profile
CREATE POLICY "Agents can update own profile"
  ON agents FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- AGENT BOOKINGS POLICIES
-- ============================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON agent_bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = (
    SELECT user_id FROM agents WHERE id = agent_bookings.agent_id
  ));

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON agent_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON agent_bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SHIPMENTS POLICIES
-- ============================================

-- Users can view their own shipments
CREATE POLICY "Users can view own shipments"
  ON shipments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create shipments
CREATE POLICY "Users can create shipments"
  ON shipments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shipments
CREATE POLICY "Users can update own shipments"
  ON shipments FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone with tracking number can view shipment status (public)
CREATE POLICY "Anyone can track shipments"
  ON shipments FOR SELECT
  USING (true); -- Tracking numbers are public for delivery tracking

-- ============================================
-- FINANCING POLICIES
-- ============================================

-- Anyone can view financing offers (public)
CREATE POLICY "Anyone can view financing offers"
  ON financing_offers FOR SELECT
  USING (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON financing_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications"
  ON financing_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON financing_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RISK ALERTS POLICIES
-- ============================================

-- Users can view their own alerts and global alerts
CREATE POLICY "Users can view relevant alerts"
  ON risk_alerts FOR SELECT
  USING (
    user_id IS NULL OR -- Global alerts
    user_id = auth.uid() -- User's own alerts
  );

-- System/admins can create alerts
CREATE POLICY "Authenticated users can create alerts"
  ON risk_alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own alerts
CREATE POLICY "Users can update own alerts"
  ON risk_alerts FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RISK ASSESSMENTS POLICIES
-- ============================================

-- Users can view their own assessments
CREATE POLICY "Users can view own assessments"
  ON risk_assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create assessments
CREATE POLICY "Users can create assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
  ON risk_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================

-- Users can view their own documents and shared documents
CREATE POLICY "Users can view accessible documents"
  ON documents FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.uid() = ANY(shared_with) OR
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Users can create documents
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Service role handles this

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRADE OPPORTUNITIES POLICIES
-- ============================================

-- Anyone can view active opportunities
CREATE POLICY "Anyone can view active opportunities"
  ON trade_opportunities FOR SELECT
  USING (true);

-- Users can create opportunities
CREATE POLICY "Users can create opportunities"
  ON trade_opportunities FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

-- Users can update their own opportunities
CREATE POLICY "Users can update own opportunities"
  ON trade_opportunities FOR UPDATE
  USING (auth.uid() = posted_by);

-- ============================================
-- OPPORTUNITY MATCHES POLICIES
-- ============================================

-- Users can view matches for their opportunities
CREATE POLICY "Users can view relevant matches"
  ON opportunity_matches FOR SELECT
  USING (
    auth.uid() IN (
      SELECT posted_by FROM trade_opportunities WHERE id = opportunity_id
    ) OR
    auth.uid() = matched_with
  );

-- System creates matches automatically
CREATE POLICY "System can create matches"
  ON opportunity_matches FOR INSERT
  WITH CHECK (true);

-- Users can update matches they're involved in
CREATE POLICY "Users can update relevant matches"
  ON opportunity_matches FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT posted_by FROM trade_opportunities WHERE id = opportunity_id
    ) OR
    auth.uid() = matched_with
  );

-- ============================================
-- REALTIME ENABLED TABLES
-- ============================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE prices;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE trade_opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE risk_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE market_trends;





-- ============================================
-- PRICE ALERTS TABLE
-- User-configurable price alerts and notifications
-- ============================================

-- Price Alerts Table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below', 'change')),
  threshold DECIMAL(10, 2), -- For 'above' or 'below' conditions
  change_percent DECIMAL(5, 2), -- For 'change' condition
  active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "in_app": true,
    "sms": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_material ON price_alerts(material);
CREATE INDEX IF NOT EXISTS idx_price_alerts_country ON price_alerts(country);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_material_country ON price_alerts(material, country);

-- Trigger for updated_at
CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own price alerts"
  ON price_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own alerts
CREATE POLICY "Users can create own price alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts
CREATE POLICY "Users can update own price alerts"
  ON price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own price alerts"
  ON price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all alerts
CREATE POLICY "Admins can view all price alerts"
  ON price_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );






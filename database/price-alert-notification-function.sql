-- ============================================
-- PRICE ALERT NOTIFICATION FUNCTION
-- Checks price changes and triggers alerts
-- ============================================

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  should_trigger BOOLEAN := false;
  previous_price DECIMAL(10, 2);
BEGIN
  -- Get previous price if it exists
  SELECT price INTO previous_price
  FROM prices
  WHERE material = NEW.material
    AND country = NEW.country
    AND location = COALESCE(NEW.location, '')
    AND id != NEW.id
  ORDER BY updated_at DESC
  LIMIT 1;

  -- Check all active alerts for this material/country
  FOR alert_record IN
    SELECT * FROM price_alerts
    WHERE active = true
      AND material = NEW.material
      AND country = NEW.country
      AND (location IS NULL OR location = NEW.location)
  LOOP
    should_trigger := false;

    -- Check condition
    CASE alert_record.condition
      WHEN 'above' THEN
        IF NEW.price >= alert_record.threshold THEN
          should_trigger := true;
        END IF;
      
      WHEN 'below' THEN
        IF NEW.price <= alert_record.threshold THEN
          should_trigger := true;
        END IF;
      
      WHEN 'change' THEN
        IF previous_price IS NOT NULL THEN
          DECLARE
            change_pct DECIMAL(5, 2);
          BEGIN
            change_pct := ABS((NEW.price - previous_price) / previous_price * 100);
            IF change_pct >= alert_record.change_percent THEN
              should_trigger := true;
            END IF;
          END;
        END IF;
    END CASE;

    -- If alert should trigger, update alert and create notification
    IF should_trigger THEN
      -- Update alert record
      UPDATE price_alerts
      SET 
        last_triggered = NOW(),
        trigger_count = trigger_count + 1,
        updated_at = NOW()
      WHERE id = alert_record.id;

      -- Create notification
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        priority,
        metadata
      ) VALUES (
        alert_record.user_id,
        'price_alert',
        'Price Alert: ' || alert_record.material,
        CASE alert_record.condition
          WHEN 'above' THEN alert_record.material || ' price in ' || alert_record.country || ' is now above ' || alert_record.threshold || ' ' || NEW.currency
          WHEN 'below' THEN alert_record.material || ' price in ' || alert_record.country || ' is now below ' || alert_record.threshold || ' ' || NEW.currency
          WHEN 'change' THEN alert_record.material || ' price in ' || alert_record.country || ' changed by ' || alert_record.change_percent || '%'
        END,
        '/app/prices',
        'high',
        jsonb_build_object(
          'alert_id', alert_record.id,
          'material', alert_record.material,
          'country', alert_record.country,
          'current_price', NEW.price,
          'condition', alert_record.condition,
          'price_id', NEW.id
        )
      );

      -- TODO: Send email notification if enabled
      -- This would require Supabase Edge Function or external service
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on price updates
CREATE TRIGGER price_alert_check_trigger
  AFTER INSERT OR UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION check_price_alerts();













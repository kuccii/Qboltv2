// Script to fetch and sync LogCluster data to Supabase
// Run: npm run sync-logcluster
// or: node scripts/sync-logcluster-data.js

import { supabase } from '../src/lib/supabase.js';
import logClusterFetcher from '../src/services/logClusterFetcher.js';

const countries = ['RW', 'KE', 'UG', 'TZ', 'ET'];

async function syncLogClusterData() {
  console.log('🚀 Starting LogCluster data sync...\n');

  for (const countryCode of countries) {
    console.log(`📊 Syncing ${countryCode}...`);
    
    try {
      // Check if LogCluster API is configured
      const apiKey = process.env.LOGCLUSTER_API_KEY;
      
      if (!apiKey) {
        console.warn(`⚠️  LOGCLUSTER_API_KEY not set. Skipping API fetch for ${countryCode}.`);
        console.log('   💡 To enable API fetching:');
        console.log('   1. Get API access from LogCluster');
        console.log('   2. Set LOGCLUSTER_API_KEY in .env');
        console.log('   3. Run this script again\n');
        continue;
      }

      // Fetch data from LogCluster
      const data = await logClusterFetcher.fetchCountryData(countryCode);
      
      if (data) {
        // Sync to database
        await logClusterFetcher.syncCountryData(countryCode);
        console.log(`✅ Successfully synced ${countryCode}\n`);
      } else {
        console.warn(`⚠️  No data returned for ${countryCode}\n`);
      }
    } catch (error) {
      console.error(`❌ Error syncing ${countryCode}:`, error);
      console.log('');
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('✨ Sync complete!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncLogClusterData().catch(console.error);
}

export default syncLogClusterData;



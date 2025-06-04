const fetch = require('node-fetch');
const moment = require('moment-timezone');

const SUPABASE_URL = 'https://cbfcikwyrrujufltdgsq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZmNpa3d5cnJ1anVmbHRkZ3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjA0MTgsImV4cCI6MjA1NzkzNjQxOH0.AW72XXMDipFXbvCj0ZidQuOhVS_yjEvgCmM8OJ-COyc';
const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// Helper to get live carbon intensity from Delectro API
const getCarbonIntensity = async () => {
  const res = await fetch('https://delectro.com.au/api/latest-carbon');
  const data = await res.json();
  console.log('Live Carbon Intensity from API:', data.carbonIntensity);
  return data.carbonIntensity;
};

// Get last logged value from Supabase to avoid duplicates
const getLastLoggedValue = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs?order=timestamp.desc&limit=1`, {
    headers,
  });
  const data = await res.json();
  return data.length > 0 ? data[0].carbon_intensity : null;
};

// Push new value with NSW timestamp
const logToSupabase = async (carbonIntensity) => {
  const sydneyTime = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      timestamp: sydneyTime,
      carbon_intensity: carbonIntensity,
      region: REGION,
      source: SOURCE,
    }),
  });

  return response.ok;
};

// Main job
const main = async () => {
  try {
    const currentCI = await getCarbonIntensity();
    const lastCI = await getLastLoggedValue();

    if (currentCI !== lastCI) {
      const logged = await logToSupabase(currentCI);
      if (logged) {
        console.log(`✅ Logged carbon intensity ${currentCI} at NSW time`);
      } else {
        console.error('❌ Failed to log data to Supabase');
      }
    } else {
      console.log('No change in carbon intensity. Skipping log.');
    }
  } catch (err) {
    console.error('Error in deloca-logger:', err.message);
  }
};

main();

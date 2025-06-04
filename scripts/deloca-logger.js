// scripts/deloca-logger.js

const fetch = require('node-fetch');
const moment = require('moment-timezone');

// Pulling config from Heroku environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

// ✅ Construct request headers for Supabase
const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ✅ Log carbon intensity to Supabase
const logToSupabase = async (carbonIntensity) => {
  const timestamp = moment().tz('Australia/Sydney').format();

  const payload = {
    carbon_intensity: carbonIntensity,
    region: REGION,
    source: SOURCE,
    timestamp,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('❌ Failed to log to Supabase:', err);
    return false;
  }

  return true;
};

// ✅ Fetch the most recent carbon intensity value logged
const getLastLoggedValue = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs?order=timestamp.desc&limit=1`, {
    headers,
  });

  const data = await res.json();
  return data.length > 0 ? data[0].carbon_intensity : null;
};

// ✅ Fetch latest carbon intensity from your Heroku backend
const getCarbonIntensity = async () => {
  const response = await fetch('https://shrouded-basin-51086-f0068193f66e.herokuapp.com/api/latest-carbon');
  const data = await response.json();

  if (!data.carbonIntensity) {
    throw new Error('carbonIntensity field missing in response');
  }

  return data.carbonIntensity;
};

// ✅ Orchestrate the logic: check if new data needs to be logged
const main = async () => {
  try {
    const currentCI = await getCarbonIntensity();
    const lastCI = await getLastLoggedValue();

    console.log(`[🟢] Current: ${currentCI} | Last Logged: ${lastCI}`);

    if (currentCI !== lastCI) {
      const logged = await logToSupabase(currentCI);
      if (logged) {
        console.log(`✅ Logged new carbon intensity: ${currentCI}`);
      } else {
        console.error('❌ Failed to log new value.');
      }
    } else {
      console.log('ℹ️ No change detected. Skipping log.');
    }
  } catch (err) {
    console.error('🚨 Error in deloca-logger:', err.message);
  }
};

// ✅ Start script
main();

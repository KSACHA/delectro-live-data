// scripts/deloca-logger.js

const fetch = require('node-fetch');
const moment = require('moment-timezone');

// ✅ Environment variables for config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

// ✅ Supabase request headers
const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ✅ Log carbon intensity to Supabase with AEST and UTC timestamps
const logToSupabase = async (carbonIntensity) => {
const aest = moment().tz('Australia/Sydney');
const timestamp_aest = aest.format('DD-MM-YYYY HH:mm');
const timestamp = moment.utc().format(); // ✅ Use direct UTC here

  const payload = {
    carbon_intensity: carbonIntensity,
    region: REGION,
    source: SOURCE,
    timestamp_aest, // Human-readable in AEST
    timestamp,  // UTC ISO for backend/analytics use
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

// ✅ Fetch the last logged carbon intensity (ensures chronological integrity)
const getLastLoggedValue = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs?select=carbon_intensity&order=timestamp_utc.desc&limit=1`, {
    headers,
  });

  const data = await res.json();
  return data.length > 0 ? data[0].carbon_intensity : null;
};

// ✅ Fetch live carbon intensity from Heroku proxy
const getCarbonIntensity = async () => {
  const response = await fetch('https://shrouded-basin-51086-f0068193f66e.herokuapp.com/api/latest-carbon');
  const data = await response.json();

  if (!data.carbonIntensity) {
    throw new Error('carbonIntensity field missing in response');
  }

  return data.carbonIntensity;
};

// ✅ Main logger logic — renamed for clarity
const runDelocaLogger = async () => {
  try {
    const currentCI = await getCarbonIntensity();
    const lastCI = await getLastLoggedValue();

    const aestLog = moment().tz('Australia/Sydney').format('DD-MM-YYYY HH:mm');
    console.log(`[🕒 ${aestLog} AEST] Current: ${currentCI} | Last Logged: ${lastCI}`);

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

// ✅ Execute
runDelocaLogger();

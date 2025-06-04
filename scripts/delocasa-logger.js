const fetch = require('node-fetch');
const moment = require('moment-timezone');
require('dotenv').config(); // Just in case you test locally

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const logToSupabase = async (carbonIntensity) => {
  const timestamp = moment().tz('Australia/Sydney').format();

  const payload = {
    carbon_intensity: carbonIntensity,
    region: REGION,
    source: SOURCE,
    timestamp,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('❌ Supabase insert failed:', errText);
  }

  return response.ok;
};

const getLastLoggedValue = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs?order=timestamp.desc&limit=1`, {
    headers,
  });
  const data = await res.json();
  return data.length > 0 ? data[0].carbon_intensity : null;
};

const getCarbonIntensity = async () => {
  const res = await fetch('https://shrouded-basin-51086.herokuapp.com/api/latest-carbon');
  const data = await res.json();

  if (!data.carbonIntensity) {
    throw new Error('carbonIntensity not found in response');
  }

  return data.carbonIntensity;
};

const main = async () => {
  try {
    const currentCI = await getCarbonIntensity();
    const lastCI = await getLastLoggedValue();

    console.log(`[🟢] Current: ${currentCI} | Last Logged: ${lastCI}`);

    if (currentCI !== lastCI) {
      const success = await logToSupabase(currentCI);
      console.log(success ? `✅ Logged: ${currentCI}` : '❌ Logging failed');
    } else {
      console.log('ℹ️ No change in carbon intensity. Skipping insert.');
    }
  } catch (err) {
    console.error('🚨 deloca-logger error:', err.message);
  }
};

main();

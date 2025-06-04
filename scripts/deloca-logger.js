const fetch = require('node-fetch');
const moment = require('moment-timezone');

const SUPABASE_URL = 'https://cbfcikwyrrujufltdgsq.supabase.co';
const SUPABASE_KEY = 'your_full_key_here'; // Keep safe!
const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const logToSupabase = async (carbonIntensity) => {
  const sydneyTimestamp = moment().tz('Australia/Sydney').format(); // Sydney time

  const response = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      carbon_intensity: carbonIntensity,
      region: REGION,
      source: SOURCE,
      timestamp: sydneyTimestamp, // Explicitly log this
    }),
  });
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
  return data.carbonIntensity;
};

const main = async () => {
  try {
    const currentCI = await getCarbonIntensity();
    const lastCI = await getLastLoggedValue();

    console.log(`Current CI: ${currentCI}, Last CI: ${lastCI}`);

    if (currentCI !== lastCI) {
      const logged = await logToSupabase(currentCI);
      if (logged) {
        console.log(`✅ Logged carbon intensity: ${currentCI}`);
      } else {
        console.error('❌ Failed to log data to Supabase.');
      }
    } else {
      console.log('ℹ️ No change in carbon intensity. Skipping log.');
    }
  } catch (err) {
    console.error('🚨 Error in deloca-logger:', err.message);
  }
};

main();

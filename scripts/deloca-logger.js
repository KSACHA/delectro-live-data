const fetch = require('node-fetch');

const SUPABASE_URL = 'https://cbfcikwyrrujufltdgsq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZmNpa3d5cnJ1anVmbHRkZ3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjA0MTgsImV4cCI6MjA1NzkzNjQxOH0.AW72XXMDipFXbvCj0ZidQuOhVS_yjEvgCmM8OJ-COyc';
const REGION = 'AU-NSW';
const SOURCE = 'electricitymaps';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const logToSupabase = async (carbonIntensity) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      carbon_intensity: carbonIntensity,
      region: REGION,
      source: SOURCE,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Supabase insert failed:', errorText);
  }

  return response.ok;
};

const main = async () => {
  try {
    // FORCE insert dummy value for debug
    const testValue = Math.floor(Math.random() * 1000); // e.g. 457
    const logged = await logToSupabase(testValue);
    if (logged) {
      console.log(`✅ Test log inserted: carbon_intensity = ${testValue}`);
    } else {
      console.log('❌ Test log insert failed.');
    }
  } catch (err) {
    console.error('💥 Script error:', err.message);
  }
};

main();

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
    const text = await response.text();
    console.error('Supabase insert error:', text);
  }

  return response.ok;
};

const main = async () => {
  try {
    // FORCED logging with test value
    const logged = await logToSupabase(456);
    if (logged) {
      console.log('✔️ Test carbon intensity value logged successfully');
    } else {
      console.error('❌ Failed to log test data to Supabase.');
    }
  } catch (err) {
    console.error('Error in logger:', err.message);
  }
};

main();

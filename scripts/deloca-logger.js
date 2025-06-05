// ✅ deloca-logger.js (cleaned, with AEST timestamp and consistent naming)

const fetch = require("node-fetch");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ELECTRICITYMAPS_API_KEY = process.env.ELECTRICITYMAPS_API_KEY;

const fetchCarbonIntensity = async () => {
  const res = await fetch("https://api.electricitymap.org/v3/carbon-intensity/latest?zone=AU-NSW", {
    headers: {
      "auth-token": ELECTRICITYMAPS_API_KEY,
    },
  });
  const data = await res.json();
  return data.data.carbonIntensity;
};

const fetchLastLoggedIntensity = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs?select=carbon_intensity&order=timestamp.desc&limit=1`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const data = await res.json();
  return data.length > 0 ? data[0].carbon_intensity : null;
};

const logToSupabase = async (carbonIntensity, timestamp) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deloca_logs`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      timestamp,
      carbon_intensity: carbonIntensity,
      region: "AU-NSW",
      source: "electricitymaps",
    }),
  });
  return res.ok;
};

const getAESTTimestamp = () => {
  return new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    hour12: false,
  });
};

const runDelocaLogger = async () => {
  const currentIntensity = await fetchCarbonIntensity();
  const lastLogged = await fetchLastLoggedIntensity();

  console.log(`[AEST: ${getAESTTimestamp()}] Current: ${currentIntensity} | Last Logged: ${lastLogged}`);

  if (currentIntensity !== lastLogged) {
    const timestamp = new Date().toISOString(); // Store in UTC (recommended), or swap with getAESTTimestamp() for local string
    const result = await logToSupabase(currentIntensity, timestamp);
    console.log(result ? "✅ Logged new carbon intensity." : "❌ Failed to log to Supabase.");
  } else {
    console.log("⚠ No change in carbon intensity — skipping log.");
  }
};

runDelocaLogger();

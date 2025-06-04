const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config(); // Ensure dotenv is required

app.use(express.static('public'));

app.get('/data', async (req, res) => {
    try {
        const response = await axios.get('https://api.electricitymap.org/v3/carbon-intensity/latest', {
            headers: {
                'auth-token': process.env.API_KEY, // Use the environment variable for the API key
            },
            params: {
                zone: 'AU-NSW' // Replace with the appropriate zone identifier
            }
        });

        // Convert the timestamp to AU-NSW time
        const timestamp = moment.tz(response.data.timestamp, "Australia/Sydney");
        response.data.timestamp = timestamp.format();

        console.log('API Response:', response.data); // Log the API response
        res.json(response.data);
    } catch (error) {
        console.error('Error retrieving data:', error); // Log any errors
        res.status(500).send('Error retrieving data');
    }
});

// New API route to serve just the carbon intensity
app.get('/api/latest-carbon', (req, res) => {
    if (latestCarbonIntensity !== null) {
        res.json({ carbonIntensity: latestCarbonIntensity });
    } else {
        res.status(503).json({ error: 'Carbon intensity not available yet' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

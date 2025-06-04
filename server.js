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
app.get('/api/latest-carbon', async (req, res) => {
    try {
        const response = await axios.get('https://api.electricitymap.org/v3/carbon-intensity/latest', {
            headers: {
                'auth-token': process.env.API_KEY
            },
            params: {
                zone: 'AU-NSW'
            }
        });

        const carbonIntensity = response.data.data.carbonIntensity;
        res.json({ carbonIntensity });
    } catch (error) {
        console.error('Error in /api/latest-carbon:', error.message);
        res.status(500).json({ error: 'Failed to fetch carbon intensity' });
    }
});

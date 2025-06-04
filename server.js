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
                zone: 'AU-NSW'
            }
        });

        const timestamp = moment.tz(response.data.timestamp, "Australia/Sydney");
        response.data.timestamp = timestamp.format();

        console.log('API Response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('Error retrieving data');
    }
});

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

        const carbonIntensity = response.data.carbonIntensity;
        if (!carbonIntensity) {
            console.error('Carbon intensity missing in response:', response.data);
            return res.status(500).json({ error: 'Invalid response structure' });
        }

        res.json({ carbonIntensity });
    } catch (error) {
        console.error('Error in /api/latest-carbon:', error.message);
        res.status(500).json({ error: 'Failed to fetch carbon intensity' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

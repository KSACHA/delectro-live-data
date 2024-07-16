const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const cors = require('cors'); // Add this line
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

// Ensure environment variables are used for sensitive data
const API_KEY = process.env.ELECTRICITYMAP_API_KEY || 't0YlBRSVRdDFF';

app.use(cors()); // Add this line
app.use(express.static('public'));

app.get('/data', async (req, res) => {
    try {
        const response = await axios.get('https://api.electricitymap.org/v3/carbon-intensity/latest', {
            headers: {
                'auth-token': API_KEY, // Use environment variable
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
        console.error('Error retrieving data:', error.message); // Log any errors
        res.status(500).send(`Error retrieving data: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

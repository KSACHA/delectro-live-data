const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/data', async (req, res) => {
    try {
        const response = await axios.get('https://api.electricitymap.org/v3/carbon-intensity/latest?zone=DK-DK1', {
            headers: {
                'auth-token': 't0YlBRSVRdDFF' // Replace with your actual API key
            },
            params: {
                zone: 'DK-DK1' // Replace with the appropriate zone identifier
            }
        });
        console.log('API Response:', response.data); // Log the API response
        res.json(response.data);
    } catch (error) {
        console.error('Error retrieving data:', error); // Log any errors
        res.status(500).send('Error retrieving data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

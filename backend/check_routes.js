const axios = require('axios');

const INVALID_ID = '6989fec6d00d1e3b958277bb';
const VALID_ID = '6989fec6d00d1e3b958278f2';
const BASE_URL = 'http://localhost:5000/api/public/deadlock/match';

async function checkRoutes() {
    console.log('--- Checking Invalid ID ---');
    try {
        await axios.get(`${BASE_URL}/${INVALID_ID}`);
        console.log('FAIL: Invalid ID returned 200 OK');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('PASS: Invalid ID returned 404 Not Found');
        } else {
            console.log(`FAIL: Invalid ID returned ${error.response ? error.response.status : error.message}`);
        }
    }

    console.log('\n--- Checking Valid ID ---');
    try {
        const response = await axios.get(`${BASE_URL}/${VALID_ID}`);
        if (response.status === 200) {
            console.log('PASS: Valid ID returned 200 OK');
        } else {
            console.log(`FAIL: Valid ID returned ${response.status}`);
        }
    } catch (error) {
        console.log(`FAIL: Valid ID returned error: ${error.message}`);
    }
}

checkRoutes();

const express = require('express');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001
app.get('/', async (req, res)  => { 
    try {
        const URL = 'https://apple-pay-gateway.apple.com/paymentservices/startSession';
        // use set the certificates for the POST request
        httpsAgent = new https.Agent({
            rejectUnauthorized: false,
            cert: fs.readFileSync(path.join(__dirname, './certificate_sandbox.pem')),
            key: fs.readFileSync(path.join(__dirname, './certificate_sandbox.key')),
        });
    
        response = await axios.post(
            URL,
            {
                merchantIdentifier: 'merchant.apple.itg.test',
                domainName: 'apple-pay-g4qy5.ondigitalocean.app',
                displayName: 'apple-pay-g4qy5.ondigitalocean.app',
            },
            {
                httpsAgent,
            }
        );
        res.send(response.data);
    } catch (error) {
        console.log('error', error);
      }
});

(async () => {
    try {
    const URL = 'https://apple-pay-gateway.apple.com/paymentservices/startSession';
    // use set the certificates for the POST request
    httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        cert: fs.readFileSync(path.join(__dirname, './certificate_sandbox.pem')),
        key: fs.readFileSync(path.join(__dirname, './certificate_sandbox.key')),
    });

    response = await axios.post(
        URL,
        {
            merchantIdentifier: 'merchant.apple.itg.test',
            domainName: 'apple-pay-g4qy5.ondigitalocean.app',
            displayName: 'apple-pay-g4qy5.ondigitalocean.app',
        },
        {
            httpsAgent,
        }
    );
    console.log('resp', response.data);
} catch (error) {
    console.log('error', error);
  }
})();
app.listen(port, () => {    console.log(`Example app listening on port ${port}`)})

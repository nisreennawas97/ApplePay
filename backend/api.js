const express = require('express');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {res.send('Hello World!')})

app.get('/validate-merchant', async (req, res)  => { 
    try {
        const appleUrl = req?.body?.appleUrl || 'https://apple-pay-gateway.apple.com/paymentservices/startSession';
        // use set the certificates for the POST request
        httpsAgent = new https.Agent({
            rejectUnauthorized: false,
            cert: fs.readFileSync(path.join(__dirname, './certs/marchent_id.pem')),
            key: fs.readFileSync(path.join(__dirname, './certs/marchent_id.key')),
        });
    
        response = await axios.post(
            appleUrl,
            {
                merchantIdentifier: 'merchant.apple.itg.test',
                domainName: 'apple-pay-g4qy5.ondigitalocean.app',
                displayName: 'apple-pay-g4qy5.ondigitalocean.app',
            },
            {
                httpsAgent,
            }
        );
        res.send(response?.data);
    } catch (error) {
        console.log('error', error);
    }
});

app.post('/authorizeNetApi', async (req, res)  => { 
    const reqData = {
        createTransactionRequest: {
            merchantAuthentication: {
            name: '39PR8MKxrTA', //NEXT_AUTHORIZENET_API_LOGIN_ID,
            transactionKey: '5W6zqL84KcK8A4kS' //NEXT_AUTHORIZENET_TRANSACTION_KEY,
            },
            ...req?.body,
        },
    };
    let authNetConfig = {
        method: 'post',
        url: 'https://apitest.authorize.net/xml/v1/request.api', //NEXT_AUTHORIZENET_API_URL
        headers: {
        'Content-Type': 'application/json',
        },
        data: reqData,
    };
    try {
        const { data } = await axios(authNetConfig);
        res.status(200).json(data);
        return;
    } catch (err) {
        res
        .status(err?.response?.status || 500)
        .json(err && err.response && err.response.data);
        return;
    }
});

app.listen(port, function() {
    console.log('Apple Pay server running on ' + port);
});

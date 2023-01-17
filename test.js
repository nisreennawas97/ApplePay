const fs = require('fs');
// const http = require('http');
const https = require('https');
const axios = require('axios');
// const glob = require('glob');
const path = require('path');

// console.log(' fs', fs);
// const merchIdentityCert = fs.readFileSync(
//   'pages/api/apple-pay/merchant_id-client.cer'
// );
// const root = path.resolve(__dirname, '../validate-merchant');
// let descriptors = glob
// .sync('merchant_id-client_pem.pem', { cwd: root })
// .map((fname) => require(path.join(root, fname)).default);
// console.log('descriptors', descriptors)

///////////
// const pem = require('pem');

// pem.readCertificateInfo('pages/api/apple-pay/validate-merchant/merchant_id-client_pem.pem', (err, cert) => {
//   console.log('cert', cert);
// });

//////////////
// const crypto = require('crypto');

// const certificate1 = fs.readFileSync('pages/api/apple-pay/validate-merchant/merchant_id-client_pem.pem', 'utf-8'); 
// console.log(crypto);
// const cert = crypto.Certificate.fromPEM(certificate1);

// // const cert = crypto.Certificate.parse(certificate1);
// console.log(cert);
////////////


// let pemBuffer = Buffer.from(merchIdentityKey, 'utf-8');

// console.log('pemBuffer', pemBuffer);

// const pem = require('pem');

// pem.readCertificateInfo(path.resolve(__dirname, 'pages/api/apple-pay/validate-merchant/merchant_id-client_pem.pem'), (err, info) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log('info', info)
//     // do something with the info
// });


// let pem = fs.readFileSync('pages/api/apple-pay/validate-merchant/merchant_id-client_pem.pem', 'utf-8');

// // create an https agent with the merchant certificate
// const httpsAgent = new https.Agent({
//   pfx: pem,
//   passphrase: 'your_passphrase',
// });


// const merchIdentityKey = fs.readFileSync(
//     path.resolve(__dirname, './merchant_id-client_pem.pem')
//   );
  const merchIdentityCert = fs.readFileSync(
    path.resolve(__dirname, './base64_apple_pay.cer')
  );

const httpsAgent = new https.Agent({
  cert: merchIdentityCert,
  key: merchIdentityCert,
  maxVersion: 'TLSv1.2',
  minVersion: 'TLSv1.2',
});


const URL = 'https://apple-pay-gateway.apple.com/paymentservices/startSession';
const options = {
  merchantIdentifier: 'merchant.apple.itg.test',
  displayName: 'apple-pay-g4qy5.ondigitalocean.app',
  domainName: 'apple-pay-g4qy5.ondigitalocean.app',
};
(async () => {
  try {
    const resp = await axios.post(URL, options, {
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: httpsAgent,
    });
    console.log('resp', resp?.data);
  } catch (error) {
    console.log('error', error);
  }
})();

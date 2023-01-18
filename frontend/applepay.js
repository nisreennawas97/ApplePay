var MERCHANT_IDENTIFIER = 'merchant.apple.itg.test';
const NGROK_HTTPS_HOST = 'https://3bb3-188-161-238-9.ngrok.io';

var appleButton = document.querySelector('.apple-pay-button');

//check if the apple pay is available
document.addEventListener('DOMContentLoaded', function() { 
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        var promise = ApplePaySession.canMakePaymentsWithActiveCard(MERCHANT_IDENTIFIER);
        promise.then(function(canMakePayments) {
        if (canMakePayments) {
            console.log('canMakePayments(): true');
            //show the apple pay button
            appleButton.style.display = 'block';
        }
        });
    }
}, false);

//Handel the apple pay button click
document.addEventListener('click', function() {
    console.log('ApplePayButton Clicked');
    const request = {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: [
            'supports3DS',
            'supportsDebit',
            'supportsCredit',
        ],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        total: { 
            label: 'Product Name', 
            amount: '1',
            type: 'final'
        }
    };

    console.log('Apple Pay request:', request);

    const applePaySession = new ApplePaySession(3, request);
    console.log('Apple Pay Session:', session);

    //This is the first event that apple triggers. Here you need to validate the
    //Apple pay session from Backend
    applePaySession.onvalidatemerchant = async (event) => {
        console.log('onvalidatemerchant:', event);

        const merchantSession = await axios.post(
            `${NGROK_HTTPS_HOST}/validate-merchant`,
            {
                appleUrl: event.validationURL
            }
        );
        console.log(
            'onvalidatemerchant (checkout) merchantSession:',
            merchantSession
        );
        session.completeMerchantValidation(merchantSession);
    };

    // Define ApplePayPaymentMethodUpdate based on the selected payment method.
    // No updates or errors are needed, pass an empty object.
    applePaySession.onpaymentmethodselected = (event) => {
        console.log('onpaymentmethodselected:', event);
        const update = {};
        applePaySession.completePaymentMethodSelection(update);
    };

    // Define ApplePayShippingMethodUpdate based on the selected shipping method.
    // No updates or errors are needed, pass an empty object.
    applePaySession.onshippingmethodselected = (event) => {
        console.log('onshippingmethodselected:', event);
        const update = {};
        applePaySession.completeShippingMethodSelection(update);
    };

    // Define ApplePayShippingContactUpdate based on the selected shipping contact.
    applePaySession.onshippingcontactselected = (event) => {
        console.log('onshippingcontactselected:', event);
        const update = {};
        applePaySession.completeShippingContactSelection(update);
    };

    //This triggers after the user  has confirmed the transaction with the Touch ID or Face
    //This will contain the payment token
    applePaySession.onpaymentauthorized = async (event) => {
        console.log('onpaymentauthorized event:', event);

        const lineItems = {
            lineItem: {
                itemId: '12345',
                name: 'prod1',
                quantity: '2',
                unitPrice: '456'
            }
        };
        const body = {
            transactionRequest: {
                transactionType: 'authCaptureTransaction',
                amount: '1',
                payment: {
                opaqueData: {
                    dataDescriptor: 'COMMON.APPLE.INAPP.PAYMENT',
                    dataValue: event.token.paymentData.data,
                    // "1234567890ABCDEF1111AAAA2222BBBB3333CCCC4444DDDD5555EEEE6666FFFF7777888899990",
                },
                },
                lineItems,
            },
        };

        const {
            data: { transactionResponse, messages },
        } = await axios.post(`${NGROK_HTTPS_HOST}/authorizeNetApi`, body);

        let result = '';
        if (messages.resultCode && messages.resultCode === 'Ok') {
            result = {
                status: ApplePaySession.STATUS_SUCCESS,
            };
            document.getElementById('success').style.display = 'block';
        } else {
            console.log('error transactionResponse:', transactionResponse);
            console.log('error messages:', messages);
            result = {
                status: ApplePaySession.STATUS_FAILURE,
            };
        }
        applePaySession.completePayment(result);
    };

    // Payment cancelled by WebKit
    applePaySession.oncancel = (event) => {
        console.log('oncancel:', event);
    };

    applePaySession.begin();
});
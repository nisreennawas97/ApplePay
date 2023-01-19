var MERCHANT_IDENTIFIER = 'merchant.apple.itg.test';
const NGROK_HTTPS_HOST = 'https://4716-188-161-238-9.ngrok.io';

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

    
    //Handel the apple pay button click
    appleButton.addEventListener('click', function() {
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
                amount: '10',
                type: 'final'
            }
        };

        console.log('Apple Pay request:', request);

        const applePaySession = new ApplePaySession(3, request);
        console.log('Apple Pay Session:', applePaySession);

        applePaySession.begin();

        //This is the first event that apple triggers. Here you need to validate the
        //Apple pay session from Backend
        applePaySession.onvalidatemerchant = ({ validationURL }) => {
            console.log('onvalidatemerchant:', validationURL);
            fetch(`${NGROK_HTTPS_HOST}/merchant-session/new/?validationURL=` + validationURL)
            .then(res => res.json())
            .then(data => {
                console.log(
                    'onvalidatemerchant (checkout) merchantSession:',
                    data
                );
                applePaySession.completeMerchantValidation(data);
            });
        };

        // Define ApplePayPaymentMethodUpdate based on the selected payment method.
        // No updates or errors are needed, pass an empty object.
        // applePaySession.onpaymentmethodselected = (event) => {
        //     console.log('onpaymentmethodselected:', event);
        //     const update = {};
        //     applePaySession.completePaymentMethodSelection(update);
        // };

        // Define ApplePayShippingMethodUpdate based on the selected shipping method.
        // No updates or errors are needed, pass an empty object.
        // applePaySession.onshippingmethodselected = (event) => {
        //     console.log('onshippingmethodselected:', event);
        //     const update = {};
        //     applePaySession.completeShippingMethodSelection(update);
        // };

        // Define ApplePayShippingContactUpdate based on the selected shipping contact.
        // applePaySession.onshippingcontactselected = (event) => {
        //     console.log('onshippingcontactselected:', event);
        //     const update = {};
        //     applePaySession.completeShippingContactSelection(update);
        // };

        //This triggers after the user  has confirmed the transaction with the Touch ID or Face
        //This will contain the payment token
        applePaySession.onpaymentauthorized = async (event) => {
            console.log('onpaymentauthorized event:', event);
            const paymentData = JSON.stringify(event.payment.token.paymentData);
            const base64Token = window.btoa(paymentData);
            console.log('token value', base64Token);

            const lineItems = {
                lineItem: {
                    itemId: '12345',
                    name: 'prod1',
                    quantity: '2',
                    unitPrice: '10'
                }
            };
            const body = {
                transactionRequest: {
                    transactionType: 'authCaptureTransaction',
                    amount: '10',
                    payment: {
                        opaqueData: {
                            dataDescriptor: 'COMMON.APPLE.INAPP.PAYMENT',
                            dataValue: base64Token,
                        },
                    },
                    lineItems,
                },
            };

            fetch(`${NGROK_HTTPS_HOST}/call-payment-provider/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(data => {
                console.log('Authorize net response', data);
                let result = '';
                if (data.messages.resultCode && data.messages.resultCode === 'Ok') {
                    result = {
                        status: ApplePaySession.STATUS_SUCCESS,
                    };
                    document.getElementById('success').style.display = 'block';
                } else {
                    console.log('error transactionResponse:', data.transactionResponse);
                    console.log('error messages:', data.messages);
                    result = {
                        status: ApplePaySession.STATUS_FAILURE,
                    };
                }
                applePaySession.completePayment(result);;
            });
        };

        // Payment cancelled by WebKit
        applePaySession.oncancel = (event) => {
            console.log('oncancel:', event);
        };

    });
}, false);
require('dotenv').config();
const MySecretKey = process.env.MY_SECRET_KEY;

const paystack = (request) => {
    const initializePayment = (form, mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/initialize',
            headers : {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           },
           form
        }
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        }
        request.post(option, callback);
    }

    const verifyPayment = (ref, mycallback) => {
        const options = {
            url: `https://api.paystack.co/transaction/verify/${ref}`,
            method: 'GET',
            headers: {
                Authorization: MySecretKey,
            }
        };

        const callback = (error, response, body) => {
            return mycallback(error, body);
        };

        request(options, callback);
    };


    return {initializePayment, verifyPayment};
}
module.exports = paystack
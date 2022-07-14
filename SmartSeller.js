/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  * 
  */

var nodemailer = require('nodemailer');

let smtpConfig = {
    host: 'smtp-mail.outlook.com', // you can also use smtp.mail.yahoo.com
    port: 587,
    secure: false, // use TLS
    auth: {
        user: 'elacy@synopsis.onmicrosoft.com', 
        pass: 'Synopsis2022'
    }
};

const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
/*
const async = require('async');

const {CloudantV1} = require('@ibm-cloudant/cloudant');
const cloudant = new CloudantV1({ url: 'https://467a74b4-9a5e-4e65-9239-237e788634a1-bluemix.cloudantnosqldb.appdomain.cloud', plugins: { iamauth: { iamApiKey: 'VCln48n44MuNPZkEirGORQT6ytCSVmNH65wqUw96dFJ9' } } });

const db = cloudant.db.use('my-first-db');
*/

function main(params) {
    if(params.choice == 1) {
        return new Promise(function (resolve, reject) {
            let response = {
                code: 200,
                msg: 'E-mail was sent successfully!'
            };
    
            if (!params.reminder) {
                response.msg = "Error: Reminder was not provided.";
                response.code = 400;
            }
            else if (!params.email) {
                response.msg = "Error: Destination e-mail was not provided.";
                response.code = 400;
            }
            else if (!params.conversation_id) {
                response.msg = "Error: Conversation id was not provided.";
                response.code = 400;
            }
    
            if (response.code != 200) {
                reject(response);
            }
    
            console.log(`Validation was successful, preparing to send email...`);
    
            sendEmail(params, function (email_response) {
                response.msg = email_response['msg'];
                response.code = email_response['code'];
                response.reason = email_response['reason'];
                console.log(`Email delivery response: (${email_response['code']}) ${response.msg}`);
                resolve(response);
            });
    
        });
    }
    if(params.choice == 2) {
        console.log("Test");
        return makeTicket(params);
    }
    /*
    if(params.choice == 3) {
        return verifyTicket(params);
    }*/
    
}
/*
async function verifyTicket(params) {
    // ticketNumber is only required to verify ticket
    let verifyTicketNumber = params.verifyTicketNumber; 
    console.log('Verifying ' + verifyTicketNumber);
                
    // fetch a document by its id
    let ticketVerification = await db.get(`Ticket: ${verifyTicketNumber}`);
    let ticketVerificationJSONstringify = JSON.stringify(ticketVerification, null, 2);
    console.log('The following information about the ticket is available: ' + ticketVerificationJSONstringify);
                
    // return message with returnString
    returnString = `Thank you for your inquiry! Your ticket contains the following information:\n ` + ticketVerificationJSONstringify;
    return { message: returnString };
}
*/

function sendEmail(params, callback) {

    let transporter = nodemailer.createTransport(smtpConfig);

    let mailOptions = {
        from: `Your Reminder Buddy <${smtpConfig.auth.user}>`,
        to: params.email,
        subject: `REMINDER:`,
        text: `Here is your reminder: \n\n${params.reminder}`
    };
    transporter.sendMail(mailOptions, function (error, info) {

        let email_response = {
            code: 200,
            msg: 'Email was sent successfully',
            reason: 'Success'
        };

        if (error) {
            email_response.msg = 'Error';
            email_response.code = 510;
            email_response.reason = error;
        }
        else {
            email_response.msg = info.response;
            email_response.code = 200;
            email_response.reason = info.response;
        }
        callback(email_response);
    });
}

function makeTicket(params) {
    const authenticator = new IamAuthenticator({
        apikey: 'VCln48n44MuNPZkEirGORQT6ytCSVmNH65wqUw96dFJ9'
    });
    const service = new CloudantV1({
       authenticator: authenticator 
    });
    
    service.setServiceUrl('https://467a74b4-9a5e-4e65-9239-237e788634a1-bluemix.cloudantnosqldb.appdomain.cloud');
    
    var productsDoc = {
        "Name": params.name,
        "Email": params.email,
        "Topic": params.topic,
        "Ticket": params.ticket
    }
    
    return service.postDocument({
        db: 'my-first-db',
        document: productsDoc
    })
    
}

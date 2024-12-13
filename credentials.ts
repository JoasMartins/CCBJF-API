import env from 'dotenv'
require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.local' });

export default {
    // PRODUÇÃO = false
    // HOMOLOGAÇÃO = true
    sandbox: process.env.PIX_SANDBOX === 'true' ? true : false,
    client_id: process.env.PIX_CLIENT_ID,
    client_secret: process.env.PIX_CLIENT_SECRET,
    pix_cert: `${__dirname}/certificates/${process.env.PIX_CERTIFICATE}`,
    pix_certificate: `${__dirname}/certificates/${process.env.PIX_CERTIFICATE}`,
}
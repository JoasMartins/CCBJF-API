require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.local' });

export default {
    sandbox: process.env.PIX_SANDBOX === 'true' ? true : false,
    client_id: process.env.PIX_CLIENT_ID,
    client_secret: process.env.PIX_CLIENT_SECRET,
    certificate: `${__dirname}/certificates/${process.env.PIX_CERTIFICATE}`,
    pix_cert: `${__dirname}/certificates/${process.env.PIX_CERTIFICATE}`,
}
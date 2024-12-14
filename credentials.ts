require('dotenv').config({ path: '.env'});

export default {
    sandbox: process.env.NODE_ENV === 'prod'?  false : true,
    client_id: process.env.NODE_ENV === 'prod' ? process.env.PROD_PIX_CLIENT_ID : process.env.HOMO_PIX_CLIENT_ID,
    client_secret: process.env.NODE_ENV === 'prod' ? process.env.PROD_PIX_CLIENT_SECRET : process.env.HOMO_PIX_CLIENT_SECRET,
    certificate: process.env.NODE_ENV === 'prod' ? `${__dirname}/certificates/${process.env.PROD_PIX_CERTIFICATE}` : `${__dirname}/certificates/${process.env.HOMO_PIX_CERTIFICATE}`,
    //pix_cert: `${__dirname}/certificates/${process.env.PIX_CERTIFICATE}`,
}
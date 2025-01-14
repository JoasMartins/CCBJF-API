require('dotenv').config({ path: '.env'});

const tests = process.env.NODE_ENV === 'prod'?  false : true;

export default {
    ambientTests: tests,
    dbUri: process.env.DB_URI,
    passwords: {
        adm: process.env.PASSWORD_ADM,
        cob: process.env.PASSWORD_COB
    },
}

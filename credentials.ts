require('dotenv').config({ path: '.env'});

const tests = process.env.NODE_ENV === 'prod'?  false : true;

export default {
    ambientTests: tests,
    dbUri: process.env.DB_URI,
    
}
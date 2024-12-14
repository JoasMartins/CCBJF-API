import { app } from "./app";

import options from "../credentials"

console.log(options)

//require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.local' });

function ConfigEnv() {
    if(process.env.NODE_ENV === 'prod') {
        
    }
}

app.listen(4000, async () => {
    console.log("Servidor ligado! Ambiente: " + process.env.NODE_ENV)
})

import { app } from "./app";

import options from "../credentials"
import { connectToDatabase } from "./configs/DatabaseConfig"

console.log(options)

//require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.local' });

app.listen(4000, async () => {
    console.log("Servidor ligado! Ambiente: " + process.env.NODE_ENV)
/*
    const db = await connectToDatabase()
    const collection = db.collection("test")

    const result = await collection.insertOne({
        payment: "testado"
    })
    */
})

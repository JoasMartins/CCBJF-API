import { app, server } from "./app";

import options from "../credentials"
import { connectToDatabase } from "./configs/DatabaseConfig"

console.log(options)

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

//require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.local' });

/*
app.listen(4000, async () => {
    console.log("Servidor ligado! Ambiente: " + process.env.NODE_ENV)
})
*/
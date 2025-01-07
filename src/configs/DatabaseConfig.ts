import { MongoClient, Db } from 'mongodb';
import credentials from "../../credentials"
require('dotenv').config({ path: '.env'});


let db: Db;

export const connectToDatabase = async () => {
  if (db) return db;

  const client = new MongoClient(credentials.dbUri+"?retryWrites=true&w=majority");

  try {
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    db = client.db(credentials.ambientTests ? "Testes" : "Produção");
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

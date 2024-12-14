import { MongoClient, Db } from 'mongodb';

let db: Db;

export const connectToDatabase = async () => {
  if (db) return db;

  const client = new MongoClient(process.env.DB_URI);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    db = client.db("JF");
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

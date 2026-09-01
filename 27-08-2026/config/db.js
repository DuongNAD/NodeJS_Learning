const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (!client) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    client = new MongoClient(process.env.MONGODB_URI);
  }
  await client.connect();
  db = client.db(process.env.DATABASE_NAME || "aptech_library");
  console.log(`Connected to MongoDB: ${process.env.DATABASE_NAME || "aptech_library"}`);
}

function getDB() {
  if (!db) {
    throw new Error("Database has not been connected");
  }

  return db;
}

module.exports = {
  connectDB,
  getDB,
};

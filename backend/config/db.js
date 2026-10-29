import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;
let db;

async function connectDB() {
    const uri = process.env.MONGO_URI;

    client = new MongoClient(uri);
    await client.connect();

    db = client.db("imy220");

    const users = db.collection("users");

    await users.createIndex(
        { username: 1 },
        { unique: true }
    );

    await users.createIndex(
        { email: 1 },
        { unique: true }
    );

    console.log("Connected to MongoDB");
}

function getDB() {
    return db;
}

// NEW: Return the MongoDB client
function getClient() {
    return client;
}

export { connectDB, getDB, getClient };
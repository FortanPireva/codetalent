import mongoose from "mongoose";

const globalForMongo = globalThis as unknown as {
  mongoConn: Promise<typeof mongoose> | undefined;
};

export async function connectMongo() {
  if (globalForMongo.mongoConn) {
    return globalForMongo.mongoConn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const conn = mongoose.connect(uri, { bufferCommands: false });

  if (process.env.NODE_ENV !== "production") {
    globalForMongo.mongoConn = conn;
  }

  return conn;
}

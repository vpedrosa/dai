// ./model/db.js
import mongoose from "mongoose";

const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
const MONGO_HOST = process.env.MONGO_HOST || 'localhost'

const connectDB = async () => {
  try {
    const uri = `mongodb://${USER_DB}:${PASS}@${MONGO_HOST}:27017/tienda?authSource=admin`;

    await mongoose.connect(uri);

    console.log('✓ Conectado a MongoDB');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectDB;

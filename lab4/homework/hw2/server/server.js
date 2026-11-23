import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import Profile from './models/Profile.js';
import Swipe from './models/Swipe.js';

// 1. Environment Variable Security Guard
// Không hard-code connection string trong code; thiếu biến môi trường thì dừng ngay.
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');

// 2. Modern Connection Syntax (Zero Deprecated Flags in Mongoose 8)
// Không còn useNewUrlParser / useUnifiedTopology — Mongoose 8 đã bỏ hai cờ này.
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Đã kết nối MongoDB');

const app = express();
app.use(express.json());

// 3. Async/Await GET Endpoint (Optimized read via .lean())
// .lean() trả về plain object thay vì Mongoose Document => nhanh và nhẹ hơn khi chỉ đọc.
app.get('/api/profiles', async (req, res) => {
  const profiles = await Profile.find().lean();
  res.json(profiles);
});

// 4. Async/Await POST Endpoint with Try/Catch Block
// Sai dữ liệu (thiếu profileId, type không hợp lệ...) => Mongoose ValidationError => 400.
app.post('/api/swipe', async (req, res) => {
  try {
    const record = await Swipe.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

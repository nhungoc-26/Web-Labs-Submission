// Nạp dữ liệu mẫu vào MongoDB: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import Profile from './models/Profile.js';
import Swipe from './models/Swipe.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');

const profiles = [
  { name: 'Minh Anh', age: 22, emoji: '☕', colors: ['#f6a5c0', '#f9d29d'], bio: 'Tìm người đi cà phê, không tìm người yêu. Bill chia đôi.', tags: ['Cà phê', 'Độc thân vui vẻ'] },
  { name: 'Quốc Bảo', age: 24, emoji: '🎮', colors: ['#7f9cf5', '#a3e4f7'], bio: 'Rank Kim Cương, cần đồng đội chứ không cần đồng hành.', tags: ['Game', 'Thức khuya'] },
  { name: 'Thảo Vy', age: 21, emoji: '📚', colors: ['#b5e48c', '#52b69a'], bio: 'Cần bạn học nhóm mùa thi. Hết thi là hết duyên.', tags: ['Thư viện', 'Deadline'] },
  { name: 'Hoàng Nam', age: 25, emoji: '🏃', colors: ['#ffb4a2', '#e5989b'], bio: 'Chạy bộ 5h sáng. Ai dậy nổi thì match.', tags: ['Thể thao', 'Dậy sớm'] },
  { name: 'Khánh Linh', age: 23, emoji: '🍜', colors: ['#ffd166', '#ef476f'], bio: 'Review quán ăn dạo. Cần người ăn giùm phần dư.', tags: ['Ăn uống', 'Food tour'] },
  { name: 'Đức Huy', age: 26, emoji: '🎸', colors: ['#cdb4db', '#a2d2ff'], bio: 'Biết 4 hợp âm, hát 100 bài. Không hát tình ca.', tags: ['Âm nhạc', 'Acoustic'] },
  { name: 'Ngọc Hân', age: 22, emoji: '🐱', colors: ['#ffc8dd', '#bde0fe'], bio: 'Có 3 con mèo. Mèo được ưu tiên hơn bạn.', tags: ['Thú cưng', 'Ở nhà'] },
  { name: 'Tuấn Kiệt', age: 24, emoji: '💻', colors: ['#90e0ef', '#0077b6'], bio: 'Dev fullstack. Chỉ commit code, không commit tình cảm.', tags: ['Code', 'Cà phê'] },
];

await mongoose.connect(process.env.MONGODB_URI);
await Swipe.deleteMany({});
await Profile.deleteMany({});
const inserted = await Profile.insertMany(profiles);
console.log(`🌱 Đã nạp ${inserted.length} hồ sơ mẫu`);
await mongoose.disconnect();

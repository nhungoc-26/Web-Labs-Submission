import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    bio: { type: String, default: '' },
    emoji: { type: String, default: '🙂' },
    colors: { type: [String], default: ['#ff8a8a', '#ffb36b'] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);

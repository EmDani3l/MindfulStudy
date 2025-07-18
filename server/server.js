import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }).exec();
  if (user) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await User.create({ username, password });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
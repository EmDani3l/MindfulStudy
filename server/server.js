import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  googleId: String,
  email: { type: String, unique: true },
  name: String,
  password: String,
  preferences: Object,
  createdAt: { type: Date, default: Date.now },
  schedules: Array,
  moods: Array
});

const User = mongoose.model('User', userSchema);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

app.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, name },
      { upsert: true, new: true }
    );
    res.json({ token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.post('/auth/email', async (req, res) => {
  const { email, password, name, register } = req.body;
  try {
    let user = await User.findOne({ email });
    if (register && !user) {
      const hash = await bcrypt.hash(password, 10);
      user = await User.create({ email, password: hash, name });
    } else if (!user) {
      return res.status(400).json({ error: 'User not found' });
    } else {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({ token: signToken(user) });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Auth failed' });
  }
});

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  res.json({ email: user.email, name: user.name, createdAt: user.createdAt });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
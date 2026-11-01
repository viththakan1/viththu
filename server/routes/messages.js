import express from 'express';
import { Message } from '../models/Message.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `msg-${Date.now()}`;
    if (!data.date) data.date = new Date().toISOString().split('T')[0];
    delete data._id;

    const message = await Message.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Customer inquiry from "${message.name}" saved to MongoDB Atlas!`);
    res.status(201).json(message);
  } catch (err) {
    console.error('❌ Error saving message:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { id: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    console.log(`✅ Message ${message.id} marked as read in MongoDB Atlas!`);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const msg = await Message.findOneAndDelete({ id: req.params.id });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    console.log(`✅ Message ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Message deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Todo = require('../models/TodoSchema');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  cachedDb = connection;
  console.log('✅ Connected to MongoDB for TodoList');
  return connection;
}


app.post('/api/addTodo', async (req, res) => {
  try {
    await connectToDatabase();
    const { task } = req.body;
    const todo = new Todo({ task });
    await todo.save();
    res.status(201).json({ message: 'Todo berhasil ditambahkan', data: todo });
  } catch (err) {
    res.status(400).json({ error: 'Gagal menambahkan todo', details: err.message });
  }
});

app.get('/api/todos', async (req, res) => {
  try {
    await connectToDatabase();
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil daftar todo', details: err.message });
  }
});

app.get('/api/todos/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo tidak ditemukan' });
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil todo', details: err.message });
  }
});

app.delete('/api/deleteTodo/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo tidak ditemukan' });
    res.status(200).json({ message: 'Todo berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus todo', details: err.message });
  }
});


app.put('/api/updateTodo/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { task, completed } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { task, completed },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: 'Todo tidak ditemukan' });
    res.status(200).json({ message: 'Todo berhasil diperbarui', data: todo });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui todo', details: err.message });
  }
});


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server started at port: ${PORT}`));
}


module.exports = app;
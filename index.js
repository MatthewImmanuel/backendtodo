require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const serverless = require('serverless-http')
const Todo = require('./models/TodoSchema')

const app = express()
app.use(cors({ origin: 'https://frontendtodo-xi.vercel.app' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('✅ Backend is running'))

app.post('/addTodo', async (req, res) => {
  const { task } = req.body
  const todo = new Todo({ task })
  try {
    await todo.save()
    res.status(201).json({ message: 'Todo berhasil ditambahkan', data: todo })
  } catch (err) {
    res.status(400).json({ error: 'Gagal menambahkan todo', details: err })
  }
})

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 })
    res.status(200).json(todos)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil daftar todo' })
  }
})

app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Todo tidak ditemukan' })
    res.status(200).json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil todo' })
  }
})

app.delete('/deleteTodo/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Todo tidak ditemukan' })
    res.status(200).json({ message: 'Todo berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus todo', details: err })
  }
})

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

module.exports = app
module.exports.handler = serverless(app)

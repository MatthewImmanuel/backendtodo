const mongoose = require('mongoose');
 
 const TodoSchema = new mongoose.Schema({
   task: {
     type: String,
     required: [true, 'Task is required']
   },
   createdAt: {
     type: Date,
     default: Date.now
   }
 });
 
 module.exports = mongoose.model('Todo', TodoSchema);
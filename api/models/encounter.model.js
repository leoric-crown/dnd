const mongoose = require('mongoose')

const encounterSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true },
  status: {type: String, default: 'Preparing', required: true }
})

module.exports = mongoose.model('Encounter', encounterSchema)
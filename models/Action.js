const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  trx_id: { type: String, unique: true },
  block_time: String,
  block_num: Number
});

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;
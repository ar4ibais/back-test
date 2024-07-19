const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');
const Action = require('./models/Action');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/eos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Function to fetch and store actions
const fetchAndStoreActions = async () => {
  try {
    const response = await axios.post('https://eos.greymass.com/v1/history/get_actions', {
      account_name: 'eosio',
      pos: -1,
      offset: -100,
    });

    const actions = response.data.actions;

    for (const action of actions) {
      const { trx_id, block_time, block_num } = action.action_trace;
      const newAction = new Action({ trx_id, block_time, block_num });

      try {
        await newAction.save();
        console.log(`Action ${trx_id} saved`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Action ${trx_id} already exists`);
        } else {
          console.error('Error saving action:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching actions:', error);
  }
};

// Schedule the fetchAndStoreActions function to run every minute
cron.schedule('* * * * *', fetchAndStoreActions);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

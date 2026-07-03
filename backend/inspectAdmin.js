require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const admin = await User.findOne({ email: 'admin@portal.com' }).select('+password');
    const allUsers = await User.find().select('+password');
    console.log('All users:', allUsers);
    console.log('Admin user document:', admin);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();

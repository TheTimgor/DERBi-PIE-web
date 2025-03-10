require('dotenv').config();
const {connect} = require('../mongooseConnection')
const mongoose = require('mongoose');
const User = require('../models/user');
const readline = require('readline-sync');

async function createAdmin() {
  try {
    connect()

    const adminUser = new User({
      username: 'admin',
      password: readline.question("Enter Admin Password: "),
      inviteCode: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
}

createAdmin();
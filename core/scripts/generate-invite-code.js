require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const InviteCode = require('../models/inviteCode');
const {connect} = require('../mongooseConnection')

async function generateInviteCode(adminId = null) {
  try {
    connect()

    // Generate a random 8-character code
    const code = crypto.randomBytes(4).toString('hex');

    const inviteCode = new InviteCode({
      code: code,
      createdBy: adminId
    });

    await inviteCode.save();
    console.log(`Invite code created: ${code}`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating invite code:', error);
    mongoose.connection.close();
  }
}

// Generate 5 invite codes
async function generateMultipleCodes(count = 1) {
  for (let i = 0; i < count; i++) {
    await generateInviteCode();
  }
}

generateMultipleCodes();
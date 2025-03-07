const express = require('express');
const crypto = require('crypto');
const InviteCode = require('../models/inviteCode');
const User = require('../models/user');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.username === 'admin') {
    return next();
  }
  res.redirect('/login');
};

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
  try {
    const inviteCodes = await InviteCode.find().sort({ createdAt: -1 });

    // Get usernames for used codes
    const usedCodes = await Promise.all(
      inviteCodes
        .filter(code => code.usedBy)
        .map(async code => {
          const user = await User.findById(code.usedBy);
          return {
            ...code.toObject(),
            usedByUsername: user ? user.username : 'Unknown'
          };
        })
    );

    // Combine unused and used codes
    const allCodes = [
      ...inviteCodes.filter(code => !code.usedBy),
      ...usedCodes,
      {
        code: 'admin',
        isUsed: true,
        createdAt: new Date(), // or some specific date
        usedByUsername: 'System'
      }
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render('admin', {
      title: 'Admin Dashboard',
      inviteCodes: allCodes
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.render('admin', {
      title: 'Admin Dashboard',
      error: 'Error loading invite codes',
      inviteCodes: []
    });
  }
});

// Generate new invite code
router.post('/generate-code', isAdmin, async (req, res) => {
  try {
    const code = crypto.randomBytes(4).toString('hex');

    const inviteCode = new InviteCode({
      code: code,
      createdBy: req.user._id
    });

    await inviteCode.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.redirect('/admin');
  }
});

module.exports = router;
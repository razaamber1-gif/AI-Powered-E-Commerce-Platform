const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update profile.
 *          Per project requirement: NAME CANNOT BE CHANGED.
 *          Allowed fields: email, mobile, password.
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { email, mobile, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Email update
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Mobile update
    if (mobile) {
      user.mobile = mobile;
    }

    // Password update — require current password for security
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password required to change password',
        });
      }
      const valid = await user.comparePassword(currentPassword);
      if (!valid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = password; // pre-save hook will hash it
    }

    // Explicitly ignore name updates even if sent — name is immutable.
    // (We do not throw here to keep the API forgiving; we just don't apply it.)

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
};

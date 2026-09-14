const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register / Create new user
// @route   POST /api/users (or /api/users/register)
// @access  Public
exports.createUser = async (req, res) => {
  const { name, email, password, role, workspaceName } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Auto-create or associate workspace
    let userWorkspace = null;
    try {
      userWorkspace = await Workspace.create({
        name: workspaceName || `${name.trim()}'s Workspace`,
        description: `Default workspace for ${name.trim()}`,
      });
    } catch (wsErr) {
      console.warn('[User Controller] Could not create auto-workspace:', wsErr.message);
    }

    // Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      workspace: userWorkspace ? userWorkspace._id : undefined,
    });

    if (userWorkspace) {
      userWorkspace.owner = user._id;
      await userWorkspace.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Populate workspace name for response
    await user.populate('workspace', 'name');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[User Controller] Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating user',
      error: error.message,
    });
  }
};

// @desc    Authenticate / Login user & return token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Populate workspace
    await user.populate('workspace', 'name');

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[User Controller] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Logout user / clear session
// @route   POST /api/users/logout
// @access  Public / Private
exports.logoutUser = async (req, res) => {
  try {
    // For JWT stateless authentication, the client discards the token.
    // We provide a consistent API endpoint for clean client logout handling.
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[User Controller] Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private (Requires JWT)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('workspace', 'name');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[User Controller] Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message,
    });
  }
};
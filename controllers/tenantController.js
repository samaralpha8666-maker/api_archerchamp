const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654';

// ─── Tenant User Signup ──────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }

    // Check if user already exists in this tenant schema
    const existing = await req.tenantModels.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered under this tenant.' });
    }

    // Create user inside tenant schema
    const user = await req.tenantModels.User.create({
      name,
      email,
      password,
      role: role || 'member'
    });

    res.status(201).json({
      success: true,
      message: 'User registration successful.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Tenant user signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Tenant User Login ───────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await req.tenantModels.User.findOne({ where: { email } });
    if (!user || !user.is_active || !(await user.validatePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Sign JWT token with tenant boundary context
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, tenantId: req.tenant.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Tenant user login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Tenant Documents CRUD (Data Isolation Demonstration) ────────────────────
exports.createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Document title is required.' });
    }

    const document = await req.tenantModels.Document.create({
      title,
      content,
      created_by_id: req.user.id
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    // Only return documents created inside this tenant context
    const documents = await req.tenantModels.Document.findAll({
      include: [{ model: req.tenantModels.User, as: 'creator', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Update Tenant Profile/Password ─────────────────────────────────────────
exports.updateTenantProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) {
      const existing = await req.tenantModels.User.findOne({
        where: {
          email,
          id: { [req.tenantDb.Sequelize.Op.ne]: user.id }
        }
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email is already in use in this company.' });
      }
      user.email = email;
    }
    if (password) {
      user.password = password;
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};



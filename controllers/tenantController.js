const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654';

const ALL_MODULES = [
  'dashboard',
  'brands',
  'oif',
  'electronics',
  'qc',
  'calibration',
  'amc',
  'purchase',
  'store',
  'users'
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: ALL_MODULES,
  manager: ['dashboard', 'qc', 'calibration', 'amc', 'purchase', 'store'],
  rnd: ['dashboard', 'qc', 'calibration', 'electronics'],
  service: ['dashboard', 'amc', 'calibration'],
  accounts: ['dashboard', 'purchase'],
  store: ['dashboard', 'store'],
  custom: ['dashboard']
};

function getPermissionsForRole(role, customPermissions) {
  if (role === 'admin') return ALL_MODULES;
  if (customPermissions && Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions;
  }
  return DEFAULT_ROLE_PERMISSIONS[role] || ALL_MODULES;
}

// ─── Tenant User Signup ──────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, department, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }

    // Check if user already exists in this tenant schema
    const existing = await req.tenantModels.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered under this tenant.' });
    }

    const assignedRole = role || 'admin';
    const assignedPermissions = getPermissionsForRole(assignedRole, permissions);

    // Create user inside tenant schema
    const user = await req.tenantModels.User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Administration',
      permissions: assignedPermissions
    });

    res.status(201).json({
      success: true,
      message: 'User registration successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: assignedPermissions
      }
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

    const assignedPermissions = getPermissionsForRole(user.role, user.permissions);

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Administration',
        permissions: assignedPermissions
      }
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
    const assignedPermissions = getPermissionsForRole(user.role, user.permissions);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Administration',
        permissions: assignedPermissions
      }
    });
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Tenant User Management CRUD ─────────────────────────────────────────────

exports.listUsers = async (req, res) => {
  try {
    const rawUsers = await req.tenantModels.User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });

    const users = rawUsers.map((u) => {
      const userObj = u.toJSON();
      userObj.permissions = getPermissionsForRole(userObj.role, userObj.permissions);
      if (!userObj.department) userObj.department = 'Administration';
      return userObj;
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }

    const existing = await req.tenantModels.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already in use under this tenant.' });
    }

    const assignedRole = role || 'admin';
    const assignedPermissions = getPermissionsForRole(assignedRole, permissions);

    const newUser = await req.tenantModels.User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Administration',
      permissions: assignedPermissions
    });

    const userObj = newUser.toJSON();
    delete userObj.password;
    userObj.permissions = assignedPermissions;

    res.status(201).json({ success: true, message: 'User created successfully.', user: userObj });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, department, permissions, is_active } = req.body;

    const user = await req.tenantModels.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const existing = await req.tenantModels.User.findOne({
        where: {
          email,
          id: { [req.tenantDb.Sequelize.Op.ne]: id }
        }
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email is already in use by another user.' });
      }
      user.email = email;
    }

    if (password && password.trim() !== '') {
      user.password = password;
    }

    if (role) {
      user.role = role;
    }
    if (department) {
      user.department = department;
    }
    if (permissions) {
      user.permissions = getPermissionsForRole(user.role, permissions);
    } else if (role) {
      user.permissions = getPermissionsForRole(role, user.permissions);
    }

    if (typeof is_active === 'boolean') {
      user.is_active = is_active;
    }

    await user.save();

    const userObj = user.toJSON();
    delete userObj.password;
    userObj.permissions = getPermissionsForRole(userObj.role, userObj.permissions);

    res.status(200).json({ success: true, message: 'User updated successfully.', user: userObj });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own active account.' });
    }

    const user = await req.tenantModels.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ==================== PURCHASE REQUISITIONS (PR) ====================
exports.getPurchaseRequisitions = async (req, res) => {
  try {
    const { branch } = req.query;
    const whereClause = branch ? { branch } : {};
    const requisitions = await req.tenantModels.PurchaseRequisition.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, requisitions });
  } catch (error) {
    console.error('Get Purchase Requisitions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.createPurchaseRequisition = async (req, res) => {
  try {
    const { prNo, date, department, fulfillmentDate, preferredVendor, branch, status, items, notes, requisitionBy, approvedBy } = req.body;
    
    let generatedPrNo = prNo;
    if (!generatedPrNo) {
      const count = await req.tenantModels.PurchaseRequisition.count();
      generatedPrNo = `PR-${String(count + 1).padStart(3, '0')}`;
    }

    const pr = await req.tenantModels.PurchaseRequisition.create({
      prNo: generatedPrNo,
      date: date || new Date().toISOString().split('T')[0],
      department,
      fulfillmentDate,
      preferredVendor,
      branch: branch || 'Vasai Factory (HQ)',
      status: status || 'pending',
      items: items || [],
      notes,
      requisitionBy,
      approvedBy
    });

    res.status(201).json({ success: true, requisition: pr });
  } catch (error) {
    console.error('Create Purchase Requisition error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.updatePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await req.tenantModels.PurchaseRequisition.findByPk(id);
    if (!pr) {
      return res.status(404).json({ success: false, error: 'Purchase requisition not found.' });
    }

    const { prNo, date, department, fulfillmentDate, preferredVendor, branch, status, items, notes, requisitionBy, approvedBy } = req.body;
    
    if (prNo) pr.prNo = prNo;
    if (date) pr.date = date;
    if (department !== undefined) pr.department = department;
    if (fulfillmentDate !== undefined) pr.fulfillmentDate = fulfillmentDate;
    if (preferredVendor !== undefined) pr.preferredVendor = preferredVendor;
    if (branch) pr.branch = branch;
    if (status) pr.status = status;
    if (items) pr.items = items;
    if (notes !== undefined) pr.notes = notes;
    if (requisitionBy !== undefined) pr.requisitionBy = requisitionBy;
    if (approvedBy !== undefined) pr.approvedBy = approvedBy;

    await pr.save();
    res.status(200).json({ success: true, requisition: pr });
  } catch (error) {
    console.error('Update Purchase Requisition error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

exports.deletePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await req.tenantModels.PurchaseRequisition.findByPk(id);
    if (!pr) {
      return res.status(404).json({ success: false, error: 'Purchase requisition not found.' });
    }

    await pr.destroy();
    res.status(200).json({ success: true, message: 'Purchase requisition deleted successfully.' });
  } catch (error) {
    console.error('Delete Purchase Requisition error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};




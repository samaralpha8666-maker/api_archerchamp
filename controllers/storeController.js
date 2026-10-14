const { Op } = require('sequelize');

const DEFAULT_SEEDS = [
  { itemName: 'Display Board', quantity: 50, toleranceLimit: 25, unit: 'Pcs', category: 'Electronics' },
  { itemName: 'Cutter', quantity: 10, toleranceLimit: 7, unit: 'Pcs', category: 'Tools' },
  { itemName: 'Key Board PCB', quantity: 100, toleranceLimit: 40, unit: 'Pcs', category: 'Electronics' },
  { itemName: 'Mother board PCB', quantity: 50, toleranceLimit: 10, unit: 'Pcs', category: 'Electronics' },
  { itemName: 'Sealing Tar', quantity: 350, toleranceLimit: 99, unit: 'Kg', category: 'Consumables' },
];

/**
 * Controller handling Store Inventory operations
 */

// List all store items
exports.list = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();
    if (StoreTransactionLog) await StoreTransactionLog.sync();

    // Check if table is empty, auto-seed defaults so user immediately sees screenshot data
    const count = await StoreItem.count();
    if (count === 0) {
      const activeBranch = req.query.branch || 'Vasai Factory (HQ)';
      for (const s of DEFAULT_SEEDS) {
        const item = await StoreItem.create({
          ...s,
          branch: activeBranch
        });
        if (StoreTransactionLog) {
          await StoreTransactionLog.create({
            itemId: item.id,
            itemName: item.itemName,
            type: 'INITIAL_ENTRY',
            qtyChange: item.quantity,
            finalQty: item.quantity,
            reason: 'System Seed Initial Stock',
            operatorName: 'System Admin',
            branch: activeBranch
          });
        }
      }
    }

    const { search, lowStock, branch, itemId } = req.query;
    const whereClause = {};

    if (itemId) {
      whereClause.id = itemId;
    }

    if (search && search.trim()) {
      whereClause.itemName = {
        [Op.iLike]: `%${search.trim()}%`
      };
    }

    if (branch && branch !== 'all') {
      whereClause.branch = branch;
    }

    let items = await StoreItem.findAll({
      where: whereClause,
      order: [['updated_at', 'DESC'], ['id', 'ASC']]
    });

    if (lowStock === 'true' || lowStock === true) {
      items = items.filter(i => Number(i.quantity) <= Number(i.toleranceLimit));
    }

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Store list error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch store inventory' });
  }
};

// Create a new store stock entry
exports.create = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();
    if (StoreTransactionLog) await StoreTransactionLog.sync();

    const { itemName, quantity, toleranceLimit, branch, unit, category, notes, location } = req.body;

    if (!itemName || !itemName.trim()) {
      return res.status(400).json({ success: false, error: 'Item Name is required' });
    }

    const parsedQty = Math.max(0, parseInt(quantity, 10) || 0);
    const parsedTolerance = Math.max(0, parseInt(toleranceLimit, 10) || 0);
    const targetBranch = branch || 'Vasai Factory (HQ)';
    const operator = req.user ? `${req.user.name || req.user.email}` : 'Store Manager';

    // Check if item with same name exists in same branch
    let item = await StoreItem.findOne({
      where: {
        itemName: itemName.trim(),
        branch: targetBranch
      }
    });

    if (item) {
      // Add quantity to existing item
      const prevQty = item.quantity;
      const newQty = prevQty + parsedQty;
      await item.update({
        quantity: newQty,
        toleranceLimit: parsedTolerance > 0 ? parsedTolerance : item.toleranceLimit,
        unit: unit || item.unit,
        category: category || item.category,
        notes: notes || item.notes
      });

      if (StoreTransactionLog) {
        await StoreTransactionLog.create({
          itemId: item.id,
          itemName: item.itemName,
          type: 'STOCK_IN',
          qtyChange: parsedQty,
          finalQty: newQty,
          reason: 'Added to existing stock',
          reference: req.body.reference || 'Manual Entry',
          operatorName: operator,
          branch: targetBranch
        });
      }

      return res.status(200).json({ success: true, item, message: 'Existing item stock increased' });
    }

    // Create fresh item
    item = await StoreItem.create({
      itemName: itemName.trim(),
      quantity: parsedQty,
      toleranceLimit: parsedTolerance,
      branch: targetBranch,
      unit: unit || 'Pcs',
      category: category || 'General',
      location: location || null,
      notes: notes || null
    });

    if (StoreTransactionLog) {
      await StoreTransactionLog.create({
        itemId: item.id,
        itemName: item.itemName,
        type: 'INITIAL_ENTRY',
        qtyChange: parsedQty,
        finalQty: parsedQty,
        reason: 'New Stock Entry',
        reference: req.body.reference || 'Initial Inward',
        operatorName: operator,
        branch: targetBranch
      });
    }

    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Store create error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create stock item' });
  }
};

// Bulk Import Store Items (from Excel or CSV)
exports.bulkImport = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();
    if (StoreTransactionLog) await StoreTransactionLog.sync();

    const { items, branch } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items array is required and cannot be empty' });
    }

    const targetBranch = branch || req.query.branch || 'Vasai Factory (HQ)';
    const operator = req.user ? `${req.user.name || req.user.email}` : 'Store Incharge (Excel Import)';

    let createdCount = 0;
    let updatedCount = 0;
    const processedItems = [];

    for (const rawItem of items) {
      const name = rawItem.itemName ? String(rawItem.itemName).trim() : '';
      if (!name) continue;

      const qty = Math.max(0, parseInt(rawItem.quantity, 10) || 0);
      const tolerance = Math.max(0, parseInt(rawItem.toleranceLimit, 10) || 0);
      const unit = rawItem.unit ? String(rawItem.unit).trim() : 'Pcs';
      const category = rawItem.category ? String(rawItem.category).trim() : 'General Store';
      const notes = rawItem.notes ? String(rawItem.notes).trim() : null;

      // Check if item already exists in this branch
      let item = await StoreItem.findOne({
        where: {
          itemName: name,
          branch: targetBranch
        }
      });

      if (item) {
        const prevQty = Number(item.quantity) || 0;
        const newQty = prevQty + qty;
        await item.update({
          quantity: newQty,
          toleranceLimit: tolerance > 0 ? tolerance : item.toleranceLimit,
          unit: unit || item.unit,
          category: category || item.category,
          notes: notes || item.notes
        });

        if (StoreTransactionLog && qty > 0) {
          await StoreTransactionLog.create({
            itemId: item.id,
            itemName: item.itemName,
            type: 'STOCK_IN',
            qtyChange: qty,
            finalQty: newQty,
            reason: 'Excel Bulk Import Inward',
            reference: rawItem.reference || 'EXCEL-IMPORT',
            operatorName: operator,
            branch: targetBranch
          });
        }
        updatedCount++;
        processedItems.push(item);
      } else {
        item = await StoreItem.create({
          itemName: name,
          quantity: qty,
          toleranceLimit: tolerance,
          unit: unit || 'Pcs',
          category: category || 'General Store',
          branch: targetBranch,
          notes: notes || null
        });

        if (StoreTransactionLog) {
          await StoreTransactionLog.create({
            itemId: item.id,
            itemName: item.itemName,
            type: 'INITIAL_ENTRY',
            qtyChange: qty,
            finalQty: qty,
            reason: 'Excel Bulk Import Initial Stock',
            reference: rawItem.reference || 'EXCEL-IMPORT',
            operatorName: operator,
            branch: targetBranch
          });
        }
        createdCount++;
        processedItems.push(item);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${processedItems.length} items (${createdCount} new, ${updatedCount} updated)`,
      createdCount,
      updatedCount,
      totalProcessed: processedItems.length,
      items: processedItems
    });
  } catch (error) {
    console.error('Store bulk import error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to process bulk import' });
  }
};


// Update item details or tolerance limit
exports.update = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();
    if (StoreTransactionLog) await StoreTransactionLog.sync();

    const { id } = req.params;
    const item = await StoreItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Stock item not found' });
    }

    const operator = req.user ? `${req.user.name || req.user.email}` : 'Store Manager';
    const oldQty = item.quantity;
    const newQty = req.body.quantity !== undefined ? Math.max(0, parseInt(req.body.quantity, 10)) : oldQty;
    const qtyDiff = newQty - oldQty;

    await item.update({
      itemName: req.body.itemName !== undefined ? req.body.itemName.trim() : item.itemName,
      quantity: newQty,
      toleranceLimit: req.body.toleranceLimit !== undefined ? Math.max(0, parseInt(req.body.toleranceLimit, 10)) : item.toleranceLimit,
      unit: req.body.unit !== undefined ? req.body.unit : item.unit,
      category: req.body.category !== undefined ? req.body.category : item.category,
      location: req.body.location !== undefined ? req.body.location : item.location,
      notes: req.body.notes !== undefined ? req.body.notes : item.notes
    });

    if (qtyDiff !== 0 && StoreTransactionLog) {
      await StoreTransactionLog.create({
        itemId: item.id,
        itemName: item.itemName,
        type: qtyDiff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
        qtyChange: qtyDiff,
        finalQty: newQty,
        reason: req.body.reason || 'Manual Adjustment',
        reference: req.body.reference || null,
        operatorName: operator,
        branch: item.branch
      });
    }

    return res.status(200).json({ success: true, item });
  } catch (error) {
    console.error('Store update error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update stock item' });
  }
};

// Adjust stock (Issue or Add)
exports.adjustStock = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();
    if (StoreTransactionLog) await StoreTransactionLog.sync();

    const { id } = req.params;
    const { action, qty, reason, reference } = req.body;

    const item = await StoreItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Stock item not found' });
    }

    const changeAmount = Math.max(1, parseInt(qty, 10) || 1);
    const operator = req.user ? `${req.user.name || req.user.email}` : 'Store Manager';

    let newQty = item.quantity;
    let type = 'STOCK_IN';
    let qtyChange = changeAmount;

    if (action === 'OUT' || action === 'ISSUE' || action === 'DEDUCT') {
      if (item.quantity < changeAmount) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Only ${item.quantity} available in inventory.`
        });
      }
      newQty = item.quantity - changeAmount;
      type = 'STOCK_OUT';
      qtyChange = -changeAmount;
    } else {
      // IN / ADD
      newQty = item.quantity + changeAmount;
      type = 'STOCK_IN';
      qtyChange = changeAmount;
    }

    await item.update({ quantity: newQty });

    let log = null;
    if (StoreTransactionLog) {
      log = await StoreTransactionLog.create({
        itemId: item.id,
        itemName: item.itemName,
        type,
        qtyChange,
        finalQty: newQty,
        reason: reason || (type === 'STOCK_IN' ? 'Stock Received / Inward' : 'Issued to Production / Department'),
        reference: reference || null,
        operatorName: operator,
        branch: item.branch
      });
    }

    return res.status(200).json({
      success: true,
      item,
      log,
      message: `${type === 'STOCK_IN' ? 'Added' : 'Issued'} ${changeAmount} unit(s) successfully.`
    });
  } catch (error) {
    console.error('Store adjust stock error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to adjust stock' });
  }
};

// Delete a store item
exports.delete = async (req, res) => {
  try {
    const { StoreItem, StoreTransactionLog } = req.tenantModels || {};
    if (!StoreItem) {
      return res.status(500).json({ success: false, error: 'StoreItem model not found' });
    }
    await StoreItem.sync();

    const { id } = req.params;
    const item = await StoreItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Stock item not found' });
    }

    const operator = req.user ? `${req.user.name || req.user.email}` : 'Store Manager';
    if (StoreTransactionLog) {
      await StoreTransactionLog.create({
        itemId: item.id,
        itemName: item.itemName,
        type: 'DELETE',
        qtyChange: -item.quantity,
        finalQty: 0,
        reason: 'Item removed from store catalogue',
        operatorName: operator,
        branch: item.branch
      });
    }

    await item.destroy();
    return res.status(200).json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Store delete error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete stock item' });
  }
};

// Get transaction history
exports.history = async (req, res) => {
  try {
    const { StoreTransactionLog } = req.tenantModels || {};
    if (!StoreTransactionLog) {
      return res.status(200).json({ success: true, logs: [] });
    }
    await StoreTransactionLog.sync();

    const { itemId, branch } = req.query;
    const whereClause = {};

    if (itemId) {
      whereClause.itemId = itemId;
    }
    if (branch && branch !== 'all') {
      whereClause.branch = branch;
    }

    const logs = await StoreTransactionLog.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 100
    });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Store history error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch history logs' });
  }
};

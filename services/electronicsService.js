const electronicsRepository = require('../repositories/electronicsRepository');

const SEED_BOARDS = [
  {
    name: "ADRA ADC Module - CS5530", brand: "ADRA",
    model: "ADRA-ADC-CS5530", version: "VER-2.01", location: "Vasai Factory",
    description: "ADC Module board based on Cirrus Logic CS5530 A/D converter IC (TSSOP20)",
    qty: 10, minQty: 3, date: '2026-07-16',
    parts: [
      { id: "cs5530-1", name: "Chip Capacitor", value: "100nf", pattern: "SMD-0805", refdes: "C10, C11, C15, C29", qty: 40, minQty: 10, unit: "Pcs", supplier: "Mouser", basePerBoard: 4 },
      { id: "cs5530-2", name: "Chip Capacitor", value: "4.7uf", pattern: "SMD-0805", refdes: "C19", qty: 12, minQty: 5, unit: "Pcs", supplier: "DigiKey", basePerBoard: 1 },
      { id: "cs5530-3", name: "Chip Capacitor", value: "10nf", pattern: "SMD-0805", refdes: "C1, C2, C14, C38, C45, C48", qty: 65, minQty: 20, unit: "Pcs", supplier: "Mouser", basePerBoard: 6 },
      { id: "cs5530-4", name: "Chip Capacitor", value: "1nf", pattern: "SMD-0805", refdes: "C13, C23, C24, C25, C26, C27, C31, C32, C35, C36", qty: 110, minQty: 30, unit: "Pcs", supplier: "Element14", basePerBoard: 10 },
      { id: "cs5530-5", name: "Chip Capacitor", value: "22pf", pattern: "SMD-0805", refdes: "C6, C7, C8, C9, C21, C22, C28, C30, C33, C34, C37", qty: 125, minQty: 40, unit: "Pcs", supplier: "DigiKey", basePerBoard: 11 },
      { id: "cs5530-8", name: "Ferrite Bead", value: "220Ohm@100MHz", pattern: "SMD-0805", refdes: "L1, L2, L3, L4", qty: 135, minQty: 30, unit: "Pcs", supplier: "Mouser", basePerBoard: 13 },
      { id: "cs5530-9", name: "Chip TVS Diode", value: "SMBJ6.8CA", pattern: "SMB", refdes: "D1, D2, D3", qty: 52, minQty: 10, unit: "Pcs", supplier: "DigiKey", basePerBoard: 5 },
      { id: "cs5530-10", name: "Chip Resistor", value: "1k-1%", pattern: "SMD-0805", refdes: "R1, R2, R10", qty: 95, minQty: 20, unit: "Pcs", supplier: "Mouser", basePerBoard: 9 },
      { id: "cs5530-12", name: "A/D converter IC", value: "CS5530", pattern: "TSSOP20", refdes: "IC1", qty: 8, minQty: 5, unit: "Pcs", supplier: "Cirrus Logic", basePerBoard: 1 },
      { id: "cs5530-14", name: "Crystal Oscillator", value: "4.9152 Mhz", pattern: "SMD", refdes: "Y1", qty: 11, minQty: 5, unit: "Pcs", supplier: "DigiKey", basePerBoard: 1 }
    ]
  },
  {
    name: "ADRA ADC Module - ISL26132", brand: "ADRA",
    model: "ADRA-ADC-ISL26132", version: "VER-2.01", location: "Vasai Factory",
    description: "ADC Module board based on Renesas ISL26132 A/D converter IC (TSSOP24)",
    qty: 12, minQty: 3, date: '2026-07-16',
    parts: [
      { id: "isl26132-1", name: "Chip Capacitor", value: "100nf", pattern: "SMD-0805", refdes: "C10, C11, C15", qty: 50, minQty: 10, unit: "Pcs", supplier: "Mouser", basePerBoard: 5 },
      { id: "isl26132-2", name: "Chip Capacitor", value: "10uf", pattern: "SMD-0805", refdes: "C20", qty: 15, minQty: 5, unit: "Pcs", supplier: "DigiKey", basePerBoard: 1 },
      { id: "isl26132-3", name: "Chip Capacitor", value: "10nf", pattern: "SMD-0805", refdes: "C1, C2", qty: 62, minQty: 20, unit: "Pcs", supplier: "Mouser", basePerBoard: 6 },
      { id: "isl26132-8", name: "Ferrite Bead Inductor", value: "220Ohm 3A", pattern: "SMD-0805", refdes: "L1, L2, L3", qty: 130, minQty: 30, unit: "Pcs", supplier: "Mouser", basePerBoard: 13 },
      { id: "isl26132-10", name: "Chip Resistor", value: "1k-1%", pattern: "SMD-0805", refdes: "R1, R2", qty: 90, minQty: 20, unit: "Pcs", supplier: "Mouser", basePerBoard: 9 },
      { id: "isl26132-12", name: "A/D converter IC", value: "ISL26132", pattern: "TSSOP24", refdes: "IC1", qty: 9, minQty: 5, unit: "Pcs", supplier: "Renesas", basePerBoard: 1 }
    ]
  },
  {
    name: "ADRA SoM 002", brand: "ADRA",
    model: "ADRA-SOM-002", version: "VER-2.12", location: "Vasai Factory",
    description: "System-on-Module board with STM32H743IIT6 microcontroller, SDRAM, NOR flash and RTC",
    qty: 15, minQty: 5, date: '2026-07-16',
    parts: [
      { id: "som002-1", name: "Chip Capacitor", value: "100nf", pattern: "SMD-0805", refdes: "C1, C3, C4", qty: 450, minQty: 100, unit: "Pcs", supplier: "Mouser", basePerBoard: 37 },
      { id: "som002-2", name: "Chip Capacitor", value: "4.7uf", pattern: "SMD-0805", refdes: "C2, C21", qty: 65, minQty: 20, unit: "Pcs", supplier: "DigiKey", basePerBoard: 5 },
      { id: "som002-5", name: "Chip Resistor", value: "3.3k-1%", pattern: "SMD-0805", refdes: "R6, R16", qty: 220, minQty: 50, unit: "Pcs", supplier: "Mouser", basePerBoard: 16 },
      { id: "som002-16", name: "Microcontroller", value: "STM32H743IIT6", pattern: "TQFP-176", refdes: "IC1", qty: 10, minQty: 5, unit: "Pcs", supplier: "STMicroelectronics", basePerBoard: 1 },
      { id: "som002-20", name: "SDRAM Memory", value: "W9864G6KH-6", pattern: "TSOP-II-54", refdes: "IC8", qty: 12, minQty: 5, unit: "Pcs", supplier: "Winbond", basePerBoard: 1 },
      { id: "som002-21", name: "Real Time Clock", value: "DS3231", pattern: "SOIC-16", refdes: "IC10", qty: 14, minQty: 5, unit: "Pcs", supplier: "Maxim Integrated", basePerBoard: 1 }
    ]
  }
];

const mapBranchToLocation = (branch) => {
  if (!branch) return null;
  if (branch.includes('Vasai')) return 'Vasai Factory';
  if (branch.includes('Malad')) return 'Malad Store';
  if (branch.includes('Sathivali')) return 'Sathivali Branch';
  if (branch.includes('Vadodara')) return 'Vadodara Lab';
  return branch;
};

exports.getAllBoards = async (boardModel, branch) => {
  let boards = await electronicsRepository.findAll(boardModel);
  if (boards.length === 0) {
    console.log('[Electronics Service] Seeding default boards in schema...');
    boards = await electronicsRepository.bulkCreate(boardModel, SEED_BOARDS);
    // Fetch seeded boards again to get ids correctly
    boards = await electronicsRepository.findAll(boardModel);
  }
  
  if (branch) {
    const loc = mapBranchToLocation(branch);
    return boards.filter(b => b.location === loc);
  }
  return boards;
};

exports.createBoard = async (boardModel, data) => {
  const payload = {
    name: data.name,
    brand: data.brand || 'ADRA',
    model: data.model,
    version: data.version || 'VER-1.0',
    location: data.location || 'Vasai Factory',
    description: data.description,
    qty: data.qty || 0,
    minQty: data.minQty || 0,
    parts: data.parts || [],
    date: new Date()
  };

  return await electronicsRepository.create(boardModel, payload);
};

const logTransaction = async (logModel, boardId, type, qty, ref, operatorName, partsSnapshot) => {
  try {
    await logModel.create({
      boardId,
      type,
      qty,
      ref: ref || null,
      operatorName: operatorName || 'System Operator',
      partsSnapshot: partsSnapshot || []
    });
  } catch (err) {
    console.error('[Electronics Service] Failed to log stock transaction:', err);
  }
};

exports.updateBoard = async (boardModel, logModel, id, data, operatorName) => {
  const board = await electronicsRepository.findByPk(boardModel, id);
  if (!board) {
    throw new Error('Board not found.');
  }

  const prevParts = JSON.parse(JSON.stringify(board.parts || []));
  const prevQty = board.qty;

  const fieldsToUpdate = ['name', 'brand', 'model', 'version', 'location', 'description', 'qty', 'minQty', 'parts'];
  fieldsToUpdate.forEach((field) => {
    if (data[field] !== undefined) {
      board[field] = data[field];
    }
  });

  const savedBoard = await electronicsRepository.save(board);

  if (data.log_type) {
    const partsSnapshot = (data.parts || []).map(p => {
      const prev = prevParts.find(x => x.id === p.id);
      return {
        name: p.name,
        value: p.value,
        before: prev ? prev.qty : 0,
        after: p.qty
      };
    });

    await logTransaction(
      logModel,
      id,
      data.log_type,
      data.log_qty || 0,
      data.log_ref || '',
      operatorName,
      partsSnapshot
    );
  }

  return savedBoard;
};

exports.manufactureBoard = async (boardModel, logModel, id, qty, ref, operatorName) => {
  const board = await electronicsRepository.findByPk(boardModel, id);
  if (!board) {
    throw new Error('Board not found.');
  }

  const prevParts = JSON.parse(JSON.stringify(board.parts || []));

  // Deduct parts based on basePerBoard ratio
  const updatedParts = (board.parts || []).map((p) => {
    const deduction = (p.basePerBoard || 1) * qty;
    return {
      ...p,
      qty: Math.max(0, p.qty - deduction)
    };
  });

  board.parts = updatedParts;
  board.qty = board.qty + qty;
  board.date = new Date();

  const savedBoard = await electronicsRepository.save(board);

  // Build log snapshot
  const partsSnapshot = updatedParts.map((p) => {
    const prev = prevParts.find(x => x.id === p.id);
    return {
      name: p.name,
      value: p.value,
      before: prev ? prev.qty : 0,
      after: p.qty
    };
  });

  await logTransaction(
    logModel,
    id,
    'manufacture',
    qty,
    ref,
    operatorName,
    partsSnapshot
  );

  return savedBoard;
};

exports.getTransactionLogs = async (logModel, boardModel, boardId) => {
  const queryOptions = {
    order: [['createdAt', 'DESC']],
    include: [{ model: boardModel, as: 'board', attributes: ['name', 'model', 'version'] }]
  };
  if (boardId) {
    queryOptions.where = { board_id: boardId };
  }
  return await logModel.findAll(queryOptions);
};

exports.deleteBoard = async (boardModel, id) => {
  const board = await electronicsRepository.findByPk(boardModel, id);
  if (!board) {
    throw new Error('Board not found.');
  }
  await electronicsRepository.destroy(board);
  return true;
};


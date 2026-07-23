const oifRepository = require('../repositories/oifRepository');

exports.createOrder = async (oifModel, data, userId, userName) => {
  const count = await oifRepository.count(oifModel);
  const nextOifNo = `OIF-${String(count + 1).padStart(3, '0')}`;

  const payload = {
    oifNo: nextOifNo,
    poNo: data.poNo,
    orderDate: data.orderDate || new Date().toISOString().split('T')[0],
    dispatchDate: data.dispatchDate,
    brand: data.brand || 'Archerchem',
    status: data.status || 'pending',
    customer: data.customer,
    contact: data.contact,
    contactNo: data.contactNo,
    billing: data.billing,
    shipping: data.shipping,
    products: data.products || [],
    pole: data.pole || 'No',
    printer: data.printer || 'No',
    stamping: data.stamping || 'No',
    transport: data.transport,
    courier: data.courier,
    remarks: data.remarks,
    preparedBy: data.preparedBy || userName || 'Admin',
    prepDate: data.prepDate || new Date().toISOString().split('T')[0],
    sign: data.sign,
    branch: data.branch || 'Vasai Factory (HQ)',
    createdById: userId
  };

  return await oifRepository.create(oifModel, payload);
};

exports.getAllOrders = async (oifModel, branch) => {
  const filter = branch ? { branch } : {};
  return await oifRepository.findAll(oifModel, filter);
};

exports.updateOrder = async (oifModel, id, data) => {
  const order = await oifRepository.findByPk(oifModel, id);
  if (!order) {
    throw new Error('Order not found.');
  }

  const fieldsToUpdate = [
    'poNo', 'orderDate', 'dispatchDate', 'brand', 'status', 'customer', 'contact',
    'contactNo', 'billing', 'shipping', 'products', 'pole', 'printer', 'stamping',
    'transport', 'courier', 'remarks', 'preparedBy', 'sign'
  ];

  fieldsToUpdate.forEach((field) => {
    if (data[field] !== undefined) {
      order[field] = data[field];
    }
  });

  return await oifRepository.save(order);
};

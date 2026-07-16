const branchRepository = require('../repositories/branchRepository');

const DEFAULT_BRANCHES = [
  { name: 'Vasai Factory (HQ)', code: 'VASAI', location: 'Vasai West' },
  { name: 'Malad Store', code: 'MALAD', location: 'Malad East' },
  { name: 'Sathivali Branch', code: 'SATHIVALI', location: 'Sathivali Road' },
  { name: 'Vadodara Lab', code: 'VADODARA', location: 'Vadodara Gujarat' }
];

exports.getAllBranches = async (branchModel) => {
  let list = await branchRepository.findAll(branchModel);
  if (list.length === 0) {
    console.log('[Branch Service] Seeding default branches...');
    for (const item of DEFAULT_BRANCHES) {
      const exists = await branchModel.findOne({ where: { code: item.code } });
      if (!exists) {
        await branchModel.create(item);
      }
    }
    list = await branchRepository.findAll(branchModel);
  }
  return list;
};

exports.createBranch = async (branchModel, data) => {
  const payload = {
    name: data.name,
    code: data.code || data.name.toUpperCase().replace(/\s+/g, '_'),
    location: data.location || ''
  };
  return await branchRepository.create(branchModel, payload);
};

exports.updateBranch = async (branchModel, id, data) => {
  const branch = await branchRepository.findByPk(branchModel, id);
  if (!branch) {
    throw new Error('Branch not found.');
  }

  if (data.name !== undefined) branch.name = data.name;
  if (data.code !== undefined) branch.code = data.code;
  if (data.location !== undefined) branch.location = data.location;

  return await branchRepository.save(branch);
};

exports.deleteBranch = async (branchModel, id) => {
  const branch = await branchRepository.findByPk(branchModel, id);
  if (!branch) {
    throw new Error('Branch not found.');
  }
  return await branchRepository.destroy(branch);
};

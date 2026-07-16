const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const OifOrder = sequelize.define('OifOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    oifNo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'oif_no'
    },
    poNo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'po_no'
    },
    orderDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'order_date'
    },
    dispatchDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'dispatch_date'
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactNo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_no'
    },
    billing: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    products: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    pole: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'No'
    },
    printer: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'No'
    },
    stamping: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'No'
    },
    transport: {
      type: DataTypes.STRING,
      allowNull: true
    },
    courier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preparedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'prepared_by'
    },
    prepDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'prep_date'
    },
    sign: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Vasai Factory (HQ)'
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    schema: schemaName,
    tableName: 'oif_orders',
    timestamps: true
  });

  return OifOrder;
};

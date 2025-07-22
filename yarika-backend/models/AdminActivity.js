const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['Created', 'Updated', 'Deleted', 'Logged In', 'Logged Out', 'Password Changed', 'Order Status Changed', 'Product Status Changed']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Product', 'Order', 'Admin', 'Client', 'Category', 'Color', 'Size', 'System']
  },
  entityName: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
adminActivitySchema.index({ adminId: 1, createdAt: -1 });
adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema); 
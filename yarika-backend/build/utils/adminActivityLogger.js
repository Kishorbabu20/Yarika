const AdminActivity = require('../models/AdminActivity');

/**
 * Log admin activity
 * @param {Object} params - Activity parameters
 * @param {string} params.adminId - Admin ID
 * @param {string} params.adminName - Admin name
 * @param {string} params.action - Action performed (Created, Updated, Deleted, etc.)
 * @param {string} params.entityType - Type of entity (Product, Order, Admin, etc.)
 * @param {string} params.entityName - Name of the entity
 * @param {string} params.entityId - ID of the entity (optional)
 * @param {string} params.details - Additional details (optional)
 * @param {string} params.ipAddress - IP address (optional)
 * @param {string} params.userAgent - User agent (optional)
 */
const logAdminActivity = async (params) => {
  try {
    const activity = new AdminActivity({
      adminId: params.adminId,
      adminName: params.adminName,
      action: params.action,
      entityType: params.entityType,
      entityName: params.entityName,
      entityId: params.entityId,
      details: params.details || '',
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || ''
    });

    await activity.save();
    console.log(`Admin activity logged: ${params.adminName} ${params.action} ${params.entityName}`);
  } catch (error) {
    console.error('Error logging admin activity:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

module.exports = { logAdminActivity }; 
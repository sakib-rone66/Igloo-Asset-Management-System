const User = require("../models/User");

const defaultTsoPermissions = {
  dashboard: { view: true },
  users: { view: true },
  assets: { view: true, add: true, addExisting: true },
  assetRequests: { view: true, create: true, approve: true },
  assetOperations: {
    assignment: true,
    transfer: true,
    return: true,
    disposal: true,
  },
  repairs: {
    view: true,
    create: true,
    approve: true,
    reject: true,
  },
  assetAuthorization: { view: true, approve: true },
  verificationMapping: {
    view: true,
    submit: true,
    approve: true,
    history: true,
  },
  outlets: { view: true, add: true, update: true },
  checkIns: { checkIn: true, history: true, allHistory: true },
  regions: { view: true, add: true, update: true },
  districts: { view: true, add: true, update: true },
  distributors: { view: true, add: true, update: true },
  manufacturers: {
    view: true,
    add: true,
    update: true,
    changeStatus: true,
  },
};

const defaultAsoPermissions = {
  dashboard: { view: true },
  assets: { view: true, add: true, addExisting: true },
  assetRequests: { view: true, create: true },
  assetOperations: { transfer: true },
  verificationMapping: { view: true, submit: true },
  outlets: { view: true, add: true, update: true },
  checkIns: { checkIn: true, history: true },
  regions: { view: true, add: true },
  districts: { view: true, add: true },
  distributors: { view: true, add: true, update: true },
  manufacturers: { view: true },
};

const defaultTechnicianPermissions = {
  dashboard: { view: true },
  assets: { view: true },
  repairs: { view: true, create: true, update: true },
  outlets: { view: true },
  checkIns: { checkIn: true, history: true },
  regions: { view: true },
  districts: { view: true },
  distributors: { view: true },
  manufacturers: { view: true },
};

const defaultTsmPermissions = {
  dashboard: { view: true },
  users: { view: true, add: true, changeStatus: true },
  assets: { view: true, add: true, addExisting: true },
  assetRequests: { view: true, create: true, approve: true },
  assetOperations: {
    assignment: true,
    transfer: true,
    return: true,
    disposal: true,
  },
  repairs: {
    view: true,
    create: true,
    approve: true,
    reject: true,
  },
  assetAuthorization: { view: true, approve: true },
  verificationMapping: {
    view: true,
    submit: true,
    approve: true,
    history: true,
  },
  outlets: { view: true, add: true, update: true },
  checkIns: { checkIn: true, history: true, allHistory: true },
  regions: { view: true, add: true, update: true },
  districts: { view: true, add: true, update: true },
  distributors: { view: true, add: true, update: true },
  manufacturers: {
    view: true,
    add: true,
    update: true,
    changeStatus: true,
  },
};

const clonePermissions = (permissions) => {
  if (!permissions) return null;

  const plainPermissions =
    typeof permissions.toObject === "function"
      ? permissions.toObject()
      : permissions;

  const serialized = JSON.stringify(plainPermissions);
  return serialized ? JSON.parse(serialized) : null;
};

const getAsoPermissions = async () => {
  return clonePermissions(defaultAsoPermissions);
};

const getTechnicianPermissions = async () => {
  return clonePermissions(defaultTechnicianPermissions);
};

const getTsoPermissions = async () => {
  return clonePermissions(defaultTsoPermissions);
};

const getTsmPermissions = async () => {
  return clonePermissions(defaultTsmPermissions);
};

const syncAsoPermissions = async () => {
  const permissions = await getAsoPermissions();

  await User.updateMany({ role: "ASO" }, { $set: { permissions } });
};

const syncTechnicianPermissions = async () => {
  const permissions = await getTechnicianPermissions();

  await User.updateMany({ role: "TECHNICIAN" }, { $set: { permissions } });
};

const syncTsoPermissions = async () => {
  const permissions = await getTsoPermissions();

  await User.updateMany({ role: "TSO" }, { $set: { permissions } });
};

const syncTsmPermissions = async () => {
  const permissions = await getTsmPermissions();

  await User.updateMany(
    { role: "TSM" },
    { $set: { permissions, assignedAso: null, assignedTso: null } },
  );
};

const syncAsoSupervisors = async () => {
  const activeTsos = await User.find({ role: "TSO", status: "ACTIVE" })
    .select("_id")
    .sort({ createdAt: 1, _id: 1 });

  if (activeTsos.length === 0) return;

  await User.updateMany(
    { role: "ASO", assignedTso: null },
    { $set: { assignedTso: activeTsos[0]._id, assignedAso: null } },
  );
};

module.exports = {
  getAsoPermissions,
  getTechnicianPermissions,
  getTsoPermissions,
  getTsmPermissions,
  syncAsoPermissions,
  syncAsoSupervisors,
  syncTsoPermissions,
  syncTsmPermissions,
  syncTechnicianPermissions,
};

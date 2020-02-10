const config = require("./config");
const call_account_api = require('./network/call_account_api');

/**
 *
 * @param [enabled] {boolean}
 * @param [ids] {number[]}
 * @param [prefix] { string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function subAccounts(enabled, ids = [], prefix, options = {}, callback) {
  let params = {
    enabled,
    ids,
    prefix,
  };

  let uri = ['sub_accounts'];
  return call_account_api('GET', uri, params, callback, options);
}


/**
 *
 * @param subAccountId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function subAccount(subAccountId, options = {}, callback) {
  let uri = ['sub_accounts', subAccountId];
  return call_account_api('GET', uri, {}, callback, options);
}

function createSubAccount(name, cloudName, customAttributes, enabled, baseAccount, options = {}, callback) {
  let params = {
    cloud_name: cloudName,
    name,
    custom_attributes: customAttributes,
    enabled,
    base_sub_account_id: baseAccount,
  };

  options.content_type = "json";
  let uri = ['sub_accounts'];
  return call_account_api('POST', uri, params, callback, options);
}

/**
 *
 * @param subAccountId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function deleteSubAccount(subAccountId, options = {}, callback) {
  let uri = ['sub_accounts', subAccountId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 *
 * @param subAccountId {string}
 * @param [name] {string}
 * @param [cloudName] {string}
 * @param [customAttributes] {object}
 * @param [enabled] {boolean}
 * @param [options] {object}
 * @param [callback] {function}
 */
function updateSubAccount(subAccountId, name, cloudName, customAttributes, enabled, options = {}, callback) {
  let params = {
    cloud_name: cloudName,
    name,
    custom_attributes: customAttributes,
    enabled,
  };

  options.content_type = "json";
  let uri = ['sub_accounts', subAccountId];
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 *
 * @param userId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function user(userId, options = {}, callback) {
  let uri = ['users', userId];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 *
 * @param [pending] {boolean}
 * @param [userIds] {string[]}
 * @param [prefix] {string}
 * @param [subAccountId[ {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function users(pending, userIds, prefix, subAccountId, options = {}, callback) {
  let uri = ['users'];
  let params = {
    ids: userIds,
  };
  return call_account_api('GET', uri, params, callback, options);
}

/**
 *
 * @param name {string}
 * @param email {string} {string}
 * @param role {string}
 * @param [subAccountIds] {string[]}
 * @param [options] {object}
 * @param [callback] {function}
 */
function createUser(name, email, role, subAccountIds, options = {}, callback) {
  let uri = ['users'];
  let params = {
    name,
    email,
    role,
    sub_account_ids: subAccountIds,
  };
  options.content_type = 'json';
  return call_account_api('POST', uri, params, callback, options);
}

/**
 *
 * @param userId {string}
 * @param [name] {string}
 * @param [email] {string}
 * @param [role] {string}
 * @param [subAccountIds] {string[]}
 * @param [options] {object}
 * @param [callback] {function}
 */
function updateUser(userId, name, email, role, subAccountIds, options = {}, callback) {
  let uri = ['users', userId];
  let params = {
    name,
    email,
    role,
    sub_account_ids: subAccountIds,
  };
  options.content_type = 'json';
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 *
 * @param userId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function deleteUser(userId, options = {}, callback) {
  let uri = ['users', userId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 *
 * @param name {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function createUserGroup(name, options = {}, callback) {
  let uri = ['user_groups'];
  options.content_type = 'json';
  let params = {
    name,
  };
  return call_account_api('POST', uri, params, callback, options);
}

/**
 *
 * @param groupId
 * @param name {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function updateUserGroup(groupId, name, options = {}, callback) {
  let uri = ['user_groups', groupId];
  let params = {
    name,
  };
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 *
 * @param groupId
 * @param [options] {object}
 * @param [callback] {function}
 */
function deleteUserGroup(groupId, options = {}, callback) {
  let uri = ['user_groups', groupId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 *
 * @param groupId
 * @param userId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function addUserToGroup(groupId, userId, options = {}, callback) {
  let uri = ['user_groups', groupId, 'users', userId];
  return call_account_api('POST', uri, {}, callback, options);
}

/**
 *
 * @param groupId
 * @param userId {string}
 * @param [options] {object}
 * @param [callback] {function}
 */
function removeUserFromGroup(groupId, userId, options = {}, callback) {
  let uri = ['user_groups', groupId, 'users', userId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 *
 * @param groupId
 * @param [options] {object}
 * @param [callback] {function}
 */
function userGroup(groupId, options = {}, callback) {
  let uri = ['user_groups', groupId];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 *
 * @param [options] {object}
 * @param [callback] {function}
 */
function userGroups(options = {}, callback) {
  let uri = ['user_groups'];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 *
 * @param groupId
 * @param [options] {object}
 * @param [callback] {function}
 */
function userGroupUsers(groupId, options = {}, callback) {
  let uri = ['user_groups', groupId, 'users'];
  return call_account_api('GET', uri, {}, callback, options);
}


module.exports = {
  subAccounts,
  createSubAccount,
  deleteSubAccount,
  subAccount,
  updateSubAccount,
  user,
  users,
  userGroup,
  userGroups,
  userGroupUsers,
  removeUserFromGroup,
  deleteUser,
  updateUserGroup,
  updateUser,
  createUser,
  createUserGroup,
  addUserToGroup,
  deleteUserGroup,
};

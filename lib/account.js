const config = require("./config");
const call_account_api = require('./network/call_account_api');

/**
 * @desc - List all subAccounts under the account.
 * @param [enabled] {boolean} - If not specified, all are fetched
 * @param [ids] {number[]} - Narrow the fetch the list provided in ids[]
 * @param [prefix] {string} - Narrow the fetch by the prefix of the subAccount name
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc Get a specific subAccount by subAccountID
 * @param subAccountId {string} - The ID generated when using createSubAccount
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc - Delete a subAccount by subAccountID
 * @param subAccountId {string} - The ID generated when using createSubAccount
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function deleteSubAccount(subAccountId, options = {}, callback) {
  let uri = ['sub_accounts', subAccountId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Update a subAccount by subAccountID
 * @param subAccountId {string} - The ID generated when using createSubAccount
 * @param [name] {string} - The name displayed in the management console.
 * @param [cloudName] {string} - Unique identifier, used in API calls
 * @param [customAttributes] {object}
 * @param [enabled] {boolean} - Set the sub-account as enabled or not.
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc Get a user by UserId
 * @param userId {string} - The userId created by createUser
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function user(userId, options = {}, callback) {
  let uri = ['users', userId];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * Get a list of users in the account
 * @param [pending] {boolean} - Narrow the fetch by pending status
 * @param [userIds] {string[]} - Narrow the fetch by only fetching the listed users in userIds
 * @param [prefix] {string} - Narrow the fetch by the prefix of the user name
 * @param [subAccountId[ {string} - Narrow the fetch by users with access to these subAccounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc - Create a user in the account
 * @param name {string} - Username
 * @param email {string} - User email
 * @param role {string} - User role
 * @param [subAccountIds] {string[]} - Provides the created user access to these subAccounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @param userId {string} - The userId created by createUser
 * @param [name] {string} - User name
 * @param [email] {string} - User email
 * @param [role] {string} - User role
 * @param [subAccountIds] {string[]} - Provides the created user access to these subAccounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc - Delete user by UserId
 * @param userId {string} - The userId created by createUser
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function deleteUser(userId, options = {}, callback) {
  let uri = ['users', userId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Create a user group
 * @param name {string} - The user group name
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc Update the user group by GroupId
 * @param groupId {string} The groupId created by createUserGroup
 * @param name {string} - User group name
 * @param [options] {object} - Generic advanced options map, see online documentation.
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
 * @desc Delete a user group
 * @param groupId {string} The groupId created by createUserGroup
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function deleteUserGroup(groupId, options = {}, callback) {
  let uri = ['user_groups', groupId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc Add a user to a user group
 * @param groupId {string} - The groupId created by createUserGroup
 * @param userId {string} - The userId created by createUser
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function addUserToGroup(groupId, userId, options = {}, callback) {
  let uri = ['user_groups', groupId, 'users', userId];
  return call_account_api('POST', uri, {}, callback, options);
}

/**
 * @desc Remove a user to a user group
 * @param groupId {string} - The groupId created by createUserGroup
 * @param userId {string} - The userId created by createUser
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function removeUserFromGroup(groupId, userId, options = {}, callback) {
  let uri = ['user_groups', groupId, 'users', userId];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Get all user groups
 * @param groupId {string} - The groupId created by createUserGroup
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function userGroup(groupId, options = {}, callback) {
  let uri = ['user_groups', groupId];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * @desc - Get user groups in the account
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function userGroups(options = {}, callback) {
  let uri = ['user_groups'];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * @desc - Get users in a user group
 * @param groupId {string} - The groupId created by createUserGroup
 * @param [options] {object} - Generic advanced options map, see online documentation.
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

const call_account_api = require('../network/call_account_api');

/**
 * @desc - List all sub_accounts under the account.
 * @param [enabled] {boolean} - If not specified, all are fetched
 * @param [ids] {number[]} - Narrow the fetch the list provided in ids[]
 * @param [prefix] {string} - Narrow the fetch by the prefix of the sub_account name
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function sub_accounts(enabled, ids = [], prefix, options = {}, callback) {
  let params = {
    enabled,
    ids,
    prefix,
  };

  let uri = ['sub_accounts'];
  return call_account_api('GET', uri, params, callback, options);
}


/**
 * @desc Get a specific sub_account by sub_account_id
 * @param sub_account_id {string} - The ID generated when using create_sub_account
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function sub_account(sub_account_id, options = {}, callback) {
  let uri = ['sub_accounts', sub_account_id];
  return call_account_api('GET', uri, {}, callback, options);
}

function create_sub_account(name, cloud_name, custom_attributes, enabled, base_account, options = {}, callback) {
  let params = {
    cloud_name: cloud_name,
    name,
    custom_attributes: custom_attributes,
    enabled,
    base_sub_account_id: base_account,
  };

  options.content_type = "json";
  let uri = ['sub_accounts'];
  return call_account_api('POST', uri, params, callback, options);
}

/**
 * @desc - Delete a sub_account by sub_account_id
 * @param sub_account_id {string} - The ID generated when using create_sub_account
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function delete_sub_account(sub_account_id, options = {}, callback) {
  let uri = ['sub_accounts', sub_account_id];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Update a sub_account by sub_account_id
 * @param sub_account_id {string} - The ID generated when using create_sub_account
 * @param [name] {string} - The name displayed in the management console.
 * @param [cloud_name] {string} - Unique identifier, used in API calls
 * @param [custom_attributes] {object}
 * @param [enabled] {boolean} - Set the sub-account as enabled or not.
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function update_sub_account(sub_account_id, name, cloud_name, custom_attributes, enabled, options = {}, callback) {
  let params = {
    cloud_name: cloud_name,
    name,
    custom_attributes: custom_attributes,
    enabled,
  };

  options.content_type = "json";
  let uri = ['sub_accounts', sub_account_id];
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 * @desc Get a user by user_id
 * @param user_id {string} - The user_id created by create_user
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function user(user_id, options = {}, callback) {
  let uri = ['users', user_id];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * Get a list of users in the account
 * @param [pending] {boolean} - Narrow the fetch by pending status
 * @param [user_ids] {string[]} - Narrow the fetch by only fetching the listed users in user_ids
 * @param [prefix] {string} - Narrow the fetch by the prefix of the user name
 * @param [sub_account_id[ {string} - Narrow the fetch by users with access to these sub_accounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function users(pending, user_ids, prefix, sub_account_id, options = {}, callback) {
  let uri = ['users'];
  let params = {
    ids: user_ids,
  };
  return call_account_api('GET', uri, params, callback, options);
}

/**
 * @desc - Create a user in the account
 * @param name {string} - Username
 * @param email {string} - User email
 * @param role {string} - User role
 * @param [sub_account_ids] {string[]} - Provides the created user access to these sub_accounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function create_user(name, email, role, sub_account_ids, options = {}, callback) {
  let uri = ['users'];
  let params = {
    name,
    email,
    role,
    sub_account_ids: sub_account_ids,
  };
  options.content_type = 'json';
  return call_account_api('POST', uri, params, callback, options);
}

/**
 *
 * @param user_id {string} - The user_id created by create_user
 * @param [name] {string} - User name
 * @param [email] {string} - User email
 * @param [role] {string} - User role
 * @param [sub_account_ids] {string[]} - Provides the created user access to these sub_accounts
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function update_user(user_id, name, email, role, sub_account_ids, options = {}, callback) {
  let uri = ['users', user_id];
  let params = {
    name,
    email,
    role,
    sub_account_ids: sub_account_ids,
  };
  options.content_type = 'json';
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 * @desc - Delete user by user_id
 * @param user_id {string} - The user_id created by create_user
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function delete_user(user_id, options = {}, callback) {
  let uri = ['users', user_id];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Create a user group
 * @param name {string} - The user group name
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function create_user_group(name, options = {}, callback) {
  let uri = ['user_groups'];
  options.content_type = 'json';
  let params = {
    name,
  };
  return call_account_api('POST', uri, params, callback, options);
}

/**
 * @desc Update the user group by group_id
 * @param group_id {string} The group_id created by create_user_group
 * @param name {string} - User group name
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function update_user_group(group_id, name, options = {}, callback) {
  let uri = ['user_groups', group_id];
  let params = {
    name,
  };
  return call_account_api('PUT', uri, params, callback, options);
}

/**
 * @desc Delete a user group
 * @param group_id {string} The group_id created by create_user_group
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function delete_user_group(group_id, options = {}, callback) {
  let uri = ['user_groups', group_id];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc Add a user to a user group
 * @param group_id {string} - The group_id created by create_user_group
 * @param user_id {string} - The user_id created by create_user
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function add_user_to_group(group_id, user_id, options = {}, callback) {
  let uri = ['user_groups', group_id, 'users', user_id];
  return call_account_api('POST', uri, {}, callback, options);
}

/**
 * @desc Remove a user to a user group
 * @param group_id {string} - The group_id created by create_user_group
 * @param user_id {string} - The user_id created by create_user
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function remove_user_from_group(group_id, user_id, options = {}, callback) {
  let uri = ['user_groups', group_id, 'users', user_id];
  return call_account_api('DELETE', uri, {}, callback, options);
}

/**
 * @desc - Get all user groups
 * @param group_id {string} - The group_id created by create_user_group
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function user_group(group_id, options = {}, callback) {
  let uri = ['user_groups', group_id];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * @desc - Get user groups in the account
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function user_groups(options = {}, callback) {
  let uri = ['user_groups'];
  return call_account_api('GET', uri, {}, callback, options);
}

/**
 * @desc - Get users in a user group
 * @param group_id {string} - The group_id created by create_user_group
 * @param [options] {object} - Generic advanced options map, see online documentation.
 * @param [callback] {function}
 */
function user_group_users(group_id, options = {}, callback) {
  let uri = ['user_groups', group_id, 'users'];
  return call_account_api('GET', uri, {}, callback, options);
}


module.exports = {
  sub_accounts,
  create_sub_account,
  delete_sub_account,
  sub_account,
  update_sub_account,
  user,
  users,
  user_group,
  user_groups,
  user_group_users,
  remove_user_from_group,
  delete_user,
  update_user_group,
  update_user,
  create_user,
  create_user_group,
  add_user_to_group,
  delete_user_group,
};

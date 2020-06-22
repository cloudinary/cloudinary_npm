require('dotenv').load({
  silent: true
});

const expect = require("expect.js");
const cloudinary = require("../../../../cloudinary");
const TIMEOUT = require('../../../testUtils/testConstants').TIMEOUT;

let runOnlyForInternalPRs = process.env.TRAVIS_SECURE_ENV_VARS ? describe : describe.skip;


runOnlyForInternalPRs('account API - Provisioning', function () {
  let CLOUD_SECRET;
  let CLOUD_API;
  let CLOUD_NAME;
  let CLOUD_ID;
  let USER_NAME = `SDK TEST ${Date.now()}`;
  let USER_EMAIL = `sdk-test+${Date.now()}@cloudinary.com`;
  let USER_ROLE = 'billing';
  let USER_ID;
  let GROUP_ID;
  let CLOUD_NAME_PREFIX = `justaname${process.hrtime()[1] % 10000}`;
  this.timeout(TIMEOUT.LONG);

  before("Setup the required test", async function () {
    let config = cloudinary.config(true);
    if (!(config.provisioning_api_key && config.provisioning_api_secret && config.account_id)) {
      // For external PRs the env variables are not availble, so we skip the provisioning API
      this.skip();
    }

    let CLOUD_TO_CREATE = CLOUD_NAME_PREFIX + Date.now();
    // Create a sub account(sub cloud)
    let res = await cloudinary.provisioning.account.create_sub_account(CLOUD_TO_CREATE, CLOUD_TO_CREATE, {}, true).catch((err) => {
      throw err;
    });

    CLOUD_API = res.api_access_keys[0].key;
    CLOUD_SECRET = res.api_access_keys[0].secret;
    CLOUD_NAME = res.cloud_name;
    CLOUD_ID = res.id;

    let createUser = await cloudinary.provisioning.account.create_user(USER_NAME, USER_EMAIL, USER_ROLE, []).catch((err) => {
      throw err;
    });

    USER_ID = createUser.id;

    // create a user group

    let createGroupRes = await cloudinary.provisioning.account.create_user_group(`test-group-${Date.now()}`).catch((err) => {
      throw err;
    });
    GROUP_ID = createGroupRes.id;

    return true;
  });

  after('Destroy the sub_account and user that was created', async () => {
    // Skip 'after' in case we don't have account configuration available
    // This means that the beforeHook also didn't run
    let config = cloudinary.config(true);
    if (!(config.provisioning_api_key && config.provisioning_api_secret && config.account_id)) {
      return;
    }
    let delRes = await cloudinary.provisioning.account.delete_sub_account(CLOUD_ID);
    let delUserRes = await cloudinary.provisioning.account.delete_user(USER_ID);
    let delGroupRes = await cloudinary.provisioning.account.delete_user_group(GROUP_ID);

    expect(delRes.message).to.eql('ok');
    expect(delUserRes.message).to.eql('ok');
    expect(delGroupRes.ok).to.eql(true); // notice the different response structure
  });

  it('Accepts credentials as an argument', async () => {
    let NEW_NAME = 'This wont be created';
    let options = {
      provisioning_api_key: 'abc',
      provisioning_api_secret: 'abc'
    };

    await cloudinary.provisioning.account.create_sub_account(CLOUD_ID, NEW_NAME, {}, null, null, options).catch((errRes) => {
      expect(errRes.error.http_code).to.eql(401);
    });
  });

  it('Updates a sub_account', async () => {
    let NEW_NAME = CLOUD_NAME_PREFIX + Date.now();
    await cloudinary.provisioning.account.update_sub_account(CLOUD_ID, NEW_NAME);

    let subAccRes = await cloudinary.provisioning.account.sub_account(CLOUD_ID);
    expect(subAccRes.name).to.eql(NEW_NAME);
  });

  it('Get all sub_accounts', async function () {
    return cloudinary.provisioning.account.sub_accounts(true).then((res) => {
      // ensure the cloud we created exists (there might be other clouds there...
      let item = res.sub_accounts.find((subAccount) => {
        return subAccount.id === CLOUD_ID;
      });

      expect(item.id).to.eql(CLOUD_ID);
    }).catch((err) => {
      throw err;
    });
  });

  it('Get a specific sub_account', async function () {
    return cloudinary.provisioning.account.sub_accounts(true, [CLOUD_ID]).then((res) => {
      expect(res.sub_accounts.length).to.eql(1);
    }).catch((err) => {
      throw err;
    });
  });

  it('Get sub_accounts by prefix', async function () {
    return cloudinary.provisioning.account.sub_accounts(true, [], CLOUD_NAME_PREFIX).then((res) => {
      expect(res.sub_accounts.length).to.eql(1);
    }).catch((err) => {
      throw err;
    });
  });

  it('Gets a specific sub_account', async function () {
    return cloudinary.provisioning.account.sub_account(CLOUD_ID).then((res) => {
      expect(res.id).to.eql(CLOUD_ID);
    }).catch((err) => {
      throw err;
    });
  });

  it('Updates a user', async function () {
    let NEW_EMAIL_ADDRESS = `updated+${Date.now()}@cloudinary.com`;

    await cloudinary.provisioning.account.update_user(USER_ID, 'updated', NEW_EMAIL_ADDRESS).then((res) => {
      expect(res.name).to.eql('updated');
      expect(res.email).to.eql(NEW_EMAIL_ADDRESS);
    }).catch((err) => {
      throw err;
    });

    await cloudinary.provisioning.account.user(USER_ID).then((res) => {
      expect(res.id).to.eql(USER_ID);
      expect(res.email).to.eql(NEW_EMAIL_ADDRESS);
    }).catch((err) => {
      throw err;
    });

    await cloudinary.provisioning.account.users().then((res) => {
      let user = res.users.find((userEntry) => {
        return userEntry.id === USER_ID;
      });
      expect(user.id).to.eql(USER_ID);
      expect(user.email).to.eql(NEW_EMAIL_ADDRESS);
    }).catch((err) => {
      throw err;
    });
  });

  it('Gets users in a list of userIDs', async () => {
    await cloudinary.provisioning.account.users(null, [USER_ID]).then((res) => {
      expect(res.users.length).to.eql(1);
    }).catch((err) => {
      throw err;
    });
  });

  it('Updates the user group', async () => {
    let NEW_NAME = `new-test-name_${Date.now()}`;
    let res = await cloudinary.provisioning.account.update_user_group(GROUP_ID, NEW_NAME);
    expect(res.id).to.eql(GROUP_ID);
    let groupData = await cloudinary.provisioning.account.user_group((GROUP_ID));
    expect(groupData.name).to.eql(NEW_NAME);
  });

  it('Adds and remove a user from a group', async () => {
    let res = await cloudinary.provisioning.account.add_user_to_group(GROUP_ID, USER_ID);
    expect(res.users.length).to.eql(1);

    let groupUserData = await cloudinary.provisioning.account.user_group_users((GROUP_ID));
    expect(groupUserData.users.length).to.eql(1);
    //
    let remUserFromGroupResp = await cloudinary.provisioning.account.remove_user_from_group(GROUP_ID, USER_ID);
    expect(remUserFromGroupResp.users.length).to.eql(0);
  });

  it('Tests userGroups in account', async () => {
    let res = await cloudinary.provisioning.account.user_groups();
    let matchedGroup = res.user_groups.find((group) => {
      return group.id === GROUP_ID;
    });

    // Ensure we can find our ID in the list(Which means we got a real list as a response)
    expect(matchedGroup.id).to.eql(GROUP_ID);
  });
});

require('dotenv').load({
  silent: true,
});

const expect = require("expect.js");
const cloudinary = require("../cloudinary");
// const helper = require("./spechelper");

describe('account API - Provisioning', function () {
  let CLOUD_SECRET;
  let CLOUD_API;
  let CLOUD_NAME;
  let CLOUD_ID;
  let USER_NAME = 'SDK TEST';
  let USER_EMAIL = 'sdk-test@cloudinary.com';
  let USER_ROLE = 'billing';
  let USER_ID;
  this.timeout(20000); // TODO change to some constant

  before("Setup the required test", async function () {
    let config = cloudinary.config(true);
    if (!(config.provisioning_api_key && config.provisioning_api_secret && config.account_id)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_ACCOUNT_URL.");
    }

    // Create a sub account(sub cloud)
    let res = await cloudinary.provisioning.account.createSubAccount('jutaname' + Date.now(), 'jutaname' + Date.now(), {}, true).catch((err) => {
      throw err;
    });

    CLOUD_API = res.api_access_keys[0].key;
    CLOUD_SECRET = res.api_access_keys[0].secret;
    CLOUD_NAME = res.api_access_keys.cloud_name;
    CLOUD_ID = res.id;

    let createUser = await cloudinary.provisioning.account.createUser(USER_NAME, USER_EMAIL, USER_ROLE, []).catch((err) => {
      throw err;
    });

    USER_ID = createUser.id;

    // Create a user.
    return true;
  });

  after('Destroy the sub account and user that was created', async () => {
    let delRes = await cloudinary.provisioning.account.deleteSubAccount(CLOUD_ID);
    expect(delRes.message).to.eql('ok');
    let delUserRes = await cloudinary.provisioning.account.deleteUser(USER_ID);
    expect(delUserRes.message).to.eql('ok');
    // delete user
  });

  it('Get all sub accounts', async function () {
    return cloudinary.provisioning.account.subAccounts(true).then((res) => {
      // ensure the cloud we created exists (there might be other clouds there...
      let item = res.sub_accounts.find((subAccount) => {
        return subAccount.id === CLOUD_ID;
      });

      expect(item.id).to.eql(CLOUD_ID);
    }).catch((err) => {
      throw err;
    });
  });

  it('Gets a specific subAccount', async function () {
    return cloudinary.provisioning.account.subAccount(CLOUD_ID).then((res) => {
      expect(res.id).to.eql(CLOUD_ID);
    }).catch((err) => {
      throw err;
    });
  });

  it('Updates a user', async function () {
    await cloudinary.provisioning.account.updateUser(USER_ID, 'updated', 'updated@cloudinary.com').then((res) => {
      expect(res.name).to.eql('updated');
      expect(res.email).to.eql('updated@cloudinary.com');
    }).catch((err) => {
      throw err;
    });

    await cloudinary.provisioning.account.user(USER_ID).then((res) => {
      expect(res.id).to.eql(USER_ID);
      expect(res.email).to.eql('updated@cloudinary.com');
    }).catch((err) => {
      throw err;
    });

    await cloudinary.provisioning.account.users().then((res) => {
      let user = res.users.find((userEntry) => {
        return userEntry.id === USER_ID;
      });
      expect(user.id).to.eql(USER_ID);
      expect(user.email).to.eql('updated@cloudinary.com');
    }).catch((err) => {
      throw err;
    });
  });



  // TODO add test to pass auth as arguments
  // TODO add test to pass auth as config

});

const cloudinary = require("../../../../cloudinary");
const TIMEOUT = require('../../../testUtils/testConstants').TIMEOUT;
let runOnlyForInternalPRs = process.env.TRAVIS_SECURE_ENV_VARS ? describe : describe.skip;


describe.skip('Provisioning API - Access Keys Management', function () {
  let CLOUD_SECRET;
  let CLOUD_API;
  let CLOUD_NAME;
  let CLOUD_ID;
  let CLOUD_NAME_PREFIX = `justaname${process.hrtime()[1] % 10000}`;
  this.timeout(TIMEOUT.LONG);

  before("Setup the required test", async () => {
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

    return true;
  });

  after('Destroy the sub_account and users that were created', async () => {
    // Skip 'after' in case we don't have account configuration available
    // This means that the beforeHook also didn't run
    let config = cloudinary.config(true);
    if (!(config.provisioning_api_key && config.provisioning_api_secret && config.account_id)) {
      return;
    }

    const delRes = await cloudinary.provisioning.account.delete_sub_account(CLOUD_ID);
    expect(delRes.message).to.eql('ok');
  });

  it('List access keys', async () => {
    const accessKeys = await cloudinary.provisioning.account.access_keys(CLOUD_ID);
    expect(Object.keys(accessKeys)).to.eql(['access_keys', 'total']);
    expect(accessKeys.access_keys.length).to.eql(1);
    expect(Object.keys(accessKeys.access_keys[0])).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
  });

  it('Generate new access key', async () => {
    const keyName = `test-access-key-${Date.now()}`
    const newAccessKey = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName });
    expect(Object.keys(newAccessKey)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey.name).to.eql(keyName);
  });

  it('List access keys with optional query params', async () => {
    const keyName1 = `A-test-access-key-${Date.now()}`
    const newAccessKey1 = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName1 });
    expect(Object.keys(newAccessKey1)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey1.name).to.eql(keyName1);

    const keyName2 = `B-test-access-key-${Date.now()}`
    const newAccessKey2 = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName2 });
    expect(Object.keys(newAccessKey2)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey2.name).to.eql(keyName2);

    const keyName3 = `C-test-access-key-${Date.now()}`
    const newAccessKey3 = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName3 });
    expect(Object.keys(newAccessKey3)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey3.name).to.eql(keyName3);

    const pageSize = 2;
    const accessKeys = await cloudinary.provisioning.account.access_keys(CLOUD_ID, {
      page_size: pageSize,
      page: 1,
      sort_by: 'name',
      sort_order: 'desc'
    });
    expect(Object.keys(accessKeys)).to.eql(['access_keys', 'total']);
    expect(accessKeys.access_keys.length).to.eql(pageSize);
    expect(Object.keys(accessKeys.access_keys[0])).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
  });

  it('Update access key', async () => {
    const keyName = `test-access-key-${Date.now()}`
    const newAccessKey = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName });
    expect(Object.keys(newAccessKey)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey.name).to.eql(keyName);

    const newName = `${keyName}-updated`;
    const updatedAccessKey = await cloudinary.provisioning.account.update_access_key(CLOUD_ID, newAccessKey.api_key, { name: newName });
    expect(Object.keys(newAccessKey)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(updatedAccessKey.name).to.eql(newName);
  });

  it('Delete access keys', async () => {
    const keyName = `test-access-key-${Date.now()}`
    const newAccessKey = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName });
    expect(Object.keys(newAccessKey)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey.name).to.eql(keyName);

    const deleteAccessKey = await cloudinary.provisioning.account.delete_access_key(CLOUD_ID, newAccessKey.api_key);
    expect(Object.keys(deleteAccessKey)).to.eql(['message']);
    expect(deleteAccessKey.message).to.eql('ok');
  });

  it('Delete access keys by name', async () => {
    const keyName = `test-access-key-${Date.now()}`
    const newAccessKey = await cloudinary.provisioning.account.generate_access_key(CLOUD_ID, { name: keyName });
    expect(Object.keys(newAccessKey)).to.eql(['name', 'api_key', 'api_secret', 'created_at', 'updated_at', 'enabled']);
    expect(newAccessKey.name).to.eql(keyName);

    const deleteAccessKey = await cloudinary.provisioning.account.delete_access_key_by_name(CLOUD_ID, { name: keyName });
    expect(Object.keys(deleteAccessKey)).to.eql(['message']);
    expect(deleteAccessKey.message).to.eql('ok');
  });
});

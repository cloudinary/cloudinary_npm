
const cloudinary = require("../../cloudinary.js");


describe("config", function () {
  let cloudinaryUrlBackup;
  let accountUrlBackup;
  before(function () {
    cloudinaryUrlBackup = process.env.CLOUDINARY_URL;
    accountUrlBackup = process.env.CLOUDINARY_ACCOUNT_URL;
  });

  after(function () {
    process.env.CLOUDINARY_URL = cloudinaryUrlBackup || '';
    process.env.CLOUDINARY_ACCOUNT_URL = accountUrlBackup || '';
    cloudinary.config(true);
  });


  it("should allow nested values in CLOUDINARY_URL", function () {
    process.env.CLOUDINARY_URL = "cloudinary://key:secret@test123?foo[bar]=value";
    cloudinary.config(true);
    const foo = cloudinary.config().foo;
    expect(foo && foo.bar).to.eql('value');
  });

  it("should load a properly formatted CLOUDINARY_URL", function () {
    process.env.CLOUDINARY_URL = "cloudinary://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should not be sensitive to case in CLOUDINARY_URL's protocol", function () {
    process.env.CLOUDINARY_URL = "CLouDiNaRY://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should throw error when CLOUDINARY_URL doesn't start with 'cloudinary://'", function () {
    process.env.CLOUDINARY_URL = "https://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test?cloudinary=foo";
    try {
      cloudinary.config(true);
      expect().fail();
    } catch (err) {
      expect(err.message).to.eql("Invalid CLOUDINARY_URL protocol. URL should begin with 'cloudinary://'");
    }
  });

  it("should not throw an error when CLOUDINARY_URL environment variable is missing", function () {
    delete process.env.CLOUDINARY_URL;
    cloudinary.config(true);
  });

  it("should allow nested values in CLOUDINARY_ACCOUNT_URL", function () {
    process.env.CLOUDINARY_ACCOUNT_URL = "account://key:secret@test123?foo[bar]=value";
    cloudinary.config(true);
    const foo = cloudinary.config().foo;
    expect(foo && foo.bar).to.eql('value');
  });

  it("should load a properly formatted CLOUDINARY_ACCOUNT_URL", function () {
    process.env.CLOUDINARY_ACCOUNT_URL = "account://635412789012345:ALKJdjklLJAjhkKJ45hBK92tam2@test1";
    cloudinary.config(true);
  });

  it("should not be sensitive to case in CLOUDINARY_ACCOUNT_URL's protocol", function () {
    process.env.CLOUDINARY_ACCOUNT_URL = "aCCouNT://635283989012345:ALKGssklLJAjhkKJ45hBK92tas5@test1";
    cloudinary.config(true);
  });

  it("should throw error when CLOUDINARY_ACCOUNT_URL doesn't start with 'account://'", function () {
    process.env.CLOUDINARY_ACCOUNT_URL = "https://635283989012345:ALKGssklLJAjhkKJ45hBK92tas5@test1?account=foo";
    try {
      cloudinary.config(true);
      expect().fail();
    } catch (err) {
      expect(err.message).to.eql("Invalid CLOUDINARY_ACCOUNT_URL protocol. URL should begin with 'account://'");
    }
  });

  it("should not throw an error when CLOUDINARY_ACCOUNT_URL environment variable is missing", function () {
    delete process.env.CLOUDINARY_ACCOUNT_URL;
    cloudinary.config(true);
  });
});

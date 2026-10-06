const assert = require('assert');
const sinon = require('sinon');
const { Readable, Writable } = require('stream');
const https = require('https');

const cloudinary = require('../../cloudinary');
const createTestConfig = require('../testUtils/createTestConfig');

// Keep the bytes of the last request body.
let sentChunks = [];

function sentBody() {
  return Buffer.concat(sentChunks);
}

// Give each request a fake HTTP 500 response. No network call occurs.
function fakeErrorRequest(options, onResponse) {
  sentChunks = [];
  const request = new Writable({
    write(chunk, encoding, done) {
      sentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      done();
    }
  });
  request.setTimeout = () => request;
  request.abort = () => {};
  request.on('finish', () => {
    const response = new Readable({
      read() {}
    });
    response.statusCode = 500;
    response.headers = {};
    onResponse(response);
    response.push('{"error":{"message":"boom"}}');
    response.push(null);
  });
  return request;
}

describe('upload of a Blob', function () {
  let requestStub;

  before(function () {
    if (typeof Blob === 'undefined') {
      this.skip();
    }
  });

  beforeEach(function () {
    cloudinary.config(createTestConfig());
    requestStub = sinon.stub(https, 'request').callsFake(fakeErrorRequest);
  });

  afterEach(function () {
    requestStub.restore();
  });

  it('should call the callback one time when the upload fails', async function () {
    const callback = sinon.spy();
    const blob = new Blob(['sample'], { type: 'text/plain' });

    await assert.rejects(cloudinary.v2.uploader.upload(blob, callback), { message: 'boom' });

    sinon.assert.calledOnce(callback);
    sinon.assert.calledWith(callback, sinon.match({ message: 'boom', http_code: 500 }));
  });

  it('should use the options that were set when upload() was called', async function () {
    const options = { public_id: 'first' };
    const promise = cloudinary.v2.uploader.upload(new Blob(['sample']), options);
    options.public_id = 'second';
    await promise.catch(() => {});

    const body = sentBody().toString('utf8');
    assert.ok(body.includes('name="public_id"\r\n\r\nfirst\r\n'));
    assert.ok(!body.includes('second'));
  });

  it('should upload a Blob-like object that has no stream()', async function () {
    const blobLike = {
      arrayBuffer: () => Promise.resolve(new Uint8Array(Buffer.from('shape-bytes')).buffer),
      size: 11,
      type: 'text/plain',
      name: 'shape.txt'
    };
    await cloudinary.v2.uploader.upload(blobLike).catch(() => {});

    const body = sentBody().toString('utf8');
    assert.ok(body.includes('filename="shape.txt"\r\nContent-Type: text/plain\r\n\r\nshape-bytes\r\n--'));
  });

  it('should reject with { error } when the Blob cannot be read', async function () {
    const callback = sinon.spy();
    const readError = new Error('read failed');
    const blobLike = {
      arrayBuffer: () => Promise.reject(readError),
      size: 1,
      type: ''
    };

    await assert.rejects(cloudinary.v2.uploader.upload(blobLike, callback), (error) => error.error === readError);
    sinon.assert.calledOnce(callback);
    // The v2 callback gets the error itself, as for a file that cannot be read.
    sinon.assert.calledWith(callback, readError);
  });

  it('should throw synchronously when cloud_name is missing', function () {
    delete cloudinary.config().cloud_name;
    try {
      assert.throws(() => cloudinary.v2.uploader.upload(new Blob(['sample'])), /Must supply cloud_name/);
      assert.throws(() => cloudinary.v2.uploader.upload(Buffer.from('sample')), /Must supply cloud_name/);
    } finally {
      cloudinary.config(true);
    }
  });

  it('should escape the filename and send the header as UTF-8', async function () {
    const names = {
      'a"b\r\nX-Injected: 1.png': 'a%22b%0D%0AX-Injected: 1.png',
      'zdjęcie.png': 'zdjęcie.png',
      '日本.png': '日本.png'
    };
    for (const [name, expected] of Object.entries(names)) {
      // eslint-disable-next-line no-await-in-loop
      await cloudinary.v2.uploader.upload(Buffer.from('x'), { filename: name }).catch(() => {});
      const body = sentBody();
      assert.ok(body.includes(Buffer.from(`filename="${expected}"\r\n`, 'utf8')), name);
      assert.ok(!body.includes('\r\nX-Injected'), name);
    }
  });

  it('should stream a native Blob and send all of its bytes', async function () {
    if (typeof Blob.prototype.stream !== 'function' || typeof Readable.fromWeb !== 'function') {
      this.skip();
    }
    const bytes = require('crypto').randomBytes(256 * 1024);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const arrayBufferSpy = sinon.spy(blob, 'arrayBuffer');
    await cloudinary.v2.uploader.upload(blob).catch(() => {});

    sinon.assert.notCalled(arrayBufferSpy);
    const body = sentBody();
    const header = Buffer.from('Content-Type: application/pdf\r\n\r\n');
    const start = body.indexOf(header) + header.length;
    assert.ok(body.subarray(start, start + bytes.length).equals(bytes));
    assert.strictEqual(body.subarray(start + bytes.length, start + bytes.length + 4).toString(), '\r\n--');
  });

  it('should send only the bytes of a Uint8Array view', async function () {
    const source = Buffer.from('xxHELLOyy');
    const view = new Uint8Array(source.buffer, source.byteOffset + 2, 5);
    await cloudinary.v2.uploader.upload(view).catch(() => {});

    assert.ok(sentBody().toString('utf8').includes('\r\n\r\nHELLO\r\n--'));
  });
});

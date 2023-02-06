const cloudinary = require('../../../../cloudinary');
const {TIMEOUT} = require('../../../testUtils/testConstants');
const describe = require('../../../testUtils/suite');
const wait = require('../../../testUtils/helpers/wait');

const folderNames = ['testFolder1', 'testFolder2'];

describe('search_folders_api', function () {
  describe('unit', function () {
    it('should create empty json', function () {
      const query = cloudinary.v2.search_folders.instance().to_query();
      expect(query).to.eql({});
    });

    it('should always return same object in fluent interface', function () {
      const instance = cloudinary.v2.search_folders.instance();
      const searchOptions = [
        'expression',
        'sort_by',
        'max_results',
        'next_cursor',
        'aggregate',
        'with_field'
      ];
      searchOptions.forEach(method => expect(instance).to.eql(instance[method]('emptyarg')));
    });

    it('should correctly transform whole query into search payload', function () {
      const query = cloudinary.v2.search_folders
        .expression('expression-key:expression-value')
        .sort_by('sort_by_field', 'asc')
        .max_results(1)
        .next_cursor('next_cursor')
        .aggregate('aggregate1').aggregate('aggregate2')
        .with_field('field1').with_field('field2')
        .to_query();

      expect(query).to.eql({
        expression: 'expression-key:expression-value',
        sort_by: [{sort_by_field: 'asc'}],
        max_results: 1,
        next_cursor: 'next_cursor',
        aggregate: ['aggregate1', 'aggregate2'],
        with_field: ['field1', 'field2']
      })
    });
  });

  describe('integration', function () {
    this.timeout(TIMEOUT.LONG);

    before(function () {
      return Promise.all(folderNames.map(folderName => {
        return cloudinary.v2.api.create_folder(folderName);
      })).then(wait(2));
    });

    after(function () {
      return Promise.all(folderNames.map(folderName => {
        return cloudinary.v2.api.delete_folder(folderName);
      }));
    });

    it('should return a search response with folders', function () {
      return cloudinary.v2.search_folders.expression('name=testFolder*')
        .execute()
        .then(function (results) {
          expect(results).to.have.key('folders');
        });
    });
  });
});

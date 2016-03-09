var request = require('supertest');
var rootApp = require('./proj');

var adapter = function(done, cb) {
    return function(err, res) {
        if (err) {
            done.fail(err);
        } else {
            try {
                cb(res);
                done();
            } catch (err) {
                done.fail(err);
            }
        }
    }
};

describe('test proj', function() {
    it('GET /', function(done) {
        request(rootApp)
            .get('/')
            .expect(200)
            .end(adapter(done, function(res) {
                expect(res.text).toMatch('### template: proj/templates/base.html ###');
                expect(res.text).toMatch('### block: header, template: proj/templates/index.html ###');
                expect(res.text).toMatch('### block: content, template: proj/templates/index.html ###');
            }));
    });
});


describe('test app', function() {
    it('GET /app', function(done) {
        request(rootApp)
            .get('/app')
            .expect(200)
            .end(adapter(done, function(res) {
                expect(res.text).toMatch('### template: proj/templates/base.html ###');
                expect(res.text).toMatch('### block: header, template: proj/app/templates/app/index.html ###');
                expect(res.text).toMatch('### block: content, template: proj/app/templates/app/index.html ###');
            }));
    });

    it('GET /app/filter', function(done) {
        request(rootApp)
            .get('/app/filter')
            .expect(200)
            .end(adapter(done, function(res) {
                expect(res.text).toMatch('### template: proj/templates/base.html ###');
                expect(res.text).toMatch('### block: header, template: proj/app/templates/app/index.html ###');
                expect(res.text).toMatch('SnAkE');
            }));
    });

    it('GET /app/override', function(done) {
        request(rootApp)
            .get('/app/override')
            .expect(200)
            .end(adapter(done, function(res) {
                expect(res.text).toMatch('### template: proj/templates/base.html ###');
                expect(res.text).toMatch('### block: header, template: proj/templates/app/override.html ###');
                expect(res.text).toMatch('### block: content, template: proj/templates/app/override.html ###');
            }));
    });
});

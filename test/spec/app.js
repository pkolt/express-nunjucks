var util = require('util');
var request = require('request');

var SERVER_PORT = 8000;


function url(str) {
    return util.format('http://localhost:%s%s', SERVER_PORT, str || '');
}

describe('test app', function() {
    var server;

    beforeEach(function() {
        var app = require('../mysite');
        server = app.listen(SERVER_PORT);
    });

    afterEach(function() {
        server.close();
    });

    it('basic template', function(done) {
        request(url('/'), function(err, res, body) {
            if (err) {
                done.fail(err);
            } else {
                expect(res.statusCode).toEqual(200);
                expect(body).toMatch(/<!-- mysite\/templates\/base.html -->/);
                expect(body).toMatch(/<!-- mysite\/templates\/page.html -->/);
                done();
            }
        });
    });

    it('base template inheritance', function(done) {
        request(url('/app1'), function(err, res, body) {
            if (err) {
                done.fail(err);
            } else {
                expect(res.statusCode).toEqual(200);
                expect(body).toMatch(/<!-- mysite\/templates\/base.html -->/);
                expect(body).toMatch(/<!-- mysite\/app1\/templates\/app1\/page.html -->/);
                done();
            }
        });
    });

    it('add custom filter', function(done) {
        request(url('/app1/snake'), function(err, res, body) {
            if (err) {
                done.fail(err);
            } else {
                expect(res.statusCode).toEqual(200);
                expect(body).toMatch(/NuNjUcKs/);
                done();
            }
        });
    });

    it('override application template', function(done) {
        request(url('/app2'), function(err, res, body) {
            if (err) {
                done.fail(err);
            } else {
                expect(res.statusCode).toEqual(200);
                expect(body).toMatch(/<!-- mysite\/templates\/base.html -->/);
                expect(body).toMatch(/<!-- mysite\/templates\/app2\/page.html -->/);
                done();
            }
        });
    });
});

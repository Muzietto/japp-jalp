(function() {
  'use strict';

  define(['promizzes2b', 'chai', 'utils'], function(promizzes, chai, utils) {
    var expect  = chai.expect;
    var promise = promizzes.promise;
    var fulfill = promizzes.fulfill;
    var depend  = promizzes.depend;
    var ajax = utils.ajax;
    var request = utils.request;

    describe('a promises system identical to what Quildreen did', function() {

      it('does ajax straight away', function(done) {
        var data = ajax('http://localhost:8080/json/user.json');
        var expectation = depend(data, expected({"name":"Marco","age":53,"town":"milano"}));
        depend(expectation, execute(done));
      });

      it('does chained ajax', function(done) {
        var data = ajax('http://localhost:8080/json/user.json');
        var expectation1 = depend(data, function(_) {
          return ajax('http://localhost:8080/json/' + data.value.town + '.json');
        });
        var expectation2 = depend(expectation1, expected({"name":"Milano","population":1500000}));
        depend(expectation2, execute(done));
      });

      xit('does ajax when url is resolved', function(done) {
        var req = request();
        var data = depend(req, expected('http://localhost:8080/json/user.json'));
        var expectation2 = depend(data, expected('{"name":"Marco","age":53,"town":"milano"}'));
        depend(expectation2, execute(done));
        fulfill(req, 'http://localhost:8080/json/user.json');
      });

      function expected(expected) {
        return function(actual) {
          var result = promise();
          expect(actual).to.be.eql(expected);
          console.log('promizzes2b test: ' + ((typeof actual === 'string') ? actual : JSON.stringify(actual)));
          fulfill(result, actual);
          return result;
        };
      }

      function execute(cb) {
        return function executor(_) {
          var result = promise();
          fulfill(result, cb());
          return result;
        };
      }

      it('builds a simple chain', function(done) {

        var sidePromise = promise();
        var makeArea = function(sideVal) {
          var result = promise();
          fulfill(result, sideVal * sideVal);
          return result;
        }
        var printStuff = function(stuffVal) {
          var result = promise();
          expect(stuffVal).to.be.equal(25);
          fulfill(result, console.log('promizzes2 test: ' + stuffVal));
          return result;
        }
        var beDone = function(_) {
          var result = promise();
          fulfill(result, done());
          return result;
        }

        // depend(promise, fapb) // fapb :: a -> promise b
        var areaPromise = depend(sidePromise, makeArea);
        var printPromise = depend(areaPromise, printStuff);

        fulfill(sidePromise, 5);
        var donePromise = depend(printPromise, beDone);
      });
    });
  });
})();
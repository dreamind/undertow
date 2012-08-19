var _ = require('./undertow');
var assert = require('chai').assert;

var getterCases = [
  "k1",
  ["k2", "k21"],
  ["k2", "k22", 0]
];

var obj1 = {
  k1: "k1",
  k2: {
    k21: "k2-k21",
    k22: ["k2-k22-0", "k2-k22-1"]
  }
}

var translators1 = [
  { "getter": ["k2", "k21"], "setter": "k2-k21" },
  { "getter": "k1" },
  { "getter": ["k2", "k22", 0], "setter": "k2-k22-0" },
  { "getter": ["k2", "k22", 1], "setter": "k2-k22-1" }
];

describe('undertow', function(){

  describe('#typeOf()', function(){

    it('should detect array type', function() { assert.equal(_.typeOf([1,2,3]), 'array'); });
    it('should detect object type', function() { assert.equal(_.typeOf({a: 7, b:[1,2,3]}), 'object'); });
    it('should detect number/float type', function() { assert.equal(_.typeOf(2.5), 'number'); });
    it('should detect number/int type', function() { assert.equal(_.typeOf(124), 'number'); });
    it('should detect string type', function() { assert.equal(_.typeOf('word'), 'string'); });
    it('should detect regex type', function() { assert.equal(_.typeOf(/abc.+/), 'regexp'); });
    it('should detect function type', function() { assert.equal(_.typeOf(function(){}), 'function'); });
    it('should detect boolean type', function() { assert.equal(_.typeOf(true), 'boolean'); });
    // tested in qunit
    // it('should detect undefined type', function() { assert.equal(_.typeOf(x74y), 'undefined'); });
    it('should detect null type', function() {
      var x = null;
      assert.equal(_.typeOf(x), 'null');
    });
  });

  describe('#xf()', function() {
    // inject an object into function object
    
    function f(a) {
      return this.injected + a;
    };
    var f2 = _.xf(f, {injected: 9});

    it('should be able to inject object', function() {
      assert.equal(f2.injected, 9);
    });
    it('should be able to use the injected value', function() {
      assert.equal(f2(7), 16);
    });
  });

  describe('#strJoin()', function() {
    it('should return joined string', function(){
      assert.equal(_.strJoin(['1','2','3'], '"'), '"1","2","3"');
      assert.equal(_.strJoin(['1','2','3'], ''), '1,2,3');
      assert.equal(_.strJoin(['1','2','3'], "'"), "'1','2','3'");
    });
  });

  describe('#traverse()', function() {

    it('should return the value of existing keys', function(){
      assert.equal(_.traverse(obj1, ["k2", "k21"]), "k2-k21");
    });
    it('should return null for non-existing keys', function(){
      assert.equal(_.traverse(obj1, ["k2", "k3"]), null);
    });
    it('should return null for non-existing keys', function(){
      var obj = {}, create = true;
      var newAttr = _.traverse(obj, ["k2", "k23"], create)
      assert.deepEqual(newAttr, {});
      newAttr.k231 = 'k2-k23-k231';
      assert.deepEqual(obj, {
        k2: {
          k23: {
            k231: 'k2-k23-k231'
          }
        }
      });      
    });
  });

  describe('#read()', function() {

    it('should return the value of existing keys', function(){
      assert.equal(_.read(obj1, ["k2", "k21"]), "k2-k21");
    });
    it('should return default for non-existing keys', function(){
      assert.equal(_.read(obj1, ["k2", "k3"], 'default'), 'default');
      assert.equal(_.traverse(obj1, ["k2", "k3"]), null); // non invasive
    });
  });

  describe('#cloneDeep()', function() {
    it('should return deep-equally clone', function(){
      assert.deepEqual(_.cloneDeep(obj1), obj1);      
    });
    it('should return clone of different instance', function(){
      assert.notStrictEqual(_.cloneDeep(obj1), obj1);
    });
  });

  describe('#update()', function() {
    var obj = _.cloneDeep(obj1);
    it('should update the value of existing keys', function(){
      assert.equal(_.update(obj, ["k2", "k21"], "k2-k21-new"), "k2-k21-new");
      assert.equal(_.read(obj, ["k2", "k21"]), "k2-k21-new");
    });
    it('should update the value of non-existing keys', function(){
      assert.equal(_.update(obj, ["k2", "k3"], 'k23'), 'k23');
      assert.equal(_.read(obj, ["k2", "k3"]), 'k23');
    });
  });

  describe('#remove()', function() {
    var obj = _.cloneDeep(obj1);
    it('should remove existing keys', function(){
      assert.equal(_.remove(obj, ["k2", "k21"]), true);
      assert.equal(_.read(obj, ["k2", "k21"]), null);

      var objx = {1:2, 3:4};
      assert.equal(_.remove(objx, [1]), true);
      assert.deepEqual(objx, {3:4});      
    });
    it('should not remove non-existing keys', function(){
      assert.equal(_.remove(obj, ["k2", "k24"]), false);
    });
  });

  describe('#getterx()', function(){
    for (var i = 0; i < getterCases.length; i++) {
      var c = getterCases[i];
      var f = _.getterx(c);
      var o = (typeof c == 'string') ? [c] : c; // make array
      o = o.join('-');
      it('should return '+o+' for case '+c.toString(), function(){
        assert.deepEqual(o, f(obj1));
      });
    }
  });

  describe('#translate()', function(){
    var translatefs = _.translatorx(translators1);
    var obj2 = _.translate(obj1, {}, translatefs);
    var obj3 = {
      'k1': "k1",
      'k2-k21': "k2-k21",
      'k2-k22-0': "k2-k22-0",
      'k2-k22-1': "k2-k22-1"
    };
    
    it('should return '+obj3+' for '+translators1, function(){
      assert.deepEqual(obj3, obj2);
    })
  });

})
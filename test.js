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
};

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
    }
    var f2 = _.xf(f, {injected: 9});

    it('should be able to inject object', function() {
      assert.equal(f2.injected, 9);
    });
    it('should be able to use the injected value', function() {
      assert.equal(f2(7), 16);
    });
  });

  describe('#join3()', function() {
    it('should return joined string - double quote, default sep', function(){
      assert.equal(_.join3(['1','2','3'], null, '"'), '"1","2","3"');
    });
    it('should return joined string - no quote, default sep', function(){
      var rows = [
            ['josh', 7, 'male', {origin: 'id'}]
          , ['luca', 8, 'male', {origin: 'it'}]
          ];
      assert.equal(_.join3(rows, [3, 'origin'], ['<', '>'], ':'), '<id>:<it>');
    });
    it('should return joined string - single quote, bar sep', function(){
      var rows = [
            { name: 'josh', age: 7 }
          , { name: 'luca', age: 8 }
          ];
      assert.equal(_.join3(rows, 'age', "'", '|'), "'7'|'8'");
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
      var obj = {}, create = true
        , newAttr = _.traverse(obj, ["k2", "k23"], create);
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

  describe('#update2()', function() {

    it('should work for obj and array combination, new keys', function(){
      var obj = {}, create = true;
      assert.deepEqual(_.update2(obj, ["k2", 0], 'k20', create), {
        k2: ['k20']
      });      
    });
    it('should work for obj and array combination, existing keys', function(){
      var obj = {
          'k1': [1, 2, 3]
        }
        , create = true;
      assert.deepEqual(_.update2(obj, ["k1", 1], 'k12', create), {
          'k1': [1, 'k12', 3]
        });      
    });
    it('should work for obj, new keys', function(){
      var obj = {}, create = true;
      assert.deepEqual(_.update2(obj, ["k2", 'k21'], 'k21', create), {
        k2: {
          k21: 'k21'
        }
      });      
    });
    it('should work for obj, existing keys', function(){
      var obj = {
          k2: {
            k21: 'xxx'
          }
        }
        , create = true;
      assert.deepEqual(_.update2(obj, ["k2", 'k21'], 'k21', create), {
        k2: {
          k21: 'k21'
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

  describe('#add()', function() {
    it('should add to an empty set', function(){
      var obj = {};
      assert.deepEqual(_.add(obj, 'a'), {a: 1});      
    });
    it('should add to an existing set', function(){
      var obj = {a: 1};
      assert.deepEqual(_.add(obj, 'a'), {a: 1});
      assert.deepEqual(_.add(obj, 'b'), {a: 1, b: 1});      
    });
  });

  describe('#concatDeep()', function() {
    var a1 = [1, { "two": 2 }]
      , a2 = [{ "three": 3 }]
      , a3 = [1, { "two": 2 }, { "three": 3 }];

    it('should return concatenated arrays', function(){
      assert.deepEqual(_.concatDeep(a1, a2), a3);      
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

  describe('#extendDeep()', function() {
    var a1 = { 1: 'one', 't2': { "two": 2 } }
      , a2 = { "three": 3, 4: [5, 6] }
      , a3 = { 1: 'one', 't2': { "two": 2 }, "three": 3, 4: [5, 6] };

    it('should return deep applied object', function(){
      assert.deepEqual(_.extendDeep(a1, a2), a3);      
    });
  });

  describe('#getterx()', function(){
    var genf = function (o, f) {
      return function(){
        assert.deepEqual(o, f(obj1));
      };
    };

    for (var i = 0; i < getterCases.length; i++) {
      var c = getterCases[i]
        , f = _.getterx(c)
        , o = (typeof c == 'string') ? [c] : c; // make array
      o = o.join('-');
      it('should return '+o+' for case '+c.toString(), genf(o, f));
    }
  });

  describe('#cull()', function() {
    // function (obj, getter)
    it('should pluck by using simple key', function(){
      assert.equal(_.cull({'key': 777}, 'key'), 777);
    });
    it('should pluck by using an array of keys', function(){
      assert.equal(_.cull({'key': [1, {'two': 222}]}, ['key', 1, 'two']), 222);
    });
    it('should pluck by using a function', function(){
      assert.equal(_.cull({'key': [2, {'two': 222}]}, function(obj){ return obj.key[0]*4; }), 8);
    });
  });

  describe('#extract()', function() { // pluck2: function(obj, accessors)
    var obj = {
          key: 777
        , k2: [2, {'two': 222}]
        }
      , accessors = [
          { getter: 'key' }
        , { getter: ['k2', 1, 'two'] }
        , { getter: function(obj){ return obj.k2[0]*4; } }
        ];
      
    it('should pluck by using a function', function(){
      assert.deepEqual(_.extract(obj, accessors), [777, 222, 8]);
    });
  });

  describe('#hashify3()', function() { // function(rows, accessors)

    it('should hashify by using a getter', function(){

      var rows = [
        { "attributeName": "LGA_CODE",
          "attributeInclude": true,
          "attributeComments": "LGA Code"
        }
      , { "attributeName": "LGA_NAME",
          "attributeInclude": true,
          "attributeComments": "LGA Name"
        }
      , { "attributeName": "STE_NAME",
          "attributeInclude": true,
          "attributeComments": "State Name"
        }
      ];
      assert.deepEqual(_.hashify3(rows, "attributeName"), {
        "LGA_CODE": rows[0]
      , "LGA_NAME": rows[1]
      , "STE_NAME": rows[2]
      });
    });

    it('should pluck by using a function', function(){
      var rows = {
            'josh' : [7, 'male', {origin: 'id'}]
          , 'luca' : [8, 'male', {origin: 'it'}]
          }
        , accessors = [
            { getter: 0 }
          , { getter: [2, 'origin'] }
          ];
      assert.deepEqual(_.extract3(rows, accessors), {
        'josh': [7, 'id']
      , 'luca': [8, 'it']
      });
    });
  });

  describe('#pluck3()', function() { // function(rows, accessors)

    it('should pluck', function(){
      var rows = [
            { name: 'josh', age: { unit: 'year', val: 7 } , sex: 'male'}
          , { name: 'luca', age: { unit: 'year', val: 8 }, sex: 'male'}
          ]
        , getter = ['age', 'val'];

      assert.deepEqual(_.pluck3(rows, getter), [7, 8]);
    });

  });

  describe('#extract3()', function() { // function(rows, accessors)

    it('should extract by using a function', function(){
      var rows = [
            { name: 'josh', age: 7, sex: 'male'}
          , { name: 'luca', age: 8, sex: 'male'}
          ]
        , accessors = [
            { getter: 'name' }
          , { getter: 'age' }
          ];

      assert.deepEqual(_.extract3(rows, accessors), [
        ['josh', 7]
      , ['luca', 8]
      ]);
    });

    it('should extract by using a function', function(){
      var rows = {
            'josh' : [7, 'male', {origin: 'id'}]
          , 'luca' : [8, 'male', {origin: 'it'}]
          }
        , accessors = [
            { getter: 0 }
          , { getter: [2, 'origin'] }
          ];
      assert.deepEqual(_.extract3(rows, accessors), {
        'josh': [7, 'id']
      , 'luca': [8, 'it']
      });
    });
  });


  describe('#grab3()', function() { 

    it('should grab a list', function(){
      var rows = [
            { name: 'josh', age: 7, sex: 'male'}
          , { name: 'luca', age: 8, sex: 'male'}
          ]
        , getters = ['name', 'age'];

      assert.deepEqual(_.grab3(rows, getters), [
        ['josh', 7]
      , ['luca', 8]
      ]);
      assert.deepEqual(_.grab3(rows, 'name', 'age'), [
        ['josh', 7]
      , ['luca', 8]
      ]);
    });
    
    it('should grab a dictionary', function(){
      var rows = {
            'josh' : [7, 'male', {origin: 'id'}]
          , 'luca' : [8, 'male', {origin: 'it'}]
          }
        , getters = [0, [2, 'origin']];
      assert.deepEqual(_.grab3(rows, getters), {
        'josh': [7, 'id']
      , 'luca': [8, 'it']
      });
    });
  });

  describe('#pick3()', function() { 

    it('should pick a list', function(){
      var rows = [
            { name: 'josh', age: 7, sex: 'male'}
          , { name: 'luca', age: 8, sex: 'male'}
          ]
        , keys = ['name', 'age'];

      assert.deepEqual(_.pick3(rows, keys), [
        { name: 'josh', age: 7 }
      , { name: 'luca', age: 8 }
      ]);
      assert.deepEqual(_.pick3(rows, 'name', 'age'), [
        { name: 'josh', age: 7 }
      , { name: 'luca', age: 8 }
      ]);
    });
    
    it('should pick a dictionary', function(){
      var rows = {
            'josh' : { age: 7, sex: 'male' }
          , 'luca' : { age: 8, sex: 'male' }
          }
        , keys = ['age'];
      assert.deepEqual(_.pick3(rows, keys), {
        'josh': { age: 7 }
      , 'luca': { age: 8 }
      });
    });
  });


  describe('#matchObject()', function() { 

    it('should matchObject a list', function(){
      var rows = [
            { name: 'josh', age: 7, sex: 'male' }
          , { name: 'luca', age: 8, sex: 'male' }
          ]
        , obj1 = { name: 'josh', age: 7, sex: 'male' }
        , obj2 = { sex: 'male' }
        , exact = 1
        , results;

      results = _.matchObject(rows, obj1, exact);
      assert.deepEqual(results, [
        rows[0]
      ]);
      assert.strictEqual(results[0], rows[0]);
      exact = 0;
      assert.deepEqual(_.matchObject(rows, obj2, exact), rows);
    });
    
    it('should matchObject a dictionary', function(){
      var rows = {
            'josh' : { age: 7, sex: 'male' }
          , 'luca' : { age: 8, sex: 'male' }
          }
        , obj1 = { age: 9 }
        , obj2 = { age: 8 }
        , exact = 0;

      assert.deepEqual(_.matchObject(rows, obj1, exact), {});
      exact = 1;
      assert.deepEqual(_.matchObject(rows, obj2, exact), {});
      exact = 0;
      assert.deepEqual(_.matchObject(rows, obj2, exact), {
        'luca': rows['luca']
      });
    });
  });

  describe('#match1()', function() { 
    var rows = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , { id: 'senior', age: 88, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        ]
      , matchers, exact; 

    it('should match1 a list 1', function() {
      var matchers = [
            {"getter": "age", "valuer": 8},
            {"getter": ["name", "last"], "valuer": ["posh", "caine"], "exact":0 }
          ]
        , matcherfs = _.matcherx(matchers), all;

      all = 1;
      assert.isFalse(_.match1(rows[0], matcherfs, all));
      assert.isTrue(_.match1(rows[1], matcherfs, all));
      assert.isFalse(_.match1(rows[2], matcherfs, all));
      all = 0;
      assert.isTrue(_.match1(rows[0], matcherfs, all));
      assert.isTrue(_.match1(rows[1], matcherfs, all));
      assert.isTrue(_.match1(rows[2], matcherfs, all));

    });
    
    it('should match1 a list 2', function() {
      var matchers = [
            {"getter": "age", "valuer": function (val) { return val <= 8; } },
            {"getter": ["name", "last"], "valuer": ["caine", "buddy"], "exact": 0  }
          ]
        , matcherfs = _.matcherx(matchers), all;
      all = 1;
      assert.isFalse(_.match1(rows[0], matcherfs, all), 'case 1');
      assert.isTrue(_.match1(rows[1], matcherfs, all), 'case 2');
      assert.isFalse(_.match1(rows[2], matcherfs, all), 'case 3');
      all = 0;
      assert.isTrue(_.match1(rows[0], matcherfs, all), 'case 4');
      assert.isTrue(_.match1(rows[1], matcherfs, all), 'case 5');
      assert.isFalse(_.match1(rows[2], matcherfs, all), 'case 6');
    });
    
    /*
    it('should match1 a list 3', function() {
      matchers = [
        {"getter": "id", "valuer": /j.+/},
        {"getter": "name", "valuer": {
            first: 'josh'
          , last: 'posh'
          }
        }
      ];
      exact = 1;
      assert.deepEqual(_.matchMatchers(rows, matchers, exact), [
        rows[0]
      ]);
    });*/

  });


  describe('#matchMatchers()', function() { 
    var rows = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , { id: 'senior', age: 88, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        ]; 

    it('should matchMatcher a list 1', function() {
      var matchers = [
        {"getter": "age", "valuer": 8},
        {"getter": ["name", "last"], "valuer": ["posh", "caine"], "exact": 0 }
      ], all = 1;
      assert.deepEqual(_.matchMatchers(rows, matchers, all), [
        rows[1]
      ]);
    });

    it('should matchMatcher a list 2', function() {
      var matchers = [
        {"getter": "age", "valuer": function (val) { return val <= 8; }},
        {"getter": ["name", "last"], "valuer": ["caine"], "exact": 0 }
      ], all;
      all = 0;
      assert.deepEqual(_.matchMatchers(rows, matchers, all), [
        rows[0]
      , rows[1]
      ]);
    });
    
    it('should matchMatcher a list 3', function() {
      var matchers = [
        {"getter": "id", "valuer": /j.+/},
        {"getter": "name", "valuer": {
            first: 'josh'
          , last: 'posh'
          }
        }
      ], all;
      all = 1;
      assert.deepEqual(_.matchMatchers(rows, matchers, all), [
        rows[0]
      ]);
    });
  });

/*  , matchMatchers: function(rows, matchers, flag) {
      var isArray = _.isArray(rows)
        , result = (isArray) ? []: {}
        , matcherfs = matcherx(matchers, flag);

      _.each(rows, function(row, index) {      
        if (match1(row, matcherfs, flag)) {          
          result[(isArray) ? result.length : index] = row;
        }
      });
      return result;
    },

    /**
     * Perform complex matching
     *
     * @param {Object} obj Object to be match
     * @param {Object} cmatcher Complex matcher
     * @param {Boolean} flag 1 for exact match otherwise
     *   use partial match
     *
     * Complex matcher:
     *
     * [ {"getter": "age", "valuer": 24},
     *   {"getter": ["name", "last"], "valuer": ["doe", "lee"] },
     *   {"getter": "prop", "valuer": {object} },
     *   {"getter": { 'dojox.json.query': '$.email.[0]' } , "valuer": /.+@gmail.com/},
     *   {"getter": { 'dojox.json.query': '$.x.y' } , "valuer": function(value) {} },
     * ]
     *
     */



  describe('#translate1()', function() {

    var obj1 = {
      k1: "k1",
      k2: {
        k21: "k2-k21",
        k22: ["k2-k22-0", "k2-k22-1"]
      }
    };
    
    var translators1 = [
      { "getter": ["k2", "k21"], "setter": "k2-k21" },
      { "getter": "k1" },
      { "getter": ["k2", "k22", 0], "setter": "k2-k22-0" },
      { "getter": ["k2", "k22", 1], "setter": "k2-k22-1" }
    ];

    var translatefs = _.translatorx(translators1);
    var obj2 = _.translate1(obj1, {}, translatefs);
    var obj3 = {
      'k1': "k1",
      'k2-k21': "k2-k21",
      'k2-k22-0': "k2-k22-0",
      'k2-k22-1': "k2-k22-1"
    };
    
    it('should return '+obj3+' for '+translators1, function(){
      assert.deepEqual(obj3, obj2);
    });
  });

  describe('#translate3()', function() {

     /* Translators:
     *
     * [ {"getter": "age" },
     *   {"getter": ["name", "last"], "setter": "lastname" },
     *   {"getter": { 'dojox.json.query': '$.email.[0]' } , "setter": ["email", "first"] },
     *   {"getter": { 'dojox.json.query': '$.x.y' } , "setter": function(object, value) {} },
     * ]*/

    var features = [
          {
            "type":"Feature",
            "geometry":{
              "type":"Point",
              "coordinates":[
                143.86010667724767,
                -37.55014044374228
              ]
            },
            "properties":{
              "OBJECTID":1,
              "UID":"1"
            }
          },
          {
            "type":"Feature",
            "geometry":{
              "type":"Point",
              "coordinates":[
                143.8704063598638,
                -37.55667279542442
              ]
            },
            "properties":{
              "OBJECTID":2,
              "UID":"2"
            }
          },
          {
            "type":"Feature",
            "geometry":{
              "type":"Point",
              "coordinates":[
                143.85667344970298,
                -37.56102737843926
              ]
            },
            "properties":{
              "OBJECTID":3,
              "UID":"3"
            }
          }
        ]
    , results = [
          { long: 143.86010667724767
          , lat: -37.55014044374228
          , id: 1
          },
          { long: 143.8704063598638
          , lat: -37.55667279542442
          , id: 2
          },
          { long: 143.85667344970298
          , lat: -37.56102737843926
          , id: 3
          }
        ]    
    var translators = [
      { "getter": ["geometry", "coordinates", 0], "setter": "long" },
      { "getter": ["geometry", "coordinates", 1], "setter": "lat" },
      { "getter": ["properties", "OBJECTID"], "setter": "id" }
    ];
        
    it('should translate3 ', function(){
      assert.deepEqual(_.translate3(features, translators), results);
    });
  });

  describe('#mapKey3()', function() { 

      var rows = [
            { name: 'josh', age: 7, sex: 'female'}
          , { name: 'luca', age: 8, sex: 'male'}
          ]
        , keys = ['name', 'sex']
        , newKeys = ['id', 'gender'];

    it('should mapKey3', function(){
      assert.deepEqual(_.mapKey3(rows, keys, newKeys), [
        { id: 'josh', age: 7, gender: 'female' }
      , { id: 'luca', age: 8, gender: 'male' }
      ]);
    });

    it('should mapKey3', function(){
      var filter = true;
      assert.deepEqual(_.mapKey3(rows, keys, newKeys, filter), [
        { id: 'josh', gender: 'female' }
      , { id: 'luca', gender: 'male' }
      ]);
    });

    it('should mapKey3 deep', function(){
      var rows = {
          'josh': {
            age: 7
          , sex: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , 'jane': {
            age: 8
          , sex: 'female'
          , name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , 'senior': {
            age: 88
          , sex: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        }
        , keys = ['age', 'sex']
        , newKeys = ['agegroup', 'gender'];
      var expected = {
          'josh': {
            agegroup: 7
          , gender: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , 'jane': {
            agegroup: 8
          , gender: 'female'
          , name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , 'senior': {
            agegroup: 88
          , gender: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        };
      var filter = false, deep = false;
      var results = _.mapKey3(rows, keys, newKeys, filter, deep)
      assert.deepEqual(results, expected);
      assert.strictEqual(rows.josh.name, results.josh.name);
      var filter = false, deep = true;
      var results = _.mapKey3(rows, keys, newKeys, filter, deep)
      assert.deepEqual(results, expected);
      assert.notStrictEqual(rows.josh.name, results.josh.name);
    });    
  });


  describe('#union3()', function() { 
    var rows1 = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        ]
      , rows2 = [
          { id: 'senior', age: 88, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        ];


    it('should union3 with depth = 0', function(){
      var depth = 0
        , results = _.union3([rows1, rows2], ['name', 'first'], depth);
      assert.deepEqual(rows1, results);
      assert.strictEqual(rows1[0], results[0]);
      assert.strictEqual(rows1[1], results[1]);

    });    
    it('should union3 with depth = 1', function(){
      var depth = 1
        , results = _.union3([rows1, rows2], ['sex'], depth);

      assert.deepEqual([rows1[0], rows1[1]], results);
      assert.strictEqual(rows1[0].name, results[0].name);
    });   
    it('should union3 with depth = 2', function(){
      var depth = 2
        , results = _.union3([rows1, rows2], 'id', depth);

      assert.deepEqual([rows1[0], rows1[1], rows2[0]], results);
      assert.deepEqual(rows2[0], results[2]);
      assert.notStrictEqual(rows2[0].name, results[2].name);
    });  

  });

  describe('#unique3()', function() { 
    var rows = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , { id: 'senior', age: 88, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        ];

    it('should unique3 with option = 0', function(){
      var option = 0
        , results = _.unique3(rows, ['name', 'first'], option);
      assert.deepEqual([rows[0], rows[1]], results);
      assert.strictEqual(rows[0], results[0]);
      assert.strictEqual(rows[1], results[1]);

    });    
    it('should unique3 with option = 1', function(){
      var option = 1
        , results = _.unique3(rows, ['sex'], option);

      assert.deepEqual([rows[0], rows[1]], results);
      assert.strictEqual(rows[0].name, results[0].name);
    });   
    it('should unique3 with option = 2', function(){
      var option = 2
        , results = _.unique3(rows, 'id', option);

      assert.deepEqual(rows, results);
      assert.deepEqual(rows[2], results[2]);
      assert.notStrictEqual(rows[2].name, results[2].name);
    });  

    it('should unique3 with option = "key"', function(){
      var option = 'key'
        , results = _.unique3(rows, 'id', option);

      assert.deepEqual([
        { id: 'josh' }
      , { id: 'jane' }
      , { id: 'senior' }
      ], results);
    });

    it('should unique3 with option = "key"', function(){
      var option = 'key'
        , results = _.unique3(rows, ['name', 'last'], option);

      assert.deepEqual([
        { name: { last: 'posh' } }
      , { name: { last: 'caine' } }
      ], results);
    });

    it('should unique3 with option = a translators', function(){
      var option = [
            { getter: 'id', setter: 'nick' }
          , { getter: ['name', 'last'], setter: 'lastname' }
          ]
        , results = _.unique3(rows, 'id', option);

      assert.deepEqual([
        { nick: 'josh'
        , lastname: 'posh'
        }
      , { nick: 'jane'
        , lastname: 'caine'
        }
      , { nick: 'senior'
        , lastname: 'posh'
        }
      ], results);
    });

    it('should unique3 with no option', function(){
      assert.deepEqual(['male', 'female'], _.unique3(rows, 'sex'));
    });


  });


  describe('#groupBy3()', function() { 
    var rows = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , { id: 'lady', age: 88, sex: 'female',
            name: {
              first: 'jane'
            , last: 'posh'
            }
          }
        ];

    it('should groupBy3 with getter array of keys', function(){
      var results = _.groupBy3(rows, ['name', 'last']);

      assert.deepEqual({
          posh: [rows[0], rows[2]]
        , caine: [rows[1]]
        }
      , results);
    });

    it('should groupBy3 with getter array of keys 2', function(){
      var results = _.groupBy3(rows, ['name', 'last', 'length']);

      assert.deepEqual({
          4: [rows[0], rows[2]]
        , 5: [rows[1]]
        }
      , results);
    });    

    it('should groupBy3 with getter function', function(){
      var f = function (row) {
            return (row.age < 30) ? '<30' : '>=30';
          }
        , results = _.groupBy3(rows, f);

      assert.deepEqual({
          '<30': [rows[0], rows[1]]
        , '>=30': [rows[2]]
        }
      , results);
    });    
  });



  describe('#map3()', function() { 
      var rows = {
          'josh': {
            age: 7
          , sex: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , 'jane': {
            age: 8
          , sex: 'female'
          , name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , 'senior': {
            age: 88
          , sex: 'male'
          , name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        };
   

    it('should map3 with getter function', function(){
      var getter = function (row) {
            return (row.age > 65);
          }
        , iterator = function (val, index, row) {
            return {
              id: index
            , fullname: row.name.first + ' ' + row.name.last
            , retired:  val
            };
          }
        , results = _.map3(rows, getter, iterator);

      assert.deepEqual({
          'josh': {
            id: 'josh'
          , fullname: 'josh posh'
          , retired: false
          }
        , 'jane': {
            id: 'jane'
          , fullname: 'jane caine'
          , retired: false
          }
        , 'senior': {
            id: 'senior'
          , fullname: 'josh posh'
          , retired: true
          }
        }
      , results);
    });    
  });


  describe('#tally3()', function() { 
      var rows = {
          'josh': {
            age: 7
          , name: { first: 'josh', last: 'posh' }
          }
        , 'jane': {
            age: 8
          , name: { first: 'jane', last: 'caine' }
          }
        , 'senior': {
            age: 88
          , name: { first: 'josh', last: 'posh' }
          }
        };
   

    it('should tally3 with getter function', function(){
      var getter = ['name', 'last']
        , results = _.tally3(rows, getter);

      assert.deepEqual({
          'posh': 2
        , 'caine': 1
        }
      , results);
    });

    it('should tally3 with getter function', function(){
      var getter = function (row) {
            return (row.age > 65) ? 'retiree' : 'non-retiree';
          }
        , results = _.tally3(rows, getter);

      assert.deepEqual({
          'retiree': 1
        , 'non-retiree': 2
        }
      , results);
    });    
  });


  describe('#hashify3()', function() { 
      var rows = [
          { nick: 'junior'
          , age: 7
          , name: { first: 'josh', last: 'posh' }
          }
        , { nick: 'lady'
          , age: 8
          , name: { first: 'jane', last: 'caine' }
          }
        , { nick: 'senior'
          , age: 88
          , name: { first: 'josh', last: 'posh' }
          }
        ];

    it('should hashify3 with getter function', function(){
      var getter = ['name', 'last']
        , results = _.hashify3(rows, getter, 'exists');

      assert.deepEqual({
          'posh': 'exists'
        , 'caine': 'exists'
        }
      , results);
    });

    it('should tally3 with getter function', function(){
      var getter = function (row) {
            return row.name.first + ' "' + row.nick + '" ' + row.name.last
          }
        , results = _.hashify3(rows, getter);

      assert.deepEqual({
          'josh "junior" posh': rows[0]
        , 'jane "lady" caine': rows[1]
        , 'josh "senior" posh': rows[2]
        }
      , results);
    });    
  });


  describe('#deepen()', function() { 
    var rows = [
          { id: 'josh', age: 7, sex: 'male',
            name: {
              first: 'josh'
            , last: 'posh'
            }
          }
        , { id: 'jane', age: 8, sex: 'female',
            name: {
              first: 'jane'
            , last: 'caine'
            }
          }
        , { id: 'lady', age: 88, sex: 'female',
            name: {
              first: 'jane'
            , last: 'posh'
            }
          }
        ];

    it('should deepen groupBy', function(){
      var myGroupBy3 = _.deepen(_.groupBy)
        , results1 = myGroupBy3(rows, ['name', 'last'])
        , results2 = _.groupBy3(rows, ['name', 'last']);
      assert.deepEqual(results1, results2);
    });

    it('should deepen sortBy', function(){
      var mySortBy3 = _.deepen(_.sortBy)
        , results = mySortBy3(rows, ['name', 'last']);
      assert.deepEqual([rows[1], rows[0], rows[2]], results);
    });
  
  });


});
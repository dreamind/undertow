/*
 * undertow.js
 * extension of underscore.js
 *
 * Collection of various utility functions.
 *
 * Dependencies:
 * underscore.js (strict)
 *
 * dojox (optional)
 * ExtJS (optional)
 * OpenLayers (optional)
 *
 * functions end with x: generate function with closure
 * functions end with 2: enhanced versions of underscore
 * functions end with 3: supports 'rows' of data in the following form
 *
 * [ {obj1}, {obj2} ] or { key1: {obj1}, key2: {obj2} }
 *
 */


(function() {// start enclosure

  // Repeated from underscore.js
  // ---------------------------
  // Save bytes in the minified (but not gzipped) version:
  // Create quick reference variables for speed access to core prototypes.
  var slice = Array.prototype.slice
    , evil = eval
    , _, u;

  if (typeof exports !== 'undefined') { // node js environment
    _ = require('underscore');
    if (typeof module !== 'undefined' && module.exports) {
      exports = _;
      module.exports = _;
    }
    exports._ = _;
  } else { // in browser
    _ = window._;
    if (!_) { // underscore not included
      console.log('underscore.js must be included');
      return;
    }    
  }

  u = _.undertow = {};
  u.logFilters = [];

  _.mixin({

    // high-level typeOf
    // based on http://javascript.crockford.com/remedial.html
    /**
     *
     * boolean: true | false
     * array: [1, 2, {4: 5}]
     * object: {name: john, scores: [90, 80]}
     * null: null
     * undefined:
     * number: 1 or 3.14
     * function: function() {}
     * string: 'text' or "word"
     * regexp: /abc.+/
     *
     */

    typeOf: function(thing) {

      var type = typeof thing;
      if (type === 'object') {
        if (thing) {
          if (thing instanceof Array) {
            return 'array';
          } else if (thing instanceof RegExp) {
            return 'regexp';
          } else if (typeof Iterator !== 'undefined' && thing instanceof Iterator) {
            return 'iterator';
          }
        } else {
          return 'null';
        }
      }
      return type;
    },


    blankOf: function (thing) {
      var constructor = thing.constructor
        , type = _.typeOf(constructor);

      if (constructor) {
        if (type === 'object')
          return new constructor();        
      }
      return [];
    },

    xf: function(f, hash) {
      var xf = function xf() { return f.apply(xf, arguments); }
        , key;
      for (key in hash) {
        xf[key] = hash[key];
      }
      return xf;
    },

    logSetFilter: function(filters) {
      u.logFilters = filters;
    },

    log: function() { // always call using (this, ...)
      var emitter = arguments[0];
      var classes = _.getClasses(emitter);
      if( u.logFilters.length === 0 || _.arrIntersect(classes, logFilters) ) {
        arguments[0] = classes[0] || emitter;
        console.log(slice.call(arguments));
      }
    },

    getClasses: function getClasses(thing) {
      if (_.typeOf(thing) != 'object')
        return [];
      var classes = [], className;
      if ('$className' in thing) { // ExtJS OOP-style
        classes[0] = thing['$className'];
        if ('superclass' in thing) {
          classes = classes.concat(getClasses(thing.superclass));
        }
      } else if ('CLASS_NAME' in thing) { // OpenLayers OOP-style
        className = thing.CLASS_NAME;
        classes[0] = className;
        try {
          var parent = evil(className+'.prototype.__proto__');
          classes = classes.concat(getClasses(parent));
        } catch(err) {
          // do nothing
        }
      }
      return classes;
    },

    getIdentifiers: function(thing) {
      return {
        classes: _.getClasses(thing),
        name: thing.name,
        id: thing.id
      };
    },

    // https://gist.github.com/982883
    uuid4: function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);},

    // String
    strJoin: function(arr, quote) {
      var result = '', len = arr.length;

      for (var i = 0; i < len; i++) {
        result += quote + arr[i] + quote;
        if (i < len-1) {
          result += ",";
        }
      }
      return result;
    },

    // obj is an object constructed purely out of hash (object)
    traverse: function(obj, arrKeys, create) {
      var i, n = obj, j = arrKeys.length, k, nn;

      for (i = 0; i < j; i++) {
        k = arrKeys[i];
        if (k in n) {
          nn = n[k];
        } else {
          nn = null;
        }
        if (!nn) {
          if (!create) {
            return null;
          }
          n = n[k] = {};
        } else {
          n = nn;
        }
      }
      return n;
    },

    // obj is an object constructed out of hash (object) and array
    update2: function(obj, arrKeys, val, create) {
      var i, n = obj, j = arrKeys.length, k, nn, k_1;

      for (i = 0; i < j-1; i++) {
        k = arrKeys[i];
        if (k in n) {
          nn = n[k];
        } else {
          nn = null;
        }
        if (!nn) {
          if (!create) {
            return null;
          }
          k_1 = arrKeys[i+1];
          if (_.typeOf(k_1) == 'number') {
            n[k] = [];
          } else { // string
            n[k] = {};
          }
          n = n[k];
        } else {
          n = nn;
        }
      }
      n[arrKeys[j-1]] = val;
      return obj;
    },

    // read, update and remove interfaces to hash object
    // the obj will not be changed
    read: function(obj, arrKeys, defaultVal) {
      var n = _.traverse(obj, arrKeys);
      if(n === null && defaultVal) {
        n = defaultVal;
      }
      return n;
    },

    update: function(obj, arrKeys, val) {
      var len = arrKeys.length;
      var node = _.traverse(obj, arrKeys.slice(0, len-1), true); // create if not there
      var key = arrKeys[len-1];
      node[key] = val || 1;
      return node[key];
    },

    remove: function(obj, arrKeys, val) {
      var len = arrKeys.length;
      var node = _.traverse(obj, arrKeys.slice(0, len-1));
      var key = arrKeys[arrKeys.length-1];
      if (node && key in node) {
        delete node[key];
        return true;
      }
      return false;
    },

    add: function(obj, item) {
      if (!(item in obj)) {
        obj[item] = 1;
      }
      return obj;
    },

    hashify: function(array, defaultVal) {
      var result = {};
      _.each(_.flatten(array), function(val) {
        result[val] = defaultVal || 1;
      });
      return result;
    },


    arrayify: function(obj, keyField, valField) {
      var result = [];
      keyField = keyField || 'key';
      valField = valField || 'value';
      _.each(obj, function(val, key) {
        var row = {};
        row[keyField] = key;
        row[valField] = val;
        result[result.length] = row;
      });
      return result;
    },

    // Intersection
    arrIntersect: function(arr1, arr2) {
      var l1 = arr1.length, l2;

      while (l1--) {
        l2 = arr2.length;
        while (l2--) {
          if (_.isEqual(arr1[l1], arr2[l2])) {
            return true;
          }
        }
      }
      return false;
    },

    objIntersect: function(obj1, obj2) {
      for (var key1 in obj1) {
        if (key1 in obj2) {
          if (_.isEqual(obj1[key1], obj2[key1])) {
            return true;
          }
        }
      }
      return false;
    },

    isIntersect: function(thing1, thing2) {
      return (_.typeOf(thing1) === 'array') ? _.arrIntersect(thing1, thing2) : _.objIntersect(thing1, thing2);
    },

    // enhanced version of built-in concat
    // shallow copy
    concat: function(array) {
      return array.concat(slice.call(arguments, 1));
    },

    concatDeep: function() {
      var result = [];
      var arrays = slice.call(arguments);

      _.each(arrays, function(array) {
        _.each(array, function(obj) { // each rows
          result[result.length] = _.cloneDeep(obj);
        });
      });
      return result;
    },

    cloneDeep: function fn(obj) {
      var result = {}, val, type = _.typeOf(obj), key;

      if (type !== 'object' && type !== 'array')
        return _.clone(obj);
      for (key in obj) {
        val = obj[key];
        type = _.typeOf(val);
        if (type == 'object' || type == 'array') {
          result[key] = fn(val);
          continue;
        }
        result[key] = val;
      }
      return result;
    },

    extendDeep: function fn(obj1, obj2) {
      var key, val, type;

      for (key in obj2) {
        val = obj2[key];
        type = _.typeOf(val);
        if (type == 'object' ) {
          obj1[key] = {};
        } else if (type == 'array') {
          obj1[key] = [];
        } else {
          obj1[key] = val;
          continue;
        }
        fn(obj1[key], val);
      }
      return obj1;
    },

    // shallow
    extendOnly: function(obj1, obj2, keys) {
      return _.extend(obj1, _.pick(obj2, keys));
    },

    // shallow
    extendExcept: function(obj1, obj2, noKeys, deep) {
      var keys = _.difference(_.keys(obj2), noKeys);
      _.each(keys, function(key, index) {
        obj1[key] = (deep) ? _.cloneDeep(obj2[key]) : obj2[key];
      });
      return obj1;
    },

    /**
     * getter:
     *
     * - "key": simple key obj[key]
     * - ["key1", "key2"]: key chain for accessing obj[key1][key2]
     * - { 'dojox.json.query': '$.foo' } using dojox json query
     * - function
     *
     */
    // Object
    getterx: function(getter) {
      var type = _.typeOf(getter);
      var f = function(obj) {
        return getter;
      };

      if (type === 'string' || type === 'number') {
        f = function(obj) {
          return (getter in obj) ? obj[getter] : null;
        };
      } else if (type === 'array') {
        f = function(obj) {
          return _.traverse(obj, getter);
        };
      } else if (type === 'function') {
        f = function(obj) {
          return getter(obj);
        };
      } else if (type === 'object') {
        if ('dojox.json.query' in getter) {
          f = function(obj) {
            return dojox.json.query(getter['dojox.json.query'], obj);
          };
        }
      }
      return f;
    },

    setterx: function(setter) {
      var type, f;

      type = _.typeOf(setter);
      if (type == 'string'  || type === 'number') {
        f = function(obj, value) {          
          obj[setter] = value;
          return value;
        };
      } else if (type == 'array') {
        f = function(obj, value) {
          _.update1(obj, setter, value);
          return value;
        };
      } else if (type == 'function') {
        f = function(obj, value, objSrc) {
          return setter(obj, value, objSrc);
        };
      } else {
        f = function(obj, value) {
          obj[setter] = value;
          return value;
        };
      }
      return f;
    },

    /**
     * Uninspiring if-else, but having closure is faster than injection
     */
    valuerx: function(value, exact) {
      var type = _.typeOf(value);
      var f = function(val) {
        // default is exact match
        return _.isEqual(value, val);
      };

      if (type == 'string' || type === 'number') {
        f = function(val) {
          return (val === value);
        };
      } else if (type === 'array') {
        f = function(val) {
          return _.isEqual(value, val);
        };
        if (!exact) { // partial match
          f = function(val) {
            if (_.typeOf(val) === 'array') {
              return _.intersects(value, val);
            } else {
              return (_.indexOf(value, val) != -1);
            }
          };
        }
      } else if (type == 'function') {
        f = function(val) {
          return value(val);
        };
      } else if (type == 'regexp') {
        f = function(val) {
          try {
            return val.match(value);
          } catch(err) {
            return false;
          }
        };
      } else if (type == 'object') {
        if (!exact) {
          f = function(val) {
            return _.isIntersect(value, val);
          };
        }
      }
      return f;
    },

    transfunction: function(qualifiers, kinds) {
      var fs = [], q, f, k, fx, k2, l, exact;

      for (var i = 0, j = qualifiers.length; i < j; i++) { // applied in sequence
        q = qualifiers[i];
        l = kinds.length;
        f = {};
        while (l--) {
          k = kinds[l];
          fx = _[k+'x'];
          // e.g. if setter is not specified use getter
          k2 = (k in q) ? k : 'getter';
          exact = ('exact' in q) ? q.exact : 1;
          f[k] = fx(q[k2], exact);
        }
        fs[fs.length] = f;
      }
      return fs; // array of processed matcher functions

    },
    /**
     * Perform complex matching
     *
     * @param {Object} obj Object to be match
     * @param {Object} cmatcher Complex matcher
     * @param {Boolean} exact 1 for exact match otherwise
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
    matcherx: function(matchers) {
      return _.transfunction(matchers, ['getter', 'valuer']);
    },

    extractorx: function(extractors) {
      return _.transfunction(extractors, ['getter']);
    },

    translatorx: function(translators) {
      return _.transfunction(translators, ['getter', 'setter']);
    },

    match1: function(obj, matcherfs, all) {
      var matcherf, i, j, matchCount = 0;

      for (i = 0, j = matcherfs.length; i < j; i++) {
        matcherf = matcherfs[i];
        if (matcherf.valuer(matcherf.getter(obj))){
          matchCount++;
          if (!all) { // either
            return true;
          }
        } else {
          if (all) { // all
            return false;
          }
        }
      }
      if (all) return (matchCount === j);
      else return (matchCount > 0);
    },

    /**
     * Return an array of values based on extractor functions
     *
     * @param {Object} object An object
     * @param {Object} extractorfs extractor functions
     */
    extract1: function(obj, extractorfs) { 
      var result = []
        , extractorf, i, j;

      for (i = 0, j = extractorfs.length; i < j; i++) {
        extractorf = extractorfs[i];
        result[result.length] = extractorf.getter(obj);
      }
      return result;
    },

    /**
     * Return a new object from an object translated based on translator functions
     *
     * @param {Object} object1 A source object
     * @param {Object} object2 A destination object
     * @param {Object} translatorfs translator functions
     */
    translate1: function(obj1, obj2, translatorfs) { 
      var translatorf, i, j;

      if (!obj2) obj2 = {};

      for (i = 0, j = translatorfs.length; i < j; i++) {
        translatorf = translatorfs[i];
        try {
          translatorf.setter(obj2, translatorf.getter(obj1), obj1);
        } catch (err) {
          _.log(_, 'TranslateError', err);
          return obj2;
        }
      }
      return obj2;
    },

    cull: function(obj, getter) {
      return _.getterx(getter)(obj);
    },

    match: function(obj, matchers) {
      return _.match1(obj, _.matcherx(matchers));
    },

    extract: function(obj, extractors) {
      return _.extract1(obj, _.extractorx(extractors));
    },

    translate: function(obj, translators) {
      return _.translate1(obj, {}, _.translatorx(translators));
    },

    pluck3: function(rows, getter) {
      var result = _.isArray(rows) ? []: {}
        , f = _.getterx(getter);
      
      _.each(rows, function(row, index) {
        result[index] = f(row);
      });
      return result;
    },

    grab3: function(rows, getters) {
      // shallow flatten
      var getterArgs = _.flatten(slice.call(arguments, 1), true)
        , extractors = [];
      
      _.each(getterArgs, function(getter) {
        extractors[extractors.length] = { 'getter': getter };
      });
      return _.extract3(rows, extractors);
    },

    pick3: function(rows, keys) {
      var result = _.isArray(rows) ? []: {}
        , keyArgs = slice.call(arguments, 1);
      _.each(rows, function(row, index) {
        result[index] = _.pick(row, keyArgs);
      });
      return result;
    },

    /**
     * cull: object -> value
      pick: object -> object
     * pluck: rows of collections -> array of arrays
     * translate: rows of collections -> rows of collections
     * cull: rows of collections -> rows of collections

      
     */
    /**
     * Return an array of values based on getter
     *
     * @param {Object} rows Array of objects
     * @param {Object} extractors Accessors
     */
    extract3: function(rows, extractors) {
      var result = _.isArray(rows) ? []: {};
      var extractorfs = _.extractorx(extractors);
      _.each(rows, function(row, index) {
        result[index] = _.extract1(row, extractorfs);
      });
      return result;
    }

  , match3: function(rows, matchersOrObject, exact) {
      return (_.isArray(matchersOrObject)) ?
        matchMatchers(rows, matchersOrObject, exact) :
        matchObject(rows, matchersOrObject, exact);
    }
    /**
     * Return an array of row based on matcher's object
     * The row is not cloned.
     *
     * @param {Object} rows Collection of objects
     * @param {Array} matcher Complex matcher
     * @param {Boolean} exact 1 for all
     *
     */

  , matchMatchers: function(rows, matchers, exact) {
      var isArray = _.isArray(rows)
        , result = (isArray) ? []: {}
        , matcherfs = _.matcherx(matchers, exact);

      _.each(rows, function(row, index) {      
        if (_.match1(row, matcherfs, exact)) {          
          result[(isArray) ? result.length : index] = row;
        }
      });
      return result;
    },

    /**
     * Return an array of values based on matcher's object
     * Shallow, but the matcher could be a nested object
     *
     * @param {Object} rows Array of objects
     * @param {Object} obj an object (key-value pairs) {"name": "john", "age": 27}
     * @param {Boolean} exact 1 for using isEqual (exact match) otherwise
     *   use isIntersect (partial match)
     *
     */
    matchObject: function(rows, obj, exact) {
      var isArray = _.isArray(rows)
        , result = (isArray) ? []: {};

      _.each(rows, function(row, index) {
        if ( (exact && _.isEqual(row, obj)) ||
              (!exact && _.isIntersect(row, obj)) ) {
          result[(isArray) ? result.length : index] = row;
        } 
      });
      return result;
    },

    /**
     * Return an array of new object based on list of pickers
     *
     * Translators:
     *
     * [ {"getter": "age" },
     *   {"getter": ["name", "last"], "setter": "lastname" },
     *   {"getter": { 'dojox.json.query': '$.email.[0]' } , "setter": ["email", "first"] },
     *   {"getter": { 'dojox.json.query': '$.x.y' } , "setter": function(object, value) {} },
     * ]
     *
     * @param {Object} rows Array of objects
     * @param {Object} pickers List of picker objects
     */
    translate3: function(rows, translators) {
      var result = _.blankOf(rows);
      var translatefs = _.translatorx(translators);
      _.each(rows, function(row, index) {
        result[index] = _.translate1(row, {}, translatefs);
      });
      return result;
    },

    // construct a new array of object with certain keys
    // keypairs = [ ["1", "2"] ]
    // shallow
    mapKey3: function(rows, keys, newKeys, filter, deep) {
      var result = _.isArray(rows) ? []: {};

      _.each(rows, function(row, index) {
        var newRow = {};
        if (!filter) {
          _.extendExcept(newRow, row, keys, deep);
        } 
        _.each(keys, function(key, index) {
          if (key in row) newRow[(newKeys) ? newKeys[index] : key] = row[key];
        });
        result[index] = newRow;
      });
      return result;
    },


    /**
     * Union of two collections based on the uniqueness of getter's value
     * The data from rows1 win over rows2
     * Assume each of rows1 and rows2 hold unique values based on getter
     *
     * @param {Object} rows1 Array of objects
     * @param {Object} rows2 Array of objects
     * @param {Object} getter getter of an object
     *
     * @return {Array} result
     *
     * Example:
     *
     * rows1 = [ {"name": {"first": "john", "last": "doe"}, "age": 24}
     *           {"name": {"first": "liza", "last": "lee"}, "age": 27} ]
     * rows2 = [ {"name": {"first": "tony", "last": "doe"}, "age": 48}
     *           {"name": {"first": "tina", "last": "six"}, "age": 50} ]
     *
     * union3(rows1, rows2, ['name', 'last']) returns the first 3-rows
     * union3(rows1, rows2, 'name') returns all rows
     */

    union3: function(rows1, rows2, getter, shallow) {
      var concatf = (shallow) ? _.concat : _.concatDeep
        , clonef = (shallow) ? _.clone : _.cloneDeep
        , f = _.getterx(getter)
        , result = concatf(rows1)
        , values = {};

      _.each(rows2, function(row, index) {
        var val = f(row);
        if (val in values) return;
        values[val] = 1;        
        result[result.length] = clonef(row);
      });
      return result;
    },

    /*
      resultVal array -> translators
      resultVal null -> use value of getter
      resultVal 'object' -> copy the whole object
    */
    unique3: function(rows, getter, resultVal, shallow) {
      var clonef = (shallow) ? _.clone : _.cloneDeep
        , f = _.getterx(getter), valuef, translatefs
        , result = {};

      if (resultVal === null) {
        valuef = function () { return 1; };
      } else if (resultVal === 'object') {
        valuef = function (row) { return clonef(row); };
      } else  {
        translatefs = _.translatorx(resultVal);
        valuef = function (row) { return  _.translate(row, {}, translatefs); };
      }

      _.each(rows, function (row) {
        var key = f(row);
        if (key in result) return;
        result[key] = valuef(row);
      });
      return result;
    }

    /**
     * Splits rows into groups of rows (objects),
     * grouped by the value of object[key]
     *
     * @param {Object} rows Array of objects
     * @param {Object} getter getter of an object
     * shallow

     */
  , groupBy3: function(rows, getter) {
      var f = _.getterx(getter);
      return _.groupBy(rows, function(row){ return f(row); });
    }

    /**
     * Map for rows
     * based on the value of getter
     *
     * @param {Object} rows Collection of collections
     * @param {Object} getter
     * @param {Function} iterator
     */
  , map3: function(rows, getter, iterator) {
      var f = _.getterx(getter)
        , result = _.isArray(rows) ? []: {};

      _.each(rows, function (row, index) {
        var val = f(row);
        result[index] = iterator(val, index, row);
      });
      return result;
    }

    /**
     * Generate a tally for rows,
     * based on the value of getter
     *
     * @param {Object} rows Collection of collections
     * @param {Object} getter
     */
  , tally3: function (rows, getter) {
      var f = _.getterx(getter)
        , tally = {};

      _.each(rows, function (row) {
        var val = f(row);
        if (val in tally) {
          tally[val]++;
        } else {
          tally[val] = 1;
        }
      });
      return tally;
    }

  , hashify3: function(rows, getter, defaultVal) {
      var f = _.getterx(getter)
        , result = {};

      _.each(rows, function (row, index) {
        var val = f(row);
        result[val] = defaultVal || row;
      });
      return result;
    }

    /**
     * Deepen shallow iterator-based functions
     * (applicable to underscore's min, max, sortBy, groupBy)
     *
     * @param {Function} func underscore's function
     * @param {Object} rows Array of objects
     * @param {Object} getter getter of an object
     *
     * @return {Object} Whatever func returns
     *
     * Example:
     *
     * groupBy3 <==> deepen(_.groupBy, rows, getter)
     *
     */
  , deepen: function(func, rows, getter) {
      var f = _.getterx(getter);
      return func(rows, function(row){ return f(row); });
    }

  , deepenUnderscore: function () {
      var fs = [ 'max', 'min', 'sortBy' ];
      
      _.each(fs, function (fname) {
        _[name+'3'] = function(rows, getter) {
          _.deepen(_[name], rows, getter);
        };
      });
    }
  }); // end mixin

})();
// end enclosure

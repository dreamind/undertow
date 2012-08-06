/*
 * undertow.js
 * extension of underscore.js
 *
 * Collection of various utility functions.
 *
 * Dependencies:
 * underscore.js
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
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  var logFilters = [];

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = previousUnderscore;
    }
    exports._ = previousUnderscore;
  }

  previousUnderscore.mixin({

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
          }
        } else {
          return 'null';
        }
      }
      return type;
    },

    xf: function(f, hash) {
      var that = this;
      var xf = function xf() { return f.apply(xf, arguments); };
      for (key in hash) {
        xf[key] = hash[key];
      }
      return xf;
    },

    logSetFilter: function(filters) {
      logFilters = filters;

    },

    log: function() {

      var emitter = arguments[0];
      var classes = _.getClasses(emitter);
      console.log("LOG",arguments, classes, logFilters);
      if( logFilters.length == 0 || _.arrIntersect(classes, logFilters) ) {
        arguments[0] = classes[0] || emitter;
        // arguments.shift();
        console.log(Array.prototype.slice.call(arguments));
      }
    },

    getClasses: function getClasses(thing) {
      if (_.typeOf(thing) != 'object')
        return;
      var classes = [], className;
      if ('$className' in thing) { // ExtJS OOP-style
        classes[0] = thing['$className'];
        if ('superclass' in thing) {
          classes = classes.concat(getClasses(thing['superclass']));
        }
      } else if ('CLASS_NAME' in thing) { // OpenLayers OOP-style
        className = thing['CLASS_NAME'];
        classes[0] = className;
        try {
          var parent = eval(className+'.prototype.__proto__');
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
    uuid4: function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)},

    // String
    stringJoin: function(arr, quote) {
      var result = '', len = arr.length;

      for (var i = 0; i < len; i++) {
        result += quote + arr[i] + quote;
        if (i < len - 1) {
          result += ",";
        }
      }
      return result;
    },

    traverse: function(obj, arrKeys, create) {
      var n = obj, j = arrKeys.length, k;

      for (var i = 0; i < j; i++) {
        k = arrKeys[i];
        if (k in n) {
          n = n[k];
        } else {
          if (!create) {
            return null
          }
          n = n[k] = {};
        }
      }
      return n;
    },

    // read, update and remove interfaces to hash object
    read: function(obj, arrKeys, defaultVal) {
      var n = _.traverse(obj, arrKeys);
      if(n == null && defaultVal) {
        n = defaultVal;
      }
      return n;
    },

    update: function(obj, arrKeys, val) {
      var len = arrKeys.length;
      var node = _.traverse(obj, arrKeys.slice(0, len-1), true); // create if not there
      var key = arrKeys[len-1];
      if (node == null) return null;
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

    add: function(object, item) {
      if (!(item in object)) {
        object[item] = 1;
      }
      return object;
    },

    hashify: function(array, defaultVal) {
      var result = {};
      _.each(_.flatten(array), function(value) {
        result[value] = defaultVal || 1;
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
      return (typeOf(thing1) == 'array') ? arrIntersect(thing1, thing2) : objIntersect(thing1, thing2);
    },

    // enhanced version of built-in concat
    // shallow copy
    concat: function(array) {
      return array.concat(slice.call(arguments, 1))
    },

    concatDeep: function() {
      var result = [];
      var arrays = slice.call(arguments);

      _.each(arrays, function(array) {
        _.each(array, function(obj) { // each rows
          result[result.length] = _.cloneDeep(obj);
        })
      });
    },

    cloneDeep: function fn(obj) {
      var result = {}, val, type;

      for (var key in obj) {
        val = obj[key];
        type = _.typeOf(val);
        if (type == 'object' || type == 'array') {
          result[key] = fn(val);
          continue;
        }
        result[key] = value;
      }
      return result;
    },

    extendDeep: function fn(obj1, obj2) {
      var val;

      for (var key in obj2) {
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
      return _extend(obj1, _.pick(obj2, keys));
    },

    // shallow
    extendExcept: function(obj1, obj2, noKeys) {
      var keys = _.difference(_.keys(obj2), noKeys);
      each(keys, function(key, index) {
        obj1[key] = obj2[key];
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
      var type = typeOf(getter);
      var f = function(obj) {
        return getter;
      };

      if (type == 'string') {
        f = function(obj) {
          return (getter in obj) ? obj[getter] : null;
        }
      } else if (type == 'array') {
        f = function(obj) {
          return traverse(obj, getter);
        }
      } else if (type == 'function') {
        f = function(obj) {
          return getter(obj);
        }
      } else if (type == 'object') {
        if ('dojox.json.query' in getter) {
          f = function(obj) {
            return dojox.json.query(getter['dojox.json.query'], obj);
          }
        }
      }
      return f;
    },

    setterx: function(picker) {
      var key, type, f;

      key = ('key' in picker) ? picker.key : picker.getter;
      type = typeOf(key);

      if (type == 'string') {
        f = function(obj, value) {
          obj[key] = value;
          return value;
        };
      } else if (type == 'array') {
        f = function(obj, value) {
          _.update1(obj, key, value)
          return value;
        }
      } else if (type == 'function') {
        f = function(obj, value) {
          return key(obj, value);
        }
      } else {
        f = function(obj, value, obj1) {
          obj.key = value;
          return value;
        };
      }
      return f;
    },

    /**
     * Uninspiring if-else, but having closure is faster than injection
     */
    valuerx: function(value, flag) {
      var type = typeOf(value);
      var f = function(val) {
        // default is exact match
        return _.isEqual(value, val);
      };

      if (type == 'string') {
        f = function(val) {
          return (val == value);
        }
      } else if (type == 'array') {
        f = function(val) {
          return (_.indexOf(value, val) != -1);
        }
        if (!flag) { // partial
          f = function(val) {
            if (_.typeOf(val) == 'array') {
              return _.intersects(value, val);
            } else {
              return (_.indexOf(value, val) != -1);
            }
          }
        }
      } else if (type == 'function') {
        f = function(val) {
          return value(val);
        }
      } else if (type == 'regexp') {
        f = function(val) {
          try {
            return val.match(value);
          } catch(err) {
            return false
          }
        };
      } else if (type == 'object') {
        if (!flag) {
          f = function(val) {
            return _.isIntersect(value, val);
          }
        }
      }
      return f;
    },

    transfunction: function(qualifiers, kinds, flag) {
      var fs = [], q;

      for (i = 0, j = qualifiers.length; i < j; i++) { // applied in sequence
        q = qualifiers[i];
        l = kinds.length;
        f = {};
        while (l++) {
          k = kinds[l];
          fx = _[k+'x'];
          // e.g. if setter is not in translator, getter should always be there
          k = (k in q) ? k : 'getter';
          f[k] = fx(q[k], flag);
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
    matcherx: function(matchers, flag) {
      return transfunction(matchers, ['getter', 'valuer'], flag);
    },

    accessorx: function(accessors) {
      return transfunction(matchers, ['getter'], flag);
    },

    translatorx: function(translators) {
      return transfunction(matchers, ['getter', 'setter'], flag);
    },

    /**
     * Return an array of values based on matcher's object
     * No clone.
     *
     * @param {Object} rows Array of objects
     * @param {Object} matchers Complex matchers
     * @param {Boolean} flag 1 for using isEqual (exact match) otherwise
     *   use isIntersect (partial match)
     *
     */

    match3: function(rows, matchers, flag) {
      var result = _.isArray(rows) ? []: {};
      var matcherfs = matcherx(matchers, flag);

      _.each(rows, function(row, index) {
        if (match(row, matcherfs, flag)) {
          result[index] = row;
        }
      });
      return result;
    },

    match2: function(obj, matcherfs, flag) {
      var matcherf;

      for (i = 0, j = matcherfs.length; i < j; i++) {
        matcherf = matcherfs[i];
        if (matcherf.valuer(matcherf.getter(obj))){
          if (!flag) { // or
            return true;
          }
        } else {
          if (flag) { // all
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Return an array of values based on matcher's object
     * Shallow, but the matcher could be a nested object
     *
     * @param {Object} rows Array of objects
     * @param {Object} obj an object (key-value pairs) {"name": "john", "age": 27}
     * @param {Boolean} flag 1 for using isEqual (exact match) otherwise
     *   use isIntersect (partial match)
     *
     */
    match1: function(rows, obj, flag) {
      var result = [];

      _.each(rows, function(row) {
        if (( flag && _.isEqual(row, obj)) ||
               _.isIntersect(row, obj)) {
          result[result.length] = row;
        }
      });
      return result;
    },

    access: function(obj, accessorfs) { // similar to pluck
      var result = [];
      var accessorf, value;

      for (i = 0, j = accessorfs.length; i < j; i++) {
        accessorf = accessorfs[i];
        result[result.length] = accessorf.getter(obj);
      }
      return result;
    },

    /**
     * Return an array of values based on getter
     *
     * @param {Object} rows Array of objects
     * @param {Object} accessors getter of an object
     */
    pluck3: function(rows, accessors) {
      var result = _.isArray(rows) ? []: {};
      var accessorfs = _.accessorx(accessors);
      _.each(rows, function(row, index) {
        result[index] = _.access(row, accessorfs);
      });
      return result;
    },

    pluck2: function(obj, accessors, flag) {
      return _.access(obj, accessorx(accessors), flag);
    },

    translate: function(obj1, obj2, translatorfs) { // similar to pick
      var translatorf;
      if (!obj2) obj2 = {};

      for (i = 0, j = translatorfs.length; i < j; i++) {
        translatorf = translatorfs[i];
        try {
          translatorf.setter(obj2, translatorf.getter(obj1), obj1);
        } catch (err) {
          console.log('translate.error');
          return obj2;
        }
      }
      return obj2;
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
      var result = _.isArray(rows) ? []: {}, obj2;
      var translatefs = _.translatex(translators);
      _.each(rows, function(row, index) {
        result[index] = _.translate(row, {}, translatefs);
      });
      return result;
    },

    // return an array of object of certain key
    // shallow
    pick3: function(rows, getters) {
      var l = getters.length, t;
      var translators = _.clone(getters);
      while(l--) {
        t = translators[l];
        t.setter = t.getter;
      }
      return translate3(rows, translators);
    },

    pick2: function(obj, translators) {
      return _.translate(obj, {}, translatorx(translators), flag);
    },

    pick1: function(rows, arrKeys) {
      var result = _.isArray(rows) ? []: {};
      _.each(rows, function(row, index) {
        result[index] = _.pick(row, arrKeys);
      });
      return result;
    },

    // construct a new array of object with certain keys
    // keypairs = [ ["1", "2"] ]

    // shallow
    rekey2: function(rows, keys, newKeys) {
      var result = _.isArray(rows) ? []: {};
      var newRow;

      _.each(rows, function(row, index) {
        var newRow = {};
        _.each(keys, function(key, index) {
          if (key in row) newRow[(newKeys) ? newKeys[index] : key] = row[key];
        });
        result[index] = newRow;
      });
      return result;
    },

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
    deepen: function(func, rows, getter) {
      var f = _.getterx(getter);
      return func(rows, function(row){ return f(row); });
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
      var concatf = (shallow) ? concat : _.concatDeep;
      var clonef = (shallow) ? _.clone : _.cloneDeep;

      var f = _.getterx(getter);
      var results = concatf(rows1);
      var values = _.hashify(_.pluck3(rows1, getter)); // hold unique key values

      _.each(rows2, function(row, index) {
        if (f(row) in values) return; // skip
        results[index] = _.clone(row);
      });
      return results;
    },

    /**
     * Splits rows into groups of rows (objects),
     * grouped by the value of object[key]
     *
     * @param {Object} rows Array of objects
     * @param {Object} getter getter of an object
     * shallow

     */
    groupBy3: function(rows, getter) {
      var f = _.getterx(getter);
      return _.groupBy(rows, function(row){ return f(row); });
    },

    /**
     * Generate a tally for rows,
     * based on the value of object[key]
     *
     * @param {Object} rows Array of objects
     * @param {String} key
     */
    tally3: function(rows, getter) {
      var f = _.getterx(getter);
      var tally = {};
      _.each(rows, function(row) {
        var val = f(row);
        if (val in tally) {
          tally[val]++;
        } else {
          tally[val] = 1;
        }
      });
      return tally;
    }
  }); // end mixin

})();
// end enclosure

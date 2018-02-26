'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pluralize = require('pluralize');

const baseStructure = {
  disabled: {type: Boolean, default: false}
}

const baseMethods = {
}

const removeDeletedElement = (result) => {
    if (result) {
        if (result.disabled) {
            result = undefined
        } else {
            Object.keys(result).map((key, index) => {
              if (result[key].disabled) {
                result[key] = undefined
              }
              if(Array.isArray(result[key])) {
                  removeDeletedElement(result[key])
              }
            });
        }
    }
}

const autoPopulateAllFields = function (schema) {
    var paths = '';
    schema.eachPath(function process(pathname, schemaType) {
        if (pathname=='_id') return;
        if (schemaType.options.ref || (schemaType.options.type[0] && schemaType.options.type[0].ref))
            paths += ' ' + pathname;
        if (schemaType.options.type[0]) {
            let entity = Object.keys(schemaType.options.type[0]).find(function (key){ return schemaType.options.type[0][key].ref !== undefined});
            if (entity)
                paths += ' ' + pathname + '.' + entity;
        }

    });

    schema.pre('find', handler);
    schema.pre('findOne', handler);

    function handler(next) {
        this.populate(paths);
        next();
    }
};

const baseStatics = {
    /**
    * findOneOrCreate
    *
    * @param {Object} condition
    * @param {Function} callback
    * @api private
    */
    findOneOrCreate : function findOneOrCreate(condition, callback = (err, result) => {return result}) {
      this.findOne(condition, (err, result) => {
          return result ? callback(err, result) : this.create(condition, (err, result) => { return callback(err, result) })
      })
    },
    /**
     * findOneEnabled
     *
     * @param {Object} condition
     * @param {Function} callback
     * @param {Number} limit
     * @param {Number} offset
     * @api private
     */
    findOneEnabled : function findOneEnabled(condition, callback, limit = 10, offset = 0) {
        return this.findOne(Object.assign(condition, {disabled: false}), callback, limit, offset);
    },
    /**
    * findEnabled
    *
    * @param {Object} condition
    * @param {Function} callback
    * @param {Number} limit
    * @param {Number} offset
    * @api private
    */
    findEnabled : function findEnabled(condition, callback, limit = 10, offset = 0) {
        return this.findAll(Object.assign(condition, {disabled: false}), callback, limit, offset);
    },
    /**
     * findOneDisabled
     *
     * @param {Object} condition
     * @param {Function} callback
     * @param {Number} limit
     * @param {Number} offset
     * @api private
     */
    findOneDisabled : function findOneDisabled(condition, callback, limit = 10, offset = 0) {
        return this.findOne(Object.assign(condition, {disabled: true}), callback, limit, offset);
    },
    /**
    * findDisabled
    *
    * @param {Object} condition
    * @param {Function} callback
    * @param {Number} limit
    * @param {Number} offset
    * @api private
    */
    findDisabled : function findDisabled(condition, callback, limit = 10, offset = 0) {
        return this.findAll(Object.assign(condition, {disabled: true}), callback, limit, offset);
    },
    /**
    * findEnabled
    *
    * @param {Object} condition
    * @param {Function} callback
    * @param {Number} limit
    * @param {Number} offset
    * @api private
    */
    findAll : function findAll(condition, callback, _limit = 10, _offset = 0) {
        let limit = parseInt(_limit);
        let offset = parseInt(_offset);

        if (isNaN(limit)) { limit = 10 }
        if (isNaN(offset)) { offset = 0 }

        return this.find(condition)
          .skip(offset)
          .limit(limit)
          .exec(callback);
    }
}

class BaseModel {
  constructor() {
    this.routeGets = '/' + pluralize(this.constructor.name).toLowerCase();
    this.name = this.constructor.name;
    this.structure = Object.assign({}, baseStructure);
    this.methods = Object.assign({}, baseMethods);
    this.statics = Object.assign({}, baseStatics);
  }

  addField(key, params) {
    this.structure[key] = params;
  }
  getFields(key) {
    return this.structure[key];
  }
  removeField(key) {
    this.structure[key] = undefined;
  }
  setFields(structure) {
    this.structure = Object.assign({}, baseStructure, structure);
  }

  addMethod(name, _function) {
    this.methods[name] = _function;
  }
  getMethods(key) {
    return this.methods[key];
  }
  removeMethod(key) {
    this.methods[key] = undefined;
  }
  setMethods(methods) {
    this.methods = Object.assign({}, baseMethods, methods);
  }

  addStatic(name, _function) {
    this.statics[name] = _function;
  }
  getStatics(key) {
    return this.statics[key];
  }
  removeStatic(key) {
    this.statics[key] = undefined;
  }
  setStatics(statics) {
          this.statics = Object.assign({}, baseStatics, statics);
      }

  exportModel() {
      let schemaExport = new Schema(this.structure, {
          timestamps: true
      });
      schemaExport.methods = this.methods;
      schemaExport.statics = this.statics;
      //Suppression des élements deleted
      schemaExport.post('find', removeDeletedElement);
      schemaExport.plugin(autoPopulateAllFields);
      console.log("[INFO] Export model : " + this.name);
      mongoose.model(this.name, schemaExport);
  }
}
// export the class
module.exports = BaseModel;
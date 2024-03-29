import {
  setReadOnlyProps,
  setWriteableProps,
  getKey,
  skinnyObject,
  getRouteAttributes,
  diff,
  setDefaultValues,
  buildRouteFromInstance,
  without,
  queryStringToObj,
} from '../utils';
import Request from '../ReactiveRecord/Request';
import Errors from './Errors';

export default class Model {
  constructor(attrs = {}, persisted = false, isStoreManaged = false) {
    const modelName = this.constructor.displayName;
    const model = this.ReactiveRecord.models[modelName];

    Object.defineProperty(this, '_attributes', { value: {} });
    Object.defineProperty(this, '_request', {
      value: new Request({ ...attrs._request }),
    });
    Object.defineProperty(this, '_isStoreManaged', { value: isStoreManaged });
    setReadOnlyProps.call(this, attrs, persisted);
    setWriteableProps.call(this, attrs);

    Object.defineProperty(this, '_errors', {
      value: new Errors({ ...attrs._errors, _schema: model.schema }),
    });
    Object.defineProperty(this, '_pristine', {
      value: skinnyObject(this._attributes),
      configurable: true,
    });
    Object.freeze(this._pristine);
    setDefaultValues.call(this, attrs);
  }

  /* ReactiveRecord */
  get ReactiveRecord() {
    return this.constructor.ReactiveRecord;
  }
  static dispatch({ action, _attributes, _options }) {
    const { displayName, ReactiveRecord } = this;
    const type = `@${action}(${displayName})`;
    const actionToDispatch = { type, _attributes };
    if (_options) {
      actionToDispatch._options = _options;
    }
    return ReactiveRecord.dispatch(actionToDispatch);
  }
  static store = { singleton: false };
  static schema = {};

  /* Serialization */
  serialize() {
    return skinnyObject({
      _attributes: { ...this },
      _errors: this._errors,
      _request: this._request.serialize(),
    });
  }

  /* Dirty */
  get diff() {
    return diff(this._persisted ? this._pristine : new this.constructor()._pristine, skinnyObject(this._attributes));
  }
  get changedAttributes() {
    return Object.keys(this.diff);
  }
  get isPristine() {
    return !this.changedAttributes.length;
  }
  get isDirty() {
    return !this.isPristine;
  }
  get attributeChanged() {
    return attr => this.changedAttributes.indexOf(attr) > -1;
  }

  /* Routes */
  get routeFor() {
    return (action, _query = {}) => {
      const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
      return buildRouteFromInstance.call(this, action, query);
    };
  }

  get routeAttributes() {
    /* Returns all attributes needed from this resource to build the route */
    return (action, _query = {}) => {
      const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
      return getRouteAttributes.call(this, action, query);
    };
  }

  /* Persistence */
  static create(attrs, options) {
    return new this(attrs).save(options);
  }
  get updateAttributes() {
    return (attributes = {}, options) => {
      Object.assign(this, attributes);
      return this.save(options);
    };
  }
  get updateAttribute() {
    return (name, value, options = {}) => {
      this[name] = value;
      return this.save({ ...options, validate: false });
    };
  }
  get save() {
    const action = this._persisted ? 'UPDATE' : 'CREATE';
    return ({ query: _query = {} } = {}) => {
      return new Promise((resolve, reject) => {
        const shouldDiff = this.ReactiveRecord.API.patchMode;
        const attributesForRequest = shouldDiff ? this.diff : this._attributes;
        const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
        const _attributes = Object.assign(attributesForRequest, this.routeAttributes(action, query), query);
        this.constructor
          .dispatch({ action, _attributes })
          .then(resource => {
            Object.assign(this._request, resource._request);
            setReadOnlyProps.call(this, { ...resource }, true);
            setWriteableProps.call(this, { ...this, ...resource });
            Object.defineProperty(this, '_pristine', {
              value: skinnyObject(this._attributes),
              configurable: true,
            });
            Object.freeze(this._pristine);
            resolve(this);
          })
          .catch(({ _errors = {}, _request = {} }) => {
            Object.assign(this._errors, _errors);
            Object.assign(this._request, _request);
            reject(this);
          });
      });
    };
  }
  get destroy() {
    const action = 'DESTROY';
    return (_query = {}) => {
      return new Promise((resolve, reject) => {
        const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
        const _attributes = Object.assign(this.routeAttributes(action, query), query);
        this.constructor
          .dispatch({ action: 'DESTROY', _attributes })
          .then(resolve)
          .catch(({ _errors = {}, _request = {} }) => {
            Object.assign(this._errors, _errors);
            Object.assign(this._request, _request);
            reject(this);
          });
      });
    };
  }

  static destroy(key, _query = {}) {
    const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
    const { _primaryKey = 'id' } = this.schema;
    const _attributes = Object.assign({ [_primaryKey]: key }, query);
    return this.dispatch({ action: 'DESTROY', _attributes });
  }

  /* Remote */
  static find(key, _query = {}) {
    const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;
    const { _primaryKey = 'id' } = this.schema;
    const _attributes = { ...query };
    if (key !== undefined) {
      if (typeof key !== 'function') {
        _attributes[_primaryKey] = key;
      }
    }
    return this.dispatch({ action: 'SHOW', _attributes });
  }
  static all(query = {}, options) {
    const _attributes = typeof query === 'string' ? queryStringToObj(query) : query;
    const dispatchOptions = { action: 'INDEX', _attributes };
    if (options) {
      dispatchOptions._options = options;
    }
    return this.dispatch(dispatchOptions);
  }
  static load(query, _options) {
    return this.all(query, _options);
  }
  get reload() {
    const { singleton = false } = this.constructor.store;
    return _query =>
      new Promise((resolve, reject) => {
        const query = typeof _query === 'string' ? queryStringToObj(_query) : _query;

        if (singleton) {
          return this.constructor
            .all(query)
            .then(resolve)
            .catch(reject);
        }
        const [_primaryKey, key] = getKey.call(this);
        const findQuery = Object.assign(this.routeAttributes('SHOW', query), query);
        this.constructor
          .find(findQuery[_primaryKey] || key, without.call(findQuery, _primaryKey))
          .then(resource => {
            Object.assign(this._request, resource._request);
            setReadOnlyProps.call(this, { ...resource }, true);
            setWriteableProps.call(this, { ...this, ...resource });
            Object.defineProperty(this, '_pristine', {
              value: skinnyObject(this._attributes),
              configurable: true,
            });
            Object.freeze(this._pristine);
            resolve(this);
          })
          .catch(({ _errors = {}, _request = {} }) => {
            Object.assign(this._errors, _errors);
            Object.assign(this._request, _request);
            reject(this);
          });
      });
  }

  /* Validations */
  static validations = {};
  static validationsFor() {}
  get isValid() {}
  get isInvalid() {}
}

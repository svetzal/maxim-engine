const PropertyBuilder = require('./property_builder');

class WriteThroughProxyBuilder extends PropertyBuilder {
    constructor(listener) {
        super(listener);

        this.getProxyHandlerWithPath = (target, prop, parentPath) => {
            let propertyPath = typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
            let nt = Reflect.get(target, prop);
            if (typeof(nt) === "object")
            {
                nt = this.build(nt, propertyPath);
            }
            return nt;
        };

        this.setProxyHandlerWithPath = (target, prop, value, parentPath) => {
            let propertyPath = typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
            let changed = Reflect.set(target, prop, value);
            if (changed) this.propertyUseAnalyzer.registerProperty(propertyPath);
            return changed;
        };

        this.defineProxyHandlerWithPath = (target, prop, value, parentPath) => {
            let propertyPath = typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
            let changed = Reflect.defineProperty(target, prop, value);
            if (changed) this.propertyUseAnalyzer.registerProperty(propertyPath);
            return changed;
        };

        this.deleteProxyHandlerWithPath = (target, prop, parentPath) => {
            let propertyPath = typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
            let changed = Reflect.deleteProperty(target, prop);
            if (changed) this.propertyUseAnalyzer.registerProperty(propertyPath);
            return changed;
        };

    }
    buildProxyHandlers(parentPath) {
        return Object.assign(
            {},
            {get: (target, prop) => this.getProxyHandlerWithPath(target, prop, parentPath)},
            {set: (target, prop, value) => this.setProxyHandlerWithPath(target, prop, value, parentPath)},
            {defineProperty: (target, prop, value) => this.defineProxyHandlerWithPath(target, prop, value, parentPath)},
            {deleteProperty: (target, prop) => this.deleteProxyHandlerWithPath(target, prop, parentPath)}
        );
    }

    build(obj, parentPath) {
        return new Proxy(obj, this.buildProxyHandlers(parentPath));
    }

}

module.exports = WriteThroughProxyBuilder;
/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const ProxyBuilder = require('./proxy_builder');

class WriteThroughProxyBuilder extends ProxyBuilder {
    constructor(propertyUseAnalyzer) {
        super(propertyUseAnalyzer);

        this.setProxyHandlerWithPath = this.propertyRegistrationWrapper(
            (target, prop, value) => Reflect.set(target, prop, value)
        );
        this.defineProxyHandlerWithPath = this.propertyRegistrationWrapper(
            (target, prop, value) => Reflect.defineProperty(target, prop, value)
        );
        this.deleteProxyHandlerWithPath = this.propertyRegistrationWrapper(
            (target, prop, _) => Reflect.deleteProperty(target, prop)
        );
    }

    propertyRegistrationWrapper(func) {
        return (target, prop, value, parentPath) => {
            let changed = func(target, prop, value);
            if (changed) this.propertyUseAnalyzer.registerProperty(this.createPath(parentPath, prop));
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
}

module.exports = WriteThroughProxyBuilder;
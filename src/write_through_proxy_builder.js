/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const ProxyBuilder = require('./proxy_builder');

class WriteThroughProxyBuilder extends ProxyBuilder {
    constructor(propertyUseAnalyzer) {
        super(propertyUseAnalyzer);

        this.setProxyHandlerWithPath = (target, prop, value, parentPath) => {
            let changed = Reflect.set(target, prop, value);
            if (changed) this.propertyUseAnalyzer.registerProperty(this.createPath(parentPath, prop));
            return changed;
        };

        this.defineProxyHandlerWithPath = (target, prop, value, parentPath) => {
            let changed = Reflect.defineProperty(target, prop, value);
            if (changed) this.propertyUseAnalyzer.registerProperty(this.createPath(parentPath, prop));
            return changed;
        };

        this.deleteProxyHandlerWithPath = (target, prop, parentPath) => {
            let changed = Reflect.deleteProperty(target, prop);
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
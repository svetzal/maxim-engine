class ProxyBuilder {
    constructor(propertyUseAnalyzer) {
        this.propertyUseAnalyzer = propertyUseAnalyzer;

        this.getProxyHandlerWithPath = (target, prop, parentPath) => {
            let nt = Reflect.get(target, prop);
            if (typeof(nt) === "object")
            {
                nt = this.wrap(nt, this.createPath(parentPath, prop));
            }
            return nt;
        };
    }

    createPath(parentPath, prop) {
        return typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
    }

    wrap(obj, parentPath) {
        return new Proxy(obj, this.buildProxyHandlers(parentPath));
    }

    reset() {
        this.propertyUseAnalyzer.reset();
    }

    getReferencedProperties() {
        return this.propertyUseAnalyzer.getReferencedProperties();
    }
}

module.exports = ProxyBuilder;
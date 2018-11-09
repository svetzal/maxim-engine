const PropertyBuilder = require('./property_builder');

class ReadOnlyProxyBuilder extends PropertyBuilder {
    constructor(listener) {
        super(listener);
        this.getProxyHandlerWithPath = (target, prop, parentPath) => {
            let propertyPath = typeof(parentPath) === 'undefined' ? [prop] : parentPath.concat([prop]);
            this.propertyUseAnalyzer.registerProperty(propertyPath);
            let nt = Reflect.get(target, prop);
            if (typeof(nt) === "object")
            {
                nt = this.build(nt, propertyPath);
            }
            return nt;
        };
    }

    buildProxyHandlers(parentPath) {
        let noMutateLambda = () => {
            throw("You cannot mutate the working memory in a condition");
        };

        return Object.assign(
            {},
            {get: (target, prop) => this.getProxyHandlerWithPath(target, prop, parentPath)},
            {set: noMutateLambda},
            {defineProperty: noMutateLambda},
            {deleteProperty: noMutateLambda}
        );
    }

    build(obj, parentPath) {
        return new Proxy(obj, this.buildProxyHandlers(parentPath));
    }
}

module.exports = ReadOnlyProxyBuilder;
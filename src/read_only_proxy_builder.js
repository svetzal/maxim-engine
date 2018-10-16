const ProxyBuilder = require('./proxy_builder');

class ReadOnlyProxyBuilder extends ProxyBuilder {
    constructor(propertyUseAnalyzer) {
        super(propertyUseAnalyzer);

        this.getProxyHandlerWithPathAndRegister = (target, prop, parentPath) => {
            let result = this.getProxyHandlerWithPath(target, prop, parentPath);
            this.propertyUseAnalyzer.registerProperty(this.createPath(parentPath, prop));
            return result;
        }
    }

    buildProxyHandlers(parentPath) {
        let noMutateLambda = () => {
            throw("You cannot mutate the working memory in a condition");
        };

        return Object.assign(
            {},
            {get: (target, prop) => this.getProxyHandlerWithPathAndRegister(target, prop, parentPath)},
            {set: noMutateLambda},
            {defineProperty: noMutateLambda},
            {deleteProperty: noMutateLambda}
        );
    }

}

module.exports = ReadOnlyProxyBuilder;
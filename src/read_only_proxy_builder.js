class ReadOnlyProxyBuilder {
    constructor() {
        let noMutateLambda = () => {
            throw("You cannot mutate the working memory in a condition");
        };

        this.getProxyHandler = {
            get: (target, prop) => {
                let nt = Reflect.get(target, prop);
                if (typeof(nt) === "object")
                    nt = new Proxy(nt, this.buildProxyHandlers());
                return nt;
            }
        };
        this.setProxyHandler = {set: noMutateLambda};
        this.definePropertyProxyHandler = {defineProperty: noMutateLambda};
        this.deletePropertyProxyHandler = {deleteProperty: noMutateLambda};
    }

    buildProxyHandlers() {
        return Object.assign(
            {},
            this.getProxyHandler,
            this.setProxyHandler,
            this.definePropertyProxyHandler,
            this.deletePropertyProxyHandler
        );
    }

    build(obj) {
        return new Proxy(obj, this.buildProxyHandlers());
    }
}

module.exports = ReadOnlyProxyBuilder;
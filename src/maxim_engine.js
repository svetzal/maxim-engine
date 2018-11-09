const ReadOnlyProxyBuilder = require('./read_only_proxy_builder');

class MaximEngine {
    constructor(readOnlyProxyBuilder) {
        this.rules = [];
        this.readOnlyProxyBuilder = readOnlyProxyBuilder;
    }

    register(param) {
        if (!Array.isArray(param)) return this.registerSingleRule(param);
        param.forEach(r => this.registerSingleRule(r));
    }

    registerSingleRule(rule) {
        if (this.rules.includes(rule)) throw("Rule already registered");
        this.rules.push(rule);
    }

    execute(workingMemory) {
        return this.rules
            .filter(r => r.condition(this.readOnlyProxyBuilder.wrap(workingMemory)))
            .reduce(this.runConsequence, workingMemory);
    }

    // noinspection JSMethodCanBeStatic
    runConsequence(workingMemory, rule) {
        let workingMemoryCopy = Object.assign({}, workingMemory);
        rule.consequence(workingMemoryCopy);
        return workingMemoryCopy;
    }

    ruleCount() {
        return this.rules.length;
    }
}

module.exports = MaximEngine;
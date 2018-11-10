class MaximEngine {
    constructor(readOnlyProxyBuilder, writeThroughProxyBuilder) {
        this.rules = [];
        this.readOnlyProxyBuilder = readOnlyProxyBuilder;
        this.writeThroughProxyBuilder = writeThroughProxyBuilder;
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
            .reduce((wm, rule) => this.runConsequence(wm, rule), workingMemory);
    }

    // noinspection JSMethodCanBeStatic
    runConsequence(workingMemory, rule) {
        let workingMemoryCopy = Object.assign({}, workingMemory);
        let wrappedWorkingMemory = this.writeThroughProxyBuilder.wrap(workingMemoryCopy);
        rule.consequence(wrappedWorkingMemory);
        return workingMemoryCopy;
    }

    ruleCount() {
        return this.rules.length;
    }
}

module.exports = MaximEngine;
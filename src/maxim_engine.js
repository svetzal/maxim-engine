class MaximEngine {
    constructor() {
        this.rules = [];

        let noMutateLambda = () => { throw("You cannot mutate the working memory in a condition") };

        this.conditionProxyHandler = {
            get: (target, prop) => Reflect.get(target, prop), // Use this trap to capture properties with which the condition is concerned
            set: noMutateLambda,
            defineProperty: noMutateLambda,
            deleteProperty: noMutateLambda
        };
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
            .filter(r => r.condition(new Proxy(workingMemory, this.conditionProxyHandler)))
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
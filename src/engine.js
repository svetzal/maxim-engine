/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const _ = require('lodash');
const PropertyUseAnalyzer = require('./property_use_analyzer');
const ReadOnlyProxyBuilder = require('./read_only_proxy_builder');
const WriteThroughProxyBuilder = require('./write_through_proxy_builder');

let readAnalyzer = new PropertyUseAnalyzer();
let defaultReadOnlyProxyBuilder = new ReadOnlyProxyBuilder(readAnalyzer);

let writeAnalyzer = new PropertyUseAnalyzer();
let defaultWriteThroughProxyBuilder = new WriteThroughProxyBuilder(writeAnalyzer);

class Engine {
    constructor(readOnlyProxyBuilder=defaultReadOnlyProxyBuilder, writeThroughProxyBuilder=defaultWriteThroughProxyBuilder) {
        if (typeof(readOnlyProxyBuilder) === 'undefined') throw "Must provide a ReadOnlyProxyBuilder";
        if (typeof(writeThroughProxyBuilder) === 'undefined') throw "Must provide a WriteThroughProxyBuilder";

        this.rules = [];

        this.readOnlyProxyBuilder = readOnlyProxyBuilder;
        this.writeThroughProxyBuilder = writeThroughProxyBuilder;

        this.ruleConditionReferences = [];
        this.ruleConsequenceReferences = [];
    }

    register(param) {
        if (!Array.isArray(param)) return this.registerSingleRule(param);
        param.forEach(r => this.registerSingleRule(r));
    }

    registerSingleRule(rule) {
        if (this.rules.includes(rule)) throw "Rule already registered";
        this.rules.push(rule);
    }

    execute(workingMemory) {
        let firstGeneration = this.rules
            .filter(rule => this.checkCondition(workingMemory, rule))
            .reduce((wm, rule) => this.runConsequence(wm, rule), workingMemory);

        // TODO: This is UGLY! Replace this naive implementation
        this.ruleConsequenceReferences.forEach(consTuple => {
            this.ruleConditionReferences.forEach(condTuple => {
                if (_.isEqual(consTuple[1], condTuple[1])) {
                    firstGeneration = this.runConsequence(firstGeneration, condTuple[0]);
                }
            });
        });

        return firstGeneration;
    }

    checkCondition(workingMemory, rule) {
        this.readOnlyProxyBuilder.reset();
        let result = rule.condition(this.readOnlyProxyBuilder.wrap(workingMemory));
        this.ruleConditionReferences.push([rule, this.readOnlyProxyBuilder.getReferencedProperties()]);
        return result;
    }

    // noinspection JSMethodCanBeStatic
    runConsequence(workingMemory, rule) {
        this.writeThroughProxyBuilder.reset();
        let workingMemoryCopy = Object.assign({}, workingMemory);
        let wrappedWorkingMemory = this.writeThroughProxyBuilder.wrap(workingMemoryCopy);
        rule.consequence(wrappedWorkingMemory);
        this.ruleConsequenceReferences.push([rule, this.writeThroughProxyBuilder.getReferencedProperties()]);
        return workingMemoryCopy;
    }

    ruleCount() {
        return this.rules.length;
    }
}

module.exports = Engine;
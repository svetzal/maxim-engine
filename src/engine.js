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

function sortByPriority(a,b) {
    if (a.priority > b.priority) return -1;
    if (a.priority < b.priority) return 1;
    return 0;
}

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

    execute(workingMemory, maxGenerations=10) {
        this.initializeInstrumentation();
        let result = this.processRules(this.rules, workingMemory, maxGenerations);
        this.lastExecution.time = Date.now() - this.lastExecution.start;
        return result;
    }

    initializeInstrumentation() {
        this.lastExecution = {
            start: Date.now(),
            generations: []
        };
    }

    processRules(rulesList, workingMemory, count) {
        var currentMemory = workingMemory;

        if (count > 0) {
            if (rulesList.length > 0) {
                rulesList
                    .sort(sortByPriority)
                    .forEach(rule => {
                        if (this.checkCondition(currentMemory, rule)) {
                            currentMemory = this.runConsequence(currentMemory, rule);
                        }
                    });

                let newRulesList = [];
                this.ruleConsequenceReferences.forEach(consTuple => {
                    this.ruleConditionReferences.forEach(condTuple => {
                        if (_.isEqual(consTuple[1], condTuple[1])) {
                            if (!newRulesList.includes(condTuple[0])) newRulesList.push(condTuple[0]);
                        }
                    });
                });

                currentMemory = this.processRules(newRulesList, currentMemory, count-1);
            }
        }

        return currentMemory;
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
        this.lastExecution.generations.push({rule: rule, initial: workingMemory, result: workingMemoryCopy});
        return workingMemoryCopy;
    }

    ruleCount() {
        return this.rules.length;
    }
}

module.exports = Engine;
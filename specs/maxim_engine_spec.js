/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;
const sinon = require('sinon');

const PropertyUseAnalyzer = require('../src/property_use_analyzer');
const ReadOnlyProxyBuilder = require('../src/read_only_proxy_builder');
const WriteThroughProxyBuilder = require('../src/write_through_proxy_builder');
const MaximEngine = require('../src/maxim_engine');

describe("MaximEngine Integration", () => {

    var engine, readAnalyzer, writeAnalyzer;

    beforeEach(() => {
        readAnalyzer = new PropertyUseAnalyzer();
        let readOnlyProxyBuilder = new ReadOnlyProxyBuilder(readAnalyzer);

        writeAnalyzer = new PropertyUseAnalyzer();
        let writeThroughProxyBuilder = new WriteThroughProxyBuilder(writeAnalyzer);

        engine = new MaximEngine(readOnlyProxyBuilder, writeThroughProxyBuilder);
    });

    it("should register a single rule", () => {
        let rule = {};
        engine.register(rule);
        expect(engine.ruleCount()).to.equal(1);
    });

    it("should register multiple different rules", () => {
        let rule1 = {};
        let rule2 = {};
        engine.register([rule1, rule2]);
        expect(engine.ruleCount()).to.equal(2);
    });

    it("should not allow registering the same rule twice", () => {
        let rule = {};
        expect(() => {
            engine.register([rule, rule]);
        }).to.throw();
    });

    it("should pass working memory unchanged when no rules", () => {
        let workingMemory = {data: "thingie"};
        expect(engine.execute(workingMemory)).to.deep.equal(workingMemory);
    });

    it("should process a simple rule", () => {
        let initialValue = "initial";
        let transformedValue = "transformed";
        engine.register({
            condition: wm => wm.data === initialValue,
            consequence: wm => wm.data = transformedValue
        });

        let output = engine.execute({data: initialValue});

        expect(output).to.deep.equal({data: transformedValue});
    });

    it("should not be able to mutate working memory in a condition", () => {
        engine.register({
            condition: wm => wm.message = "goodbye",
            consequence: wm => wm
        });

        expect(() => engine.execute({})).to.throw();
    });

    describe("rule chain", () => {

        let sampleRule1 = {
            condition: wm => wm.message === 'hello',
            consequence: wm => wm.message = 'goodbye'
        };

        let sampleRule2 = {
            condition: wm => wm.message === 'goodbye',
            consequence: wm => wm.message = 'au revoir'
        };

        it("should re-evaluate the ruleset once", () => {
            engine.register([sampleRule1, sampleRule2]);
            let wm = engine.execute({message: 'hello'});
            expect(wm.message).to.equal('au revoir');
        });

    });

});
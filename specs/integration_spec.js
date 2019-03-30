/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;

const {MaximEngine} = require('../index');

describe("MaximEngine Public Functionality", () => {

    var engine, readAnalyzer, writeAnalyzer;

    beforeEach(() => {
        engine = new MaximEngine();
        readAnalyzer = engine.readOnlyProxyBuilder.propertyUseAnalyzer;
        writeAnalyzer = engine.writeThroughProxyBuilder.propertyUseAnalyzer;
    });

    it("should not execute without rules", () => {
        expect(_ => engine.execute({})).to.throw();
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

    it("should disallow adding more rules after execution", () => {
        let createRule = (msg) => ({
            condition: wm => wm.message === msg,
            consequence: wm => wm
        });
        engine.register(createRule(1));
        engine.execute({});

        expect(_ => engine.register(createRule(2))).to.throw();
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

    describe("prioritization", () => {

        let rules = [
            {
                priority: 100,
                condition: wm => wm.value === 1,
                consequence: wm => wm.value = 100
            },
            {
                priority: 1,
                condition: wm => wm.value === 1,
                consequence: wm => wm.value = 10
            }
        ];

        it("should evaluate the rules in priority order", () => {
            engine.register(rules);
            let wm = engine.execute({value: 1});
            expect(wm.value).to.equal(100);
        });

    });

    describe("instrumentation", () => {

        let rules = [
            {
                priority: 10,
                description: 'Default message, if none provided, is hello.',
                condition: wm => !('message' in wm),
                consequence: wm => wm.message = 'hello'
            },
            {
                description: 'When the message is hello, change it to goodbye.',
                condition: wm => wm.message === 'hello',
                consequence: wm => wm.message = 'goodbye'
            },
            {
                description: 'Registered, but will not fire.',
                condition: wm => false,
                consequence: wm => wm
            }
        ];

        let wmGenerations;

        beforeEach(() => {
            engine.register(rules);
            engine.execute({});
            wmGenerations = engine.lastExecution.generations;
        });

        it('should include which rules ran', () => {
            expect(wmGenerations.length).to.equal(2);
            expect(wmGenerations[0].rule).to.deep.equal(rules[0]);
            expect(wmGenerations[1].rule).to.deep.equal(rules[1]);
        });

        it('should include the incoming working memory for each rule run', () => {
            expect(wmGenerations[0].initial).to.deep.equal({});
            expect(wmGenerations[1].initial).to.deep.equal({message: 'hello'});
        });

        it('should include the outgoing working memory for each rule run', () => {
            expect(wmGenerations[0].result).to.deep.equal({message: 'hello'});
            expect(wmGenerations[1].result).to.deep.equal({message: 'goodbye'});
        });

        it('should provide timing of the rule run', () => {
            expect(engine.lastExecution.time).to.not.be.null;
        });

    });

});
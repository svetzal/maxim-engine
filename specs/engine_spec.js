/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;
const sinon = require('sinon');

const Engine = require('../src/engine');

describe('Engine', () => {

    let engine, readOnlyProxyBuilderDouble, writeThroughProxyBuilderDouble, dummyData;

    beforeEach(() => {
        dummyData = { data: 'dummy' };
        readOnlyProxyBuilderDouble = {
            reset: sinon.spy(),
            wrap: sinon.stub().returns(dummyData),
            getReferencedProperties: sinon.spy()
        };
        writeThroughProxyBuilderDouble = {
            reset: sinon.spy(),
            wrap: sinon.stub().returns(dummyData),
            getReferencedProperties: sinon.spy()
        };
        engine = new Engine(readOnlyProxyBuilderDouble, writeThroughProxyBuilderDouble);
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

    describe('collaboration', () => {
        beforeEach(() => {
            engine.register({
                condition: wm => wm.data === "dummy",
                consequence: wm => wm.data = "transformed"
            });
            engine.execute(dummyData);
        });

        describe('with ReadOnlyProxyBuilder', () => {
            it('should reset referenced properties', () => {
                expect(readOnlyProxyBuilderDouble.reset.callCount).to.equal(1);
            });

            it('should wrap working memory after reset', () => {
                expect(readOnlyProxyBuilderDouble.wrap.callCount).to.equal(1);
                expect(readOnlyProxyBuilderDouble.reset.calledBefore(readOnlyProxyBuilderDouble.wrap)).to.be.true;
            });

            it('should provide referenced properties', () => {
                expect(readOnlyProxyBuilderDouble.getReferencedProperties.callCount).to.equal(1);
            });
        });

        describe('with writeThroughProxyBuilder, calls made twice', () => {
            // Twice because the consequence in the sample rule above fires the rule a second time by changing the
            // referenced property in the condition

            it('should reset referenced properties', () => {
                expect(writeThroughProxyBuilderDouble.reset.callCount).to.equal(2);
            });

            it('should wrap working memory after reset', () => {
                expect(writeThroughProxyBuilderDouble.wrap.callCount).to.equal(2);
                expect(writeThroughProxyBuilderDouble.reset.calledBefore(writeThroughProxyBuilderDouble.wrap)).to.be.true;
            });

            it('should provide referenced properties', () => {
                expect(writeThroughProxyBuilderDouble.getReferencedProperties.callCount).to.equal(2);
            });
        });
    });


});
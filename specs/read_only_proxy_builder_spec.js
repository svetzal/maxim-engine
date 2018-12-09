/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;

const ReadOnlyProxyBuilder = require('../src/read_only_proxy_builder');
const PropertyUseAnalyzer = require('../src/property_use_analyzer');

describe('ReadOnlyProxyBuilder', () => {

    let builder;
    let listener;

    beforeEach(() => {
        listener = new PropertyUseAnalyzer();
        builder = new ReadOnlyProxyBuilder(listener);
    });

    describe('top level properties', () => {

        // todo: This will pass for some reason even when no "set" trap? defineProperty seems to catch it.
        it('should not allow setting a property', () => {
            let proxy = builder.wrap({message: "blah"});
            expect(() => proxy.message = "something else").to.throw();
        });

        it('should not allow creating a property', () => {
            let proxy = builder.wrap({});
            expect(() => {
                return Object.defineProperty(proxy, 'message', {value: 'created'});
            }).to.throw();
        });

        it('should not allow removing a property', () => {
            let proxy = builder.wrap({message: "blah"});
            expect(() => delete proxy.message).to.throw();
        });

        it('should handle the "in" keyword correctly for object properties', () => {
            let proxy = builder.wrap({message: "blah"});
            expect('message' in proxy).to.be.true;
            expect(!('missing' in proxy)).to.be.true;
        })

    });

    describe("nested objects", () => {

        it('should not allow setting a property in a nested object', () => {
            let proxy = builder.wrap(
                {
                    obj: {
                        message: "hello"
                    }
                }
            );
            expect(() => proxy.obj.message = "blah").to.throw();
        });

        it('should not allow creating a property', () => {
            let proxy = builder.wrap({ obj: {} });
            expect(() => Object.defineProperty(proxy.obj, 'message', {value: 'created'})).to.throw();
        });

        it('should not allow deleting a property', () => {
            let proxy = builder.wrap({ obj: { message: "blah" } });
            expect(() => delete proxy.obj.message).to.throw();
        });

        it('should handle many nests', () => {
            let proxy = builder.wrap({
                obj: {
                    thing1: {
                        blah: {
                            message: 'Hello!'
                        }
                    },
                    thing2: {
                        halb: {
                            message: 'Goodbye!'
                        }
                    }
                }
            });
            expect(() => proxy.obj.thing1.blah.message = "blah").to.throw();
            expect(() => proxy.obj.thing2.halb.message = "blah").to.throw();
            expect(() => proxy.obj.thing2 = {}).to.throw();
        });

    });

    describe('works with a property listener', () => {

        it('should register single property usage', () => {
            let proxy = builder.wrap({ key: 123, message: 'hello' });
            let a = proxy.message;
            expect(listener.getReferencedProperties()).to.deep.equal([['message']]);
        });

        it('should register multiple property usages', () => {
            let proxy = builder.wrap({ key: 123, message: 'hello' });
            let a = proxy.message;
            let b = proxy.key;
            expect(listener.getReferencedProperties()).to.deep.equal([['key'], ['message']]);
        });

        it('should register nested property usages', () => {
            let proxy = builder.wrap({ key: 123, obj: { message: 'hello' } } );
            let a = proxy.obj.message;
            expect(listener.getReferencedProperties()).to.deep.equal([['obj'], ['obj', 'message']]);
        });

        it('should discern nested properties of the same name', () => {
            let proxy = builder.wrap({ a: { message: 'one' }, b: { message: 'two' } });
            let one = proxy.a.message;
            let two = proxy.b.message;
            expect(listener.getReferencedProperties()).to.deep.equal([['a'], ['a', 'message'], ['b'], ['b', 'message']]);
        });

    });

});
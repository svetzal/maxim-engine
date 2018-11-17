/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;

const PropertyUseAnalyzer = require('../src/property_use_analyzer');
const WriteThroughProxyBuilder = require('../src/write_through_proxy_builder');

describe('WriteThroughProxyBuilder', () => {

    let builder;
    let listener;

    beforeEach(() => {
        listener = new PropertyUseAnalyzer();
        builder = new WriteThroughProxyBuilder(listener);
    });

    describe('works with a property listener', () => {

        it('should not register property reads', () => {
           let proxy = builder.wrap({ key: 123, message: 'hello' });
           let a = proxy.message;
           expect(listener.getReferencedProperties()).to.deep.equal([]);
        });

        it('should register single property write', () => {
            let newMessage = 'goodbye';
            let proxy = builder.wrap({ key: 123, message: 'hello' });
            proxy.message = newMessage;
            expect(listener.getReferencedProperties()).to.deep.equal([['message']]);
            expect(proxy.message).to.equal(newMessage);
        });

        it('should register single property defined by set', () => {
            let message = 'hello';
            let proxy = builder.wrap({ key: 123 });
            proxy.message = message;
            expect(listener.getReferencedProperties()).to.deep.equal([['message']]);
            expect(proxy.message).to.equal(message);
        });

        it('should register single property deleted', () => {
           let proxy = builder.wrap({ key: 123, message: 'delete me' });
           delete proxy.message;
            expect(listener.getReferencedProperties()).to.deep.equal([['message']]);
            expect(typeof(proxy.message)).to.equal('undefined');
        });

        it('should register single property defined through Object', () => {
            let message = "hello";
            let proxy = builder.wrap({});
            Object.defineProperty(proxy, 'message', { value: message, writable: false }); // TODO: Test around this writable attr?
            expect(listener.getReferencedProperties()).to.deep.equal([['message']]);
        });

        it('should register single property changed in sub object', () => {
            let newMessage = 'changed';
            let proxy = builder.wrap({ key: 123, obj: { message: 'hello' }});
            proxy.obj.message = newMessage;
            expect(listener.getReferencedProperties()).to.deep.equal([['obj', 'message']]);
            expect(proxy.obj.message).to.equal(newMessage);
        });

    });

});
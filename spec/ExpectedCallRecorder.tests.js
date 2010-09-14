

describe("ExpectedCallRecorder", function() {

    var expectedReturnValue1;
    var expectedReturnValue2;
    var expectedReturnValue3;

    var sut;

    var foo;

    beforeEach(function() {
        expectedReturnValue1 = {a:1};
        expectedReturnValue2 = {b:2};
        expectedReturnValue3 = {c:3};

        sut = new ExpectedCallRecorder();

        sut.record("method1", [1, 2, 3], expectedReturnValue1);
        sut.record("method2", [4, 5, 6], expectedReturnValue2);
        sut.record("method1", [7, 8, 9], expectedReturnValue3);

        foo = {
            m1: function() { },
            m2: function() { }
        };

        spyOn(foo, "m1").andCallFake(sut.recordedMethod("method1"));
        spyOn(foo, "m2").andCallFake(sut.recordedMethod("method2"));
    });

    it("allows for record/playback", function() {

        expect(foo.m1(1, 2, 3)).toEqual(expectedReturnValue1);
        expect(foo.m2(4, 5, 6)).toEqual(expectedReturnValue2);
        expect(foo.m1(7, 8, 9)).toEqual(expectedReturnValue3);
    });

    describe("and detects incorrect playback", function() {

        beforeEach(function() {
            expect(foo.m1(1, 2, 3)).toEqual(expectedReturnValue1);
        });

        it("of wrong method", function() {

            expect(function() {
            
                foo.m1(4,5,6);        
            }).toThrow("Call recording #2 failed: Expected call to method 'method2', actual method called was 'method1'.");
        });
        
        it("with wrong parameters", function() {
        
            expect(function() {
            
                foo.m2(4,1,6);        
            }).toThrow("Call recording #2 failed: Mismatch at parameter #2, expected '5' but was '1'.");
        });
        
        it("with too many parameters", function() {
            expect(function() {
            
                foo.m2(4,5,6,7);        
            }).toThrow("Call recording #2 failed: Expected 3 parameters, received 4 parameters.");
        });
        
        it("with too few parameters", function() {
            expect(function() {
            
                foo.m2(4,5);        
            }).toThrow();
        });
        
        it("without all calls matched,", function() {
        
            expect(function() {
                sut.verify();
            }).toThrow("Call record and playback failed, received 1 call when expecting 3.");
        });
        
        it("of extra method", function() {
            expect(foo.m2(4, 5, 6)).toEqual(expectedReturnValue2);
            expect(foo.m1(7, 8, 9)).toEqual(expectedReturnValue3);
            
            expect(function() {
                expect(foo.m1()).toEqual(expectedReturnValue3);
            }).toThrow("Call record and playback failed, unexpected call to 'method1'.");
        });        
    });
});


function ExpectedCallRecorder() {
    this._recordedCalls = [];
    this._position = 0;
}

ExpectedCallRecorder.prototype = {
    record: function(name, parameters, returnValue) {
        this._recordedCalls.push({
            name: name,
            parameters: parameters,
            returnValue: returnValue
        });
    },
    recordedMethod: function(name) {

        var that = this;

        return function() {

            if (that._recordedCalls.length <= that._position) {
                throw new Error("Call record and playback failed, unexpected call to '" + name + "'.");
            }

            var expectedCall = that._recordedCalls[that._position];

            if (name != expectedCall.name)
                that.throwError("Expected call to method '" + expectedCall.name + "', actual method called was '" + name + "'.");

            for (var i = 0; i < expectedCall.parameters.length; i++) {

                if (expectedCall.parameters[i] != arguments[i]) {
                    that.throwError("Mismatch at parameter #" + (i + 1)
                            + ", expected '" + jasmine.pp(expectedCall.parameters[i]) + "'"
                            + " but was '" + jasmine.pp(arguments[i]) + "'.");
                }
            }

            if (arguments.length > expectedCall.parameters.length) {
                that.throwError("Expected " + expectedCall.parameters.length + " parameters, received " + arguments.length + " parameters.");
            }

            that._position++;

            return expectedCall.returnValue;
        };
    },
    throwError: function(description) {

        throw new Error("Call recording #" + (this._position + 1) + " failed: " + description);
    },
    verify: function() {

        if (this._position != this._recordedCalls.length) {
            throw new Error("Call record and playback failed, received " + this._position + " call when expecting " + this._recordedCalls.length + ".");
        }
    }
};
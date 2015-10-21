cdApp.service('shareCallSID', function() {
    var callSID = '';
    
    return {
        getcallSID: function() {
            return callSID;
        },
        setcallSID: function(value) {
            callSID = value;
        }
    }
});

module("objjs", {
    setup: function() {
    },
    teardown: function() {
    }
});

function setup() {
    var child1 = objjs.object.extend(function (input1) {
        this._super();
        
        this.input1 = input1;
        this.hello = "1";
    });
    
    var child2 = child1.extend(function (input1, input2) {
        this._super(input1);
        
        this.input2 = input2;
        this.hello += "2";
    });
    
    var child3 = child2.extend(function (input1, input2, input3) {
        this._super(input1, input2);
        
        this.input3 = input3;
        this.hello += "3";
    });
    
    child1.prototype.method = function (arg1) {
        this.goodbye = arg1;
    };
    child2.prototype.method = function (arg1, arg2) {
        this._super(arg1);
        this.goodbye += arg2;
    };
    child3.prototype.method = function (arg1, arg2, arg3) {
        this._super(arg1, arg2);
        this.goodbye += arg3;
    };
    
    return {
        child1: child1,
        child2: child2,
        child3: child3
    };
}

test("smoke test, _super()", function () {
    // arrange
    var children = setup();
    
    // act
    var subject = new children.child3("X", "Y", "Z");
    subject.method("A", "B", "C");
    
    // assert
    strictEqual(subject.hello, "123");
    strictEqual(subject.goodbye, "ABC");
    strictEqual(subject.input1, "X");
    strictEqual(subject.input2, "Y");
    strictEqual(subject.input3, "Z");
});

test("getInheritanceChain", function () {
    // arrange
    var children = setup();
    
    // act
    var chain = objjs.object.getInheritanceChain(children.child3);
    
    // assert
    strictEqual(chain.length, 5);
    strictEqual(chain[0], children.child3);
    strictEqual(chain[1], children.child2);
    strictEqual(chain[2], children.child1);
    strictEqual(chain[3], objjs.object);
    strictEqual(chain[4], Object);
});
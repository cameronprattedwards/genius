describe("Resource requests", function () {
    var Zombie, backend;
    beforeEach(function () {
        genius.box.kernel.wipe(genius.box.modules.realDataModule);
        genius.box.kernel.add(genius.box.modules.fakeDataModule);
        backend = genius.box.HttpBackend();
        Zombie = genius.Resource.extend({
            url: "/api/zombies/:id",
            uniqKey: "id",
            name: genius.types.string(),
            id: genius.types.number(),
            rand: genius.types.number()
        });
    });

    it("should save new resources with POST", function () {
        backend.expectPost("/api/zombies").toReturn("{name: \"Muncher\", id: 1, rand: 1091}");
        var zombie = new Zombie({
            name: "Muncher",
            rand: 98238
        });
        expect(zombie.isNew()).toBe(true);
        zombie.$save();
        expect(zombie.isLoading()).toBe(true);
        backend.flush();
        expect(zombie.id()).toBe(1);
        expect(zombie.rand()).toBe(1091);
        expect(zombie.isLoading()).toBe(false);
    });

    it("should call the config's custom parse method", function () {
        genius.config.ajax.parse = function (response) {
            genius.Resource.prototype.parse.call(this, response.data);
        };
        backend.expectGet("/api/zombies/5").toReturn("{success: true, errors: [], data: {name: \"Jeanne\", id: 5, rand: 4801}}");
        var zombie = Zombie.$get({ id: 5 });
        backend.flush();
        expect(zombie.name()).toBe("Jeanne");
        expect(zombie.rand()).toBe(4801);
        expect(zombie.errors).toBeUndefined();

        genius.config.reset();
        expect(genius.config.parse).toBeUndefined();
    });

    it("should call the resource's custom parse method", function () {
        backend.expectGet("/api/zombies/4").toReturn("{success: true, zombie: {name: \"Vladimir\", id: 4, rand: 3939}}");
        Zombie.parse = function (response) {
            var base = genius.Resource.prototype.parse;
            base.call(this, response.zombie);
        };
        var zombie = Zombie.$get({ id: 4 });
        backend.flush();
        expect(zombie.name()).toBe("Vladimir");
        expect(zombie.id()).toBe(4);
        expect(zombie.rand()).toBe(3939);
        //You can always modify genius.Resource.prototype.parse if you're feeling brave.
    });

    it("should fail to request deletion with new resources", function () {
        var zombie = new Zombie({
            name: "Harold",
            rand: 2630
        });
        var deletedZombie = Zombie.$delete(zombie);
        expect(deletedZombie).toBe(null);
        expect("name" in zombie).toBe(false);
        expect("rand" in zombie).toBe(false);
        expect("id" in zombie).toBe(false);
        expect(zombie.isDeleted()).toBe(true);
        expect(zombie.$save).toThrow();
    });

    it("should delete resources with DELETE", function () {
        backend.expectGet("/api/zombies/3").toReturn("{name: \"Malvolio\", id: 3, rand: 5757}");
        backend.expectDelete("/api/zombies/3").toReturn("null");
        var zombie = Zombie.$get({ id: 3 });
        backend.flush();
        //I can't really think of a good way to test this.
    });

    it("should save old resources with PUT", function () {
        backend.expectGet("/api/zombies/3").toReturn("{name: \"Malvolio\", id: 3, rand: 5757}");
        backend.expectPut("/api/zombies/3").toReturn("{name: \"Mercutio\", id: 3, rand: 4598}");
        var zombie = Zombie.$get({ id: 3 });
        expect(zombie.isLoading()).toBe(true);
        expect(zombie.id()).toBe(3);
        backend.flush();
        expect(zombie.isLoading()).toBe(false);
        expect(zombie.name()).toBe("Malvolio");
        expect(zombie.rand()).toBe(5757);
        zombie.name("Mercutio");
        expect(zombie.isDirty()).toBe(true);
        expect(zombie.name.isDirty()).toBe(true);
        zombie.$save();
        expect(zombie.isLoading()).toBe(true);
        backend.flush();
        expect(zombie.name()).toBe("Mercutio");
        expect(zombie.rand()).toBe(4598);
        expect(zombie.isDirty()).toBe(false);
        expect(zombie.name.isDirty()).toBe(false);
    });

    it("should parse queries into resources", function () {
        backend.expectGet("/api/zombies?q=munch").toReturn("[{name: \"Muncher\", id: 1, rand: 1091},{name:\"Munchkin\", id: 2, rand: 5687}]");
        var zombies = Zombie.$query({ q: "munch" });
        expect(zombies).toEqual(jasmine.any(genius.Collection));
        expect(zombies.type()).toBe(Zombie);
        expect(zombies.isLoading()).toBe(true);
        expect(zombies.length).toBe(0);
        backend.flush();
        expect(zombies.length).toBe(2);
        for (var i = 0; i < zombies.length; i++) {
            expect(zombies[i]).toEqual(jasmine.any(Zombie));
        }
        expect(zombies.isLoading()).toBe(false)
        expect(zombies[0].name()).toBe("Muncher");
        expect(zombies[1].name()).toBe("Munchkin");
    });
});

describe("The genius box", function () {
    var Zombie, ZombieKing;
    beforeEach(function () {
        Zombie = genius.Resource.extend({
            eatingBrains: genius.types.bool(),
            eatBrains: function () { this.eatingBrains(true); }
        });
        ZombieKing = Zombie.extend({
            administrating: genius.types.bool(),
            ruleZombies: function () { this.administrating(true); }
        });
        genius.box.modules.register("zombieModule", {
            "Zombie": genius.box.dependency(function () { return new Zombie(); }),
            "ZombieKing": genius.box.dependency(function () { return new ZombieKing(); }).singleton()
        });
        genius.box.kernel.add(genius.box.modules.zombieModule);
    });

    afterEach(function () {
        genius.box.kernel.reset();
    });

    it("should accept and serve different data modules", function () {
        var zombie1 = genius.box.Zombie(),
            zombie2 = genius.box.Zombie();
        expect(zombie1).not.toBe(zombie2);
        expect(zombie1).toEqual(jasmine.any(Zombie));
        var king1 = genius.box.ZombieKing(),
            king2 = genius.box.ZombieKing();
        expect(king1).toBe(king2);
    });

    it("should unregister data modules", function () {
        genius.box.kernel.wipe(genius.box.modules.zombieModule);
        expect(genius.box.Zombie).toBeUndefined();
        expect(genius.box.ZombieKing).toBeUndefined();
    });

    it("should set singletons", function () {
        //This is poor practice - dependencies should be declared only within their own scopes.
        //But it's necessary for the instanceof test to work.
        function Singleton() {
            this.prop = "Property";
        };
        Singleton.prototype = {
            func: function () { return "Function"; }
        };
        genius.box.set("Singleton", function () { return new Singleton(); }).singleton();
        var singleton = genius.box.Singleton();
        var singleton2 = genius.box.Singleton();
        expect(singleton).toBe(singleton2);
        expect(singleton).toEqual(jasmine.any(Singleton));
    });

    it("should set services", function () {
        function Service() {
            this.prop = "Another property";
        };
        Service.prototype = {
            func: function () { return "Another function"; }
        };
        var factory = function () { return new Service(); };
        genius.box.set("Service", factory);
        genius.box.set("ServiceSpec", factory).service();
        expect(genius.box.Service).toBe(genius.box.ServiceSpec);
        expect(genius.box.Service()).toEqual(jasmine.any(Service));
        expect(genius.box.ServiceSpec()).toEqual(jasmine.any(Service));
        expect(genius.box.Service).toBe(factory);
    });
});

describe("A deferred", function () {
    var test, test2, test3, test4, deferred;
    function init() {
        test = "One string";
        test2 = "Two string";
        test3 = "";
        test4 = "";
        deferred = new genius.Deferred();
        deferred
            .done(function (var1, var2) { test = "Red string " + var1 + " and " + var2; })
            .done(function (var1, var2) { test2 = "Blue string " + var1 + " and " + var2; })
            .fail(function (var1, var2) { test = "Green string " + var1 + " and " + var2; })
            .fail(function (var1, var2) { test2 = "Yellow string " + var1 + " and " + var2; })
            .always(function (var1, var2) { test3 = "Orange string " + var1 + " and " + var2; })
            .always(function (var1, var2) { test4 = "Violet string " + var1 + " and " + var2; });
    }

    beforeEach(function () {
        init();
    });

    it("should supply promises", function () {
        var test1 = "", test2 = "";
        var promise = deferred.promise();
        promise.done(function () { test1 = "Success"; }).fail(function () { test1 = "Failure"; }).always(function () { test2 = "Complete"; });
        deferred.resolve();
        expect(test1).toBe("Success");
        expect(test2).toBe("Complete");
    });

    it("should execute success callbacks on resolve()", function () {
        expect(test).toBe("One string");
        expect(test2).toBe("Two string");
        deferred.resolve("Good", "Happiness");
        expect(test).toBe("Red string Good and Happiness");
        expect(test2).toBe("Blue string Good and Happiness");
    });

    it("should execute fail callbacks on reject()", function () {
        deferred.reject("Bad", "Sadness");
        expect(test).toBe("Green string Bad and Sadness");
        expect(test2).toBe("Yellow string Bad and Sadness");
    });

    it("should execute always callbacks on reject() or resolve()", function () {
        deferred.resolve("Good", "Happiness");
        expect(test3).toBe("Orange string Good and Happiness");
        expect(test4).toBe("Violet string Good and Happiness");
        init();
        deferred.reject("Bad", "Sadness");
        expect(test3).toBe("Orange string Bad and Sadness");
        expect(test4).toBe("Violet string Bad and Sadness");
    });
});

describe("Resources", function () {
    it("should allow retrieval of their original options hashes", function () {
        var Class = genius.Resource.extend({});

        var options = {
            str: "A string",
            num: 123,
            date: new Date(2013, 0, 1),
            obj: { something: "something else" }
        };
        var myClass = new Class(options);
        expect(myClass.optionsHash()).toBe(options);
    });

    it("should allow serialization to plain old JavaScript objects", function () {
        var Sub = genius.Resource.extend({
            num: genius.types.number({ defaultTo: 19 }),
            name: genius.types.string({ defaultTo: "Cameron" })
        });

        var Class = genius.Resource.extend({
            date: genius.types.date(),
            num: genius.types.number(),
            bool: genius.types.bool(),
            sub: genius.types(Sub).extend({ defaultTo: function () { return new Sub(); }})
        });
        var myClass = new Class();
        var date = myClass.date();
        expect(date instanceof Date).toBe(true);
        expect(myClass.toJs()).toEqual({
            date: date,
            num: 0,
            bool: false,
            sub: {
                num: 19,
                name: "Cameron"
            }
        });
        var myClass2 = new Class({ date: new Date(2013, 0, 1), num: 149, bool: true, sub: { name: "Josephus" } });
        date = myClass2.date();
        expect(myClass2.toJs()).toEqual({
            date: date,
            num: 149,
            bool: true,
            sub: {
                num: 19,
                name: "Josephus"
            }
        });
    });
});

describe("Unique models", function () {
    it("should ensure uniqueness by some key", function () {
        //A unique key must be nullable.
        expect(function () {
            genius.Resource.extend({
                uniqKey: "id",
                id: genius.types.number({ nullable: false })
            });
        }).toThrow();
        //A unique key must be a number or string
        expect(function () {
            genius.Resource.extend({
                uniqKey: "id",
                id: genius.types.date()
            });
        });
        var Sub = genius.Resource.extend({
            uniqKey: "id",
            id: genius.types.number()
        });
        var Class = genius.Resource.extend({
            uniqKey: "sub.id",
            sub: genius.types(Sub)
        });
        var myClass = new Class({
            sub: {
                id: 9
            }
        });
        var myClass2 = new Class({
            sub: {
                id: 9
            },
            frenchFries: "delicious"
        });
        expect(myClass).toBe(myClass2);
        expect(myClass.frenchFries()).toBe("delicious");
    });
});

describe("Parsers", function () {
    it("should parse input hash into property", function () {
        var Class = genius.Resource.extend({
            date: genius.types.date({
                parse: function (input) {
                    return new Date(input[0], input[1], input[2]);
                }
            })
        });
        var myClass = new Class({ date: [2013, 0, 1] });
        var date = myClass.date();
        expect(date.getFullYear()).toBe(2013);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(1);
        var myClass2 = new Class();
        expect(new Date() - myClass2.date()).toBeLessThan(10);
    });
});

describe("Getters and setters", function () {
    it("should create a hash of dirty properties", function () {
        var Obj = function () { };

        var Class = genius.Resource.extend({
            str: genius.types.string(),
            num: genius.types.number(),
            date: genius.types.date(),
            obj: genius.types(Obj)
        });

        var myClass = new Class({
            str: "Init string",
            num: 10,
            date: new Date(),
            obj: new Obj()
        });

        var testDate = new Date();
        expect(myClass.changedProperties()).toEqual({});
        myClass.str("Another string");
        myClass.date(testDate);
        expect(myClass.changedProperties()).toEqual({str:"Another string", date: testDate});
    });

    it("should mark changed variables as dirty", function () {
        var Class = genius.Resource.extend({
            test: genius.types.bool()
        });
        var myClass = new Class();
        expect(myClass.test()).toBe(false);
        expect(myClass.test.isDirty()).toBe(false);
        myClass.test(false);
        expect(myClass.test.isDirty()).toBe(false);
        myClass.test(true);
        expect(MyClass.test.isDirty()).toBe(true);
    });
});

describe("Constructors", function () {
    it("should be called on creation of resource", function () {
        var Class = genius.Resource.extend({
            init: function (options) {
                this.arbitrary = "Arbitrary string";
                this.hash = JSON.stringify(options);
            }
        });
        var options = {prop: "value"};
        var myClass = new Class(options);
        expect(myClass.arbitrary).toBe("Arbitrary string");
        expect(myClass.hash).toBe(JSON.stringify(options));
    });
});

describe("Genius config", function () {
    it("should allow transformation of JSON into camel case", function () {
        var json = {
            TestVar: "Test Var",
            SubObj: {
                Test1: "Test 1",
                Test2: "Test 2"
            }
        };
        function initTest() {
            var Class = genius.Resource.extend({
                testVar: genius.types.string()
            });
            var myClass = new Class(json);
            expect(myClass.testVar()).toBe("");
            expect(myClass.TestVar()).toBe("Test Var");
        }
        initTest();
        expect(genius.config.transformToCamelCase()).toBe(false);
        genius.config.transformToCamelCase(true);
        initTest();
        //we must redefine, since midstream changes can't change declared classes.
        var Class2 = genius.Resource.extend({
            testVar: genius.types.string()
        });
        var myClass = new Class2(json);
        expect(myClass.testVar()).toBe("Test Var");
        expect(myClass.TestVar).toBeUndefined();
        expect(myClass.subObj().test1).not.toBeUndefined();
        expect(myClass.subObj().test2).not.toBeUndefined();
        expect(myClass.subObj().Test1).toBeUndefined();
        expect(myClass.subObj().Test2).toBeUndefined();

        var Class3 = genius.Resource.extend({
            testVar: genius.types.string(),
            TestVar: genius.types.string()
        });
        var myClass2 = new Class3(json);
        expect(myClass.testVar()).toBe("Test Var");
        expect(myClass.TestVar()).toBe("Test Var");
        myClass.testVar("Another var");
        expect(myClass.testVar()).toBe("Another var");
        expect(myClass.TestVar()).toBe("Another var");
        myClass.TestVar("Last var");
        expect(myClass.testVar()).toBe("Last var");
        expect(myClass.TestVar()).toBe("Last var");
    });

    it("should set default parser on a type", function () {
        var dateParse = genius.config.types.date.parse,
            numParse = genius.config.types.number.parse,
            boolParse = genius.config.types.bool.parse;

        genius.config.types.date.parse(function (input) {
            return new Date(parseInt(input));
        });
        genius.config.types.number.parse(function (input) {
            return parseInt(input);
        });
        genius.config.types.bool.parse(function (input) {
            if (input == "True")
                return true;
            else
                return false;
        });

        function Panther(name, age, color) {
            this.name = name + "Pantherson";
            this.age = age + 2;
            this.color = color;
        };

        genius.config.types.add("panther", Panther, {
            parse: function (input) {
                return new Panther(input.name, input.age, input.color);
            }
        });

        var pantherConfig = genius.config.types.panther;

        var Class = genius.Resource.extend({
            date: genius.types.date(),
            num: genius.types.number(),
            bool: genius.types.bool(),
            panther: genius.types.panther()
        });
        var timestamp = 1387521272839;
        var myClass = new Class({
            date: timestamp,
            num: "10191",
            bool: "True",
            panther: {
                name: "Pansy",
                age: 20,
                color: "black"
            }
        });

        expect(myClass.date().getTime()).toBe(timestamp);
        expect(myClass.num()).toBe(10191);
        expect(myClass.bool()).toBe(true);
        expect(myClass.panther() instanceof Panther).toBe(true);

        genius.config.reset();
        //All parsing methods should be reset to their originals,
        //But new custom types will remain, unless {hard: true} is
        //specified on reset.
        expect(genius.config.types.bool.parse).toBe(boolParse);
        expect(genius.config.types.date.parse).toBe(dateParse);
        expect(genius.config.types.number.parse).toBe(numParse);
        expect(genius.config.types.panther).toBe(pantherConfig);
        genius.config.reset({ hard: true });
        expect(genius.config.types.panther).toBeUndefined();
    });

    it("should toggle default nullability of types", function () {
        function testInit() {
            expect(genius.config.date.nullable()).toBe(false);
            expect(genius.config.types.custom.nullable()).toBe(true);
            expect(genius.config.types.bool.nullable()).toBe(true);
        }
        testInit();
        genius.config.types.date.nullable(true);
        genius.config.types.custom.nullable(false);
        genius.config.types.bool.nullable(false);

        var ChildClass = function () { };
        var Class = genius.Resource.extend({
            date: genius.types.date(),
            child: genius.types(ChildClass),
            bool: genius.types.bool()
        });
        expect(function () { new Class(); }).toThrow();
        var myClass = new Class({ child: {}});
        expect(function () { myClass.date(null) }).not.toThrow();
        expect(myClass.date()).toBe(null);
        expect(myClass.num()).toBe(19);
        expect(function () { myClass.bool(null); }).toThrow();
        genius.config.reset();
        testInit();
    });

    it("should change default values for types", function () {
        function testInit() {
            expect(genius.config.types.number.default()).toBe(0);
            expect(typeof genius.config.types.date.default()).toBe("function");
            expect(new Date() - genius.config.types.date.default()()).toBeLessThan(10);
            expect(genius.config.types.bool.default()).toBe(false);
        };
        testInit();
        genius.config.types.number.default(19);
        var testDate = new Date(2013, 1, 1);
        genius.config.types.bool.default(true);
        genius.config.types.date.default(testDate);

        var Class = genius.Resource.extend({
            num: genius.types.number(),
            date: genius.types.date(),
            bool: genius.types.bool()
        });
        var myClass = new Class();
        expect(myClass.num()).toBe(19);
        expect(myClass.date()).toBe(testDate);
        expect(myClass.bool()).toBe(true);
        genius.config.types.date.default(function () { return new Date(2013, 1, 1); });
        genius.config.types.number.default(function () { return new Date().getTime(); });
        //As a discouragement for reconfiguring midstream, types defined before reconfiguration will not be reconfigured.
        expect(myClass.date()).toBe(testDate);
        var Class2 = genius.Resource.extend({
            num: genius.types.number(),
            date: genius.types.date()
        });
        var myClass2 = new Class2();
        var class2Date = myClass2.date();
        expect(class2Date).not.toBe(testDate);
        expect(class2Date.getFullYear()).toBe(2013);
        expect(class2Date.getMonth()).toBe(1);
        expect(class2Date.getDate()).toBe(1);
        expect(new Date().getTime() - myClass2.num()).toBeLessThan(10);

        genius.config.reset();
        testInit();
    });
});

describe("A collection", function () {
    var Class;
    beforeEach(function () {
        Class = genius.Resource.extend({
            uniqKey: "id",
            id: genius.types.number({ nullable: true }),
            name: genius.types.string({ defaultTo: "Cameron" })
        });
    });
    it("should allow direct instantiation", function () {
        var collection = genius.collection.create({type: genius.types(Class)});
        collection.concat([{}, { name: "Sara" }, { name: "Jimmy" }]);
        expect(collection[0] instanceof Class).toBe(true);
        expect(collection[0].name()).toBe("Cameron");
        expect(collection[1].name()).toBe("Sara");
        expect(collection[2].name()).toBe("Jimmy");
    });
    it("should allow uniqueness configuration", function () {
        var collection = genius.collection.create({ type: genius.types(Class), unique: true });
        collection.concat([{ id: 1, name: "Jimbo" }, { id: 2, name: "Sally" }]);
        expect(collection.length).toBe(2);
        collection.push({ id: 1, name: "Bobo" });
        expect(collection.length).toBe(2);
        expect(collection[0].name()).toBe("Bobo");
    });
    it("should allow class inheritance", function () {
        var Collection = genius.collection.extend({ type: genius.types(Class), unique: false });
        var collection = new Collection();
        expect(typeof collection.push).toBe("function");
    });
});

describe("Type specifications", function () {

    it("should initialize boolean types to booleans", function () {
        var Class = genius.Resource.extend({
            bool: genius.types.bool()
        });
        var myClass = new Class();
        expect(myClass.bool()).toBe(false);
        expect(function () { new Class({ bool: "string" }) }).toThrow();
        expect(function () { myClass.bool(null); }).not.toThrow();
        expect(function () { myClass.bool(undefined); }).not.toThrow();
    });

    it("should accept any data for dynamic types", function () {
        var Class = genius.Resource.extend({
            dyno: genius.types.dynamic(),
            dynoRequired: genius.types.dynamic({ nullable: false }),
            dynoDefault: genius.types.dynamic({ nullable: false, defaultTo: "Dyno default" }),
            dynoDynamicDefault: genius.types.dynamic({ nullable: false, defaultTo: function () { return new Date(); } })
        });
        expect(function () { var myClass = new Class(); }).toThrow();
        var myClass = new Class({ dynoRequired: "Required dyno" });
        var testDate = new Date();
        expect(myClass.dynoRequired()).toBe("Required dyno");
        expect(function () { myClass.dyno(123); }).not.toThrow();
        expect(myClass.dyno()).toBe(123);
        expect(function () { myClass.dyno("abc"); }).not.toThrow();
        expect(function () { myClass.dynoDefault(null); }).toThrow();
        expect(myClass.dyno()).toBe("abc");
        expect(myClass.dynoDefault()).toBe("Dyno default");
        expect(testDate() - myClass.dynoDynamicDefault()).toBeLessThan(10);
    });

    it("should set options on custom class types", function () {
        var Class = genius.Resource.extend({
            jump: function () { return "I'm jumping"; }
        });
        var myClass = new Class({
            testNewString: "I'm a string"
        });
        expect(myClass.testNewString()).toBe("I'm a string");
        expect(myClass.jump()).toBe("I'm jumping");
    });

    it("should return the root object on set", function () {
        var Class = genius.Resource.extend({
            prop: genius.types.string({ defaultTo: "Prop string" })
        });
        var myClass = new Class();
        expect(myClass.prop("Another string")).toBe(myClass);
        expect(myClass.prop()).toBe("Another string");
    });

    it("should initialize custom class types", function () {
        var GeniusClass = genius.Resource.extend({});
        var PlainClass = function (options) {
            this.str = "I'm a string.";
            this.num = 123;
            this.optionsHash = options;
        };

        PlainClass.prototype = {
            getString: function () { return "An arbitrary string"; }
        };

        var TestClass = genius.Resource.extend({
            genius: genius.types(GeniusClass),
            plain: genius.types(PlainClass).extend({ nullable: false })
        });
        //custom class types are nullable by default.

        expect(function () { new TestClass(); }).toThrow();
        var myTestClass = new TestClass({
            plain: {
                testProperty: "Test property"
            }
        });

        expect(myTestClass.genius()).toBe(null);
        expect(function () { myTestClass.genius(new PlainClass()); }).toThrow();
        expect(myTestClass.genius()).toBe(null);
        var myGeniusClass = new GeniusClass();
        expect(function () { myTestClass.genius(myGeniusClass); }).not.toThrow();
        expect(myTestClass.genius()).toBe(myGeniusClass);

        var myPlainClass = myTestClass.plain();

        expect(myPlainClass instanceof PlainClass).toBe(true);
        expect(function () { myTestClass.plain(123); }).toThrow();
        expect(myTestClass.plain()).toBe(myPlainClass);
        expect(myPlainClass.options).toBeUndefined();
        expect(myPlainClass.testProperty).toBe("Test property");
        expect(myPlainClass.str).toBe("I'm a string");
        expect(myPlainClass.getString()).toBe("An arbitrary string");

        var options = { option1: "abc", option2: "123" };
        var myPlainClass2 = new PlainClass(options);
        myTestClass.plain(myPlainClass2);
        expect(myTestClass.plain()).toBe(myPlainClass2);
        expect(myTestClass.plain().optionsHash).toBe(options);

        var myTestClass2 = new TestClass({
            plain: {
                testProperty: "Another test property",
                propertyNotInDef: "Test property - not in definition"
            }
        });

        expect(myTestClass2.plain().propertyNotInDef).toBe("Test property - not in definition");
    });

    it("should initialize number types to numbers", function () {
        var Class = genius.Resource.extend({
            plainNumber: genius.types.number(),
            nullableNumber: genius.types.number({ nullable: true }),
            nullNumber: genius.types.number({ nullable: true, defaultTo: null }),
            defaultNumber: genius.types.number({ defaultTo: 123 }),
            dynamicDefaultNumber: genius.types.number({ defaultTo: function () { return new Date().getTime(); } })
        });

        var myClass = new Class();
        var testDate = new Date();
        expect(myClass.plainNumber()).toBe(0);
        expect(myClass.nullableNumber()).toBe(0);
        expect(function () { myClass.nullableNumber(null); }).not.toThrow();
        expect(function () { myClass.nullableNumber(undefined); }).not.toThrow();
        expect(myClass.nullableNumber()).toBe(undefined);

        expect(myClass.nullNumber()).toBe(null);
        myClass.nullNumber(123);
        expect(myClass.nullNumber()).toBe(123);

        expect(myClass.defaultNumber()).toBe(123);
        expect(testDate().getTime() - myClass.dynamicDefaultNumber()).toBeLessThan(10);
    });

    it("should initialize string types to strings", function () {
        var Class = genius.Resource.extend({
            plainString: genius.types.string(),
            nullableString: genius.types.string({ nullable: true }),
            nullString: genius.types.string({ nullable: true, defaultTo: null }),
            defaultString: genius.types.string({ defaultTo: "Default string" }),
            dynamicDefaultString: genius.types.string({ defaultTo: function () { return new Date().getTime().toString(); }})
        });

        var myClass = new Class();
        var testDate = new Date();
        expect(myClass.plainString()).toBe("");
        expect(function () { myClass.plainString(null); }).toThrow();
        expect(function () { myClass.plainString(undefined); }).toThrow();
        expect(function () { myClass.plainString(123); }).toThrow();

        expect(myClass.nullableString()).toBe("");
        expect(function () { myClass.nullableString(null); }).not.toThrow();
        expect(function () { myClass.nullableString(undefined); }).not.toThrow();
        expect(function () { myClass.nullableString(123); }).toThrow();

        expect(myClass.nullString()).toBe(null);
        myClass.nullString("Some string");
        expect(myClass.nullString()).toBe("Some string");
        expect(function () { myClass.nullString(null); }).not.toThrow();
        expect(function () { myClass.nullString(undefined); }).not.toThrow();
        expect(function () { myClass.nullString(123); }).toThrow();

        expect(myClass.defaultString()).toBe("Default string");

        expect(parseInt(myClass.dynamicDefaultString()).toString()).not.toBe("NaN");
        expect(testDate - new Date(parseInt(myClass.dynamicDefaultString()))).toBeLessThan(10);

        var myInitializedClass = new Class({
            plainString: "Plain string",
            nullableString: "Nullable string",
            nullString: "Null string",
            defaultString: "Default string",
            dynamicDefaultString: "Dynamic default String"
        });
        expect(myInitializedClass.plainString()).toBe("Plain string");
        expect(myInitializedClass.nullableString()).toBe("Nullable string");
        expect(myInitializedClass.nullString()).toBe("Null string");
        expect(myInitializedClass.defaultString()).toBe("Default string");
        expect(myInitializedClass.dynamicDefaultString()).toBe("Dynamic default string");
    });

    it("should initialize date types to dates", function () {
        var defaultDate = new Date(2013, 1, 1);
        var Class = genius.Resource.extend({
            plainDate: genius.types.date(),
            nullableDate: genius.types.date({ nullable: true }),
            nullDate: genius.types.date({ nullable: true, defaultTo: null }),
            dateWithStaticDefault: genius.types.date({ defaultTo: defaultDate }),
            dateWithDynamicDefault: genius.types.date({ defaultTo: function () { return new Date(); } })
        });

        var myClass = new Class();
        expect(myClass.plainDate()).toEqual(jasmine.any(Date));
        expect(new Date() - myClass.plainDate()).toBeLessThan(10);
        expect(function () { myClass.plainDate(null); }).toThrow();
        expect(function () { myClass.plainDate(undefined); }).toThrow();
        expect(function () { myClass.plainDate("Not a date"); }).toThrow();

        expect(myClass.nullableDate()).toEqual(jasmine.any(Date));
        expect(new Date() - myClass.nullableDate()).toBeLessThan(10);
        expect(function () { myClass.nullableDate(null); }).not.toThrow();
        expect(function () { myClass.nullableDate(undefined); }).not.toThrow();

        expect(myClass.nullDate()).toBe(null);
        expect(myClass.dateWithStaticDefault()).toBe(defaultDate);
        //Be sure to include jasmine.clock.useMock
        expect(myClass.dateWithDynamicDefault()).not.toBe(defaultDate);
        
        setTimeout(function () {
            var myClass2 = new Class();
            expect(new Date() - myClass2.dateWithDynamicDefault()).toBeLessThan(10);
        });
    });

    it("should throw for typed defaults that aren't type safe", function () {
        function brokenNumClass() {
            genius.Resource.extend({
                num: genius.types.number({ defaultTo: "Not a number" })
            });
        };
        function brokenStringClass() {
            genius.Resource.extend({
                str: genius.types.string({ defaultTo: 1234 })
            });
        };
        function brokenDateClass() {
            genius.Resource.extend({
                date: genius.types.date()
            });
        };
        expect(brokenNumClass).toThrow();
        expect(brokenStringClass).toThrow();
        expect(brokenDateClass).toThrow();
        var BrokenNumClass = genius.Resource.extend({
            num: genius.types.number({ defaultTo: function () { return "Not a number."; }})
        });
        var BrokenStringClass = genius.Resource.extend({
            str: genius.types.string({ defaultTo: function () { return 123; }})
        });
        var BrokenDateClass = genius.Resource.extend({
            date: genius.types.date({ defaultTo: function () { return "Not a date."; }})
        });
        expect(function () { new BrokenNumClass(); }).toThrow();
        expect(function () { new BrokenStringClass(); }).toThrow();
        expect(function () { new BrokenDateClass(); }).toThrow();
    });
});

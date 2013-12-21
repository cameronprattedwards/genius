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
            "Zombie": genius.box.kernel.dependency(function () { return new Zombie(); }),
            "ZombieKing": genius.box.kernel.dependency(function () { return new ZombieKing(); }).singleton()
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
describe("Type specifications", function () {

    it("should initialize boolean types to booleans", function () {
        var Class = genius.Resource.extend({
            bool: genius.types.bool(),
            nullable: genius.types.bool({ nullable: true })
        });
        var myClass = new Class();
        expect(myClass.bool()).toBe(false);
        expect(function () { new Class({ bool: "string" }) }).toThrow();
        expect(function () { myClass.bool(null); }).toThrow();
        expect(function () { myClass.bool(undefined); }).toThrow();
        expect(function () { myClass.nullable(null); }).not.toThrow();
        expect(function () { myClass.nullable(undefined); }).not.toThrow();

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
        expect(testDate - myClass.dynoDynamicDefault()).toBeLessThan(10);
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

    //it("should return the root object on set", function () {
    //    var Class = genius.Resource.extend({
    //        prop: genius.types.string({ defaultTo: "Prop string" })
    //    });
    //    var myClass = new Class();
    //    expect(myClass.prop("Another string")).toBe(myClass);
    //    expect(myClass.prop()).toBe("Another string");
    //});

    it("should initialize custom class types", function () {
        var GeniusClass = genius.Resource.extend({});
        var PlainClass = function (options) {
            this.str = "I'm a string";
            this.num = 123;
            this.optionsHash = options;
        };

        PlainClass.prototype = {
            getString: function () { return "An arbitrary string"; }
        };

        var TestClass = genius.Resource.extend({
            genius: genius.types(GeniusClass),
            plain: genius.types(PlainClass, { nullable: false })
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
        expect(myPlainClass.testProperty()).toBe("Test property");
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

        expect(myTestClass2.plain().propertyNotInDef()).toBe("Test property - not in definition");
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
        expect(testDate.getTime() - myClass.dynamicDefaultNumber()).toBeLessThan(10);
    });

    it("should initialize string types to strings", function () {
        var Class = genius.Resource.extend({
            plainString: genius.types.string(),
            nullableString: genius.types.string({ nullable: true }),
            nullString: genius.types.string({ nullable: true, defaultTo: null }),
            defaultString: genius.types.string({ defaultTo: "Default string" }),
            dynamicDefaultString: genius.types.string({ defaultTo: function () { return new Date().getTime().toString(); } })
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
            dynamicDefaultString: "Dynamic default string"
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
        expect(function () { myClass.plainDate(null); }).not.toThrow();
        expect(function () { myClass.plainDate(undefined); }).not.toThrow();
        expect(function () { myClass.plainDate("Not a date"); }).toThrow();

        expect(myClass.nullableDate()).toEqual(jasmine.any(Date));
        expect(new Date() - myClass.nullableDate()).toBeLessThan(10);
        expect(function () { myClass.nullableDate(null); }).not.toThrow();
        expect(function () { myClass.nullableDate(undefined); }).not.toThrow();

        expect(myClass.nullDate()).toBe(null);
        expect(myClass.dateWithStaticDefault()).toBe(defaultDate);
        //Be sure to include jasmine.clock.useMock
        expect(myClass.dateWithDynamicDefault()).not.toBe(defaultDate);

        //setTimeout(function () {
        //    var myClass2 = new Class();
        //    expect(new Date() - myClass2.dateWithDynamicDefault()).toBeLessThan(10);
        //});
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
                date: genius.types.date({ defaultTo: "Garbage" })
            });
        };
        expect(brokenNumClass).toThrow();
        expect(brokenStringClass).toThrow();
        expect(brokenDateClass).toThrow();

        expect(function () {
            genius.Resource.extend({
                num: genius.types.number({ defaultTo: function () { return "Not a number."; } })
            });
        }).toThrow();
        expect(function () {
            genius.Resource.extend({
                str: genius.types.string({ defaultTo: function () { return 123; } })
            });
        }).toThrow();
        expect(function () {
            genius.Resource.extend({
                date: genius.types.date({ defaultTo: function () { return "Not a date."; } })
            });
        }).toThrow();
    });

});
describe("Collections", function () {
    var Class = genius.Resource.extend({
        id: genius.types.number({ nullable: true, defaultTo: null }),
        name: genius.types.string({ defaultTo: "Cameron" }),
        uniqKey: "id"
    });

    it("should initialize typed arrays to collections", function () {
        var Brain = genius.Resource.extend({
            weight: genius.types.number(),
            color: genius.types.string(),
            formerOwner: genius.types.string()
        });
        var Zombie = genius.Resource.extend({
            brains: genius.types.collection(genius.types(Brain))
        });
        var Collection = genius.Collection.extend({ type: genius.types(Brain) });
        var collection = new Collection();
        collection.concat([new Brain({
            weight: 10,
            color: "gray",
            formerOwner: "Jimmy"
        })]);
        var zombo = new Zombie({
            brains: collection
        });
        var brains = zombo.brains(), brain = brains[0];
        expect(brains).toEqual(jasmine.any(genius.Collection));
        expect(brain).toEqual(jasmine.any(Brain));
        expect(brain.weight()).toBe(10);
        expect(brain.color()).toBe("gray");
        expect(brain.formerOwner()).toBe("Jimmy");
    });

    it("should splice out deleted items on deletion", function () {
        var Collection = genius.Collection.extend({ type: genius.types(Class) });
        var myClass = new Class({ id: 1, name: "Jammer" });
        var collection = new Collection();
        collection.push(myClass);
        expect(collection.length).toBe(1);
        expect(collection[0]).toBe(myClass);
        myClass.$delete();
        expect(collection.length).toBe(0);
        expect(genius.utils.contains(collection, myClass)).toBe(false);
    });

    it("should allow direct instantiation", function () {
        var collection = new genius.Collection({ type: genius.types(Class) });
        collection.concat([new Class(), new Class({ name: "Sara" }), new Class({ name: "Jimmy" })]);
        expect(collection[0] instanceof Class).toBe(true);
        expect(collection[0].name()).toBe("Cameron");
        expect(collection[1].name()).toBe("Sara");
        expect(collection[2].name()).toBe("Jimmy");
    });

    it("should allow uniqueness configuration", function () {
        var collection = new genius.Collection({ type: genius.types(Class), unique: true });
        collection.concat([new Class({ id: 1, name: "Jimbo" }), new Class({ id: 2, name: "Sally" })]);
        expect(collection.length).toBe(2);
        collection.push(new Class({ id: 1, name: "Bobo" }));
        expect(collection.length).toBe(2);
        expect(collection[0].name()).toBe("Bobo");
    });

    describe(".addNew()", function () {
        it("should push a new Resource onto itself", function () {
            var Class = genius.Resource.extend();
            var Collection = genius.Collection.extend({ type: genius.types(Class) });
            var collection = new Collection();
            expect(collection.length).toBe(0);
            collection.addNew();
            expect(collection.length).toBe(1);
            expect(collection[0]).toEqual(jasmine.any(Class));
        });
    });

    it("should parse JSON arrays into typed collections", function () {
        var Brain = genius.Resource.extend({ weight: genius.types.number() });
        var Zombie = genius.Resource.extend({
            brains: genius.types.collection(genius.types(Brain)),
            id: genius.types.number(),
            url: "/zombies/:id"
        });
        var backend = genius.box.HttpBackend();
        backend.expectGet("/zombies/1").toReturn("{\"brains\":[{\"weight\":9}, {\"weight\":12}], \"id\":1}");
        var zombie = Zombie.$get({ id: 1 });
        backend.flush();
        expect(zombie.brains()).toEqual(jasmine.any(genius.Collection));
        var brains = zombie.brains();
        expect(brains.length).toBe(2);
        expect(brains[0]).toEqual(jasmine.any(Brain));
        expect(brains[1]).toEqual(jasmine.any(Brain));
        expect(brains[0].weight()).toBe(9);
        expect(brains[1].weight()).toBe(12);
    });
});

describe("Resource requests", function () {
    it("should parse queries into resources", function () {
        Zombie = genius.Resource.extend({
            url: "/api/zombies/:id",
            uniqKey: "id",
            name: genius.types.string(),
            id: genius.types.number({ nullable: true, defaultTo: null }),
            rand: genius.types.number(),
            parseJs: function (response) {
                return genius.config.types.custom.parseJs().call(this, response.zombie);
            }
        });
        var backend = genius.box.HttpBackend();
        backend.expectGet("/api/zombies?q=munch").toReturn("[{\"name\": \"Muncher\", \"id\": 1, \"rand\": 1091},{\"name\":\"Munchkin\", \"id\": 2, \"rand\": 5687}]");
        var zombies = Zombie.$query({ q: "munch" });
        expect(zombies).toEqual(jasmine.any(genius.Collection));
        expect(zombies.type().constr()).toBe(Zombie);
        expect(zombies.isLoading()).toBe(true);
        expect(zombies.length).toBe(0);
        backend.flush();
        for (var i = 0; i < zombies.length; i++) {
            expect(zombies[i].isNew()).toBe(false);
        }
        expect(zombies.length).toBe(2);
        for (var i = 0; i < zombies.length; i++) {
            expect(zombies[i]).toEqual(jasmine.any(Zombie));
        }
        expect(zombies.isLoading()).toBe(false);
        expect(zombies[0].name()).toBe("Muncher");
        expect(zombies[1].name()).toBe("Munchkin");
    });

});

describe("The fromJs method", function () {
    it("should parse typed collections into their types", function () {
        var Brain = genius.Resource.extend({ weight: genius.types.number() });
        var Zombie = genius.Resource.extend({ brains: genius.types.collection(genius.types(Brain)) });
        var zombie = Zombie.fromJs({ brains: [{ weight: 19 }, { weight: 100 }, { weight: 203 }] });
        var brains = zombie.brains();
        for (var i = 0; i < brains.length; i++)
            expect(brains[i]).toEqual(jasmine.any(Brain));
        expect(brains).toEqual(jasmine.any(genius.Collection));
        expect(brains.length).toBe(3);
        expect(brains[0].weight()).toBe(19);
        expect(brains[1].weight()).toBe(100);
        expect(brains[2].weight()).toBe(203);
    });

    it("should accept plain old JS Objects", function () {
        var Zombie = genius.Resource.extend({
            id: genius.types.number(),
            name: genius.types.string(),
            date: genius.types.date()
        });
        var zombie = Zombie.fromJs({
            id: 1,
            name: "Zombo",
            date: "2014-01-14T21:39:26.081Z"
        });
        expect(zombie.id()).toBe(1);
        expect(zombie.name()).toBe("Zombo");
        var date = zombie.date();
        expect(date.getFullYear()).toBe(2014);
        expect(date.getMonth()).toBe(0);

        var Collection = genius.Collection.extend({ type: genius.types(Zombie) });
        var collection = Collection.fromJs([
            {
                id: 2,
                name: "Sarah",
                date: "1914-01-14T21:44:18.627Z"
            },
            {
                id: 3,
                name: "Jessica",
                date: "1994-01-14T21:44:18.627Z"
            },
            {
                id: 4,
                name: "Zach",
                date: "1984-01-14T21:44:18.627Z"
            }
        ]);
        expect(collection.length).toBe(3);
        expect(collection[0]).toEqual(jasmine.any(Zombie));
        expect(collection[1]).toEqual(jasmine.any(Zombie));
        expect(collection[2]).toEqual(jasmine.any(Zombie));
        expect(collection[0].id()).toBe(2);
        expect(collection[0].date()).toEqual(jasmine.any(Date));
        var date = collection[0].date();
        expect(date.getFullYear()).toBe(1914);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(14);
        expect(collection[0].name()).toBe("Sarah");
        expect(collection[1].name()).toBe("Jessica");
        expect(collection[2].name()).toBe("Zach");
    });
});
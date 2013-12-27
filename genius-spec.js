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

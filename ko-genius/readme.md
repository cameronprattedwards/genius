KO-Genius is just like [Genius] (http://geniusjs.com 'Genius'), but with a few useful additions that make working with KnockoutJS super easy.

For starters, any Genius resource property created using a `genius.types.*` method will be a Knockout observable. For example, consider the following
model definition:

	var Zombie = genius.Resource.extend({
		name: genius.types.string(),
		id: genius.types.number(),
		age: genius.types.number(),
		url: "/zombies/:id"
	});

	var zombies = Zombie.$get({ id: 1 });
	ko.applyBindings({ myZombies: zombies });

Now use the following markup:
	
	<img src="spinner.gif" data-bind="visible: zombies.isLoading" />
	<div data-bind="foreach: zombies">
		<p>Name: <span></span>, ID: <span></span>, Age: <span></span></p>
	</div>

`zombies` will become an observable array, and Knockout will render a list of
your zombies, all with their appropriate information. `name`, `id`, and `age` will all be knockout observables.
What's more, Resource meta-properties,
such as `isLoading`, `isDirty`, `isDeleted`, and `isNew` are all observable, so you're
free to use them as you please in your Knockout bindings.










Genius
======

Genius is an MVC framework in the truest sense of the word. It is built on the idea that, first and foremost, domain modeling should be easy. And your apps should be polymorphic - that is, you should be able to use the same source on both the client and the server.

If you want to use Genius, I recommend you structure your app like this:

```
root_dir
	├ app
	│	└ web
	│		├ controllers
	│		├ views
	│		├ www
	│		│	└ public
	│		├ config.js
	│		└ main.js
	├ domain
	└ node_modules
```

All of your application-specific code goes into the "app" directory. All of your business logic goes into
the "domain" directory. That is to say, if you're building an MVC web app, put your controllers and your views in there. Put all of your models in the domain directory. That way, if you decide you want to build a console app or a mobile app, you can reuse all of your entities, services, and factories easily.

At a really basic level, Genius should make it a cinch to set up an MVC app. 

Genius uses dependency injection by RequireJS to help keep your code clean and concise, and out of global scope.

To develop on this repo, you'll need to do a few things:

1. `git clone https://github.com/cameronprattedwards/genius.git`
1. `npm install`

You'll want a test app to play around with so you can know which features you'll want to add to Genius.

So, actually, set up your directory structure as shown above.

1. `cd node_modules`
1. `git clone https://github.com/cameronprattedwards/genius.git`

To make a web app, `cd path/to/app_directory/web/controllers`.
Create a file that looks like this:

Jeez, louise! Just read the source!
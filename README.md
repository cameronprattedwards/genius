Genius
======

Genius is an MVC framework in the truest sense of the word. It is built on the idea that, first and foremost, makes domain modeling easy.

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
	└ domain
```

All of your application-specific code goes into the "app" directory. All of your business logic goes into
the "domain" directory. That is to say, if you're building an MVC web app, put your controllers and your views in there. Put all of your models in the domain directory. That way, if you decide you want to build a console app or a mobile app, you can reuse all of your entities, services, and factories easily.

At a really basic level, Genius should make it a cinch to set up an MVC app. 

Genius uses dependency injection by RequireJS to help keep your code clean and concise, and out of global scope.

To develop on this repo, you'll need to do a few things:

1. `git clone https://github.com/cameronprattedwards/genius.git`
1. `npm install`


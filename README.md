# DocSpot

All your docs are belong to DocSpot.

This is a small web server that allows people to POST tarballs with static
assets and have them hosted on a server. Currently it does not have any form of
authentication or authorization.

## Creating a Tarball

Suppose you have three files that comprise your docs:

```
my-docs/
	index.html
	index.css
	index.js
```

Your `index.html` file should use relative paths to include its various assets.
Here is an example `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>My Docs</title>
	<link rel="stylesheet" href="index.css"> <!-- By jove, it's relative! -->
</head>
<body>
	<h1>Doc Who?</h1>
	<script src="index.js"></script> <!-- Gosh golly, it's relative! -->
</body>
</html>
```

When you tar up the assets, make sure you don't include any extra layers of
folders. For example, let's tar up files in preparation to send them to DocSpot:

```bash
cd my-docs
tar -czf my-docs-v1.tar.gz *
```

Now let's upload them with `curl`:

```bash
curl --form file=@my-docs.tar.gz 'http://localhost:8888/api/projects?name=my-docs&id=v1'
```

Once you get a 200 back, you're all set to view them at
http://localhost:8888/projects/my-docs/v1


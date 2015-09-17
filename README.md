<h1>
<img style="width: 45px;" src="https://cdn.rawgit.com/jondlm/docspot/master/public/img/logo.svg" /> DocSpot
</h1>

All your docs are belong to DocSpot.

This is a small web server that allows people to POST tarballs with static
assets and have them hosted on a server. Currently it does not have any form of
authentication or authorization. **Be sure to visit** /documentation to see the
api docs.

## Getting Started

```bash
npm install
npm run assets
npm start
# visit localhost:8888
```

Edit the `config.json` file and restart the server to tweak settings.

## Creating and Uploading a Tarball

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
tar -czf my-docs.tar.gz *
```

Now let's upload them with `curl`:

```bash
curl 'http://localhost:8888/api/projects' \
  --form file=@my-docs.tar.gz \
  --form projectId=my-docs \
  --form buildId=1.0.0
```

This will upload the tarball, create or add a project called "my-docs", and
create or overwrite the build "1.0.0". Once you get a 200 back, you're all set
to view them at http://localhost:8888/projects/my-docs/1.0.0

## Contributing

First of all, thank you for contributing. It’s appreciated.

1. Clone the repo and install dependencies with `npm install`.
2. Make a GitHub issue before doing significant amount of work.
3. Run `npm test` to lint and test. Don’t commit before fixing all errors and warnings.
4. Reference the issue’s number in your commit. E.g.: “Did this #12”
5. Make a pull request.

You can use these commands to run the server in dev mode:

```bash
npm install
npm run start-dev
npm run assets-dev
```

Credit to [cycle.js] for the contributing guidelines.

[cycle.js]: https://github.com/cyclejs/cycle-core/blob/master/CONTRIBUTING.md


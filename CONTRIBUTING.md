# CONTRIBUTING

## Contributing to source code

1. Fork/clone the repository.
2. Run `npm install`

- Add and test new functionalities for _./src/decixion.js_ file.
- Create new **base/colours** CSS styles within _./src_ folder.

3. Commit to **_master_** branch.
4. Submit **new pull request**.
5. Await reviewing and merge.
6. Thank you for contributing with **Decixion Engine**!

## Making a new release (project owner only)

1. Deep search for current project version in _all_ files (except the ones within _./dist_ folder) and replace it with newest version for release.
2. Run `./node_modules/.bin/gulp build`
3. Commit and push to **_master_** branch with **newest version number** only as the commit message.
4. Add a new tag for the created commit: `git tag -a x.x.x -m "x.x.x dev version."` where `x.x.x` is the **newest version number**.
5. Push the created tag: `git push origin x.x.x`
6. Publish the NPM package: `npm publish`

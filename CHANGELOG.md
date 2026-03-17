# Changelog

## 1.0.0 (2026-03-17)


### Features

* add develop branch workflow ([db603b6](https://github.com/danielreified/merlynn-demo/commit/db603b669e9c473ae087ba833f5c02f382229b27))
* add GitHub environments for deploy secrets scoping ([35f3c38](https://github.com/danielreified/merlynn-demo/commit/35f3c382584c7ebcdde6572eb91f529bf1d98ad7))
* add Release Please for semantic versioning ([1556508](https://github.com/danielreified/merlynn-demo/commit/15565089977825c1a4265b16539231cd8342dc63))
* add Turbo cache via GitHub Actions, S3 backend for Terraform ([f1a9118](https://github.com/danielreified/merlynn-demo/commit/f1a91182c2a3e1cfb97e77e9d0d30304acd699df))
* add version field for release please ([#15](https://github.com/danielreified/merlynn-demo/issues/15)) ([01b28b6](https://github.com/danielreified/merlynn-demo/commit/01b28b6572cb47e5edfc6984cc5c5b5b341e8f56))
* initial commit with full Merlynn risk monitoring platform ([42a116c](https://github.com/danielreified/merlynn-demo/commit/42a116c6905ac1da1d24a26874176af7e6cb45ed))
* migrate API to @hono/zod-openapi and add detailed READMEs ([91e86f5](https://github.com/danielreified/merlynn-demo/commit/91e86f5b818aa6fc879df74d7c9c002fd4ddfe6f))
* replace Cypress with Playwright e2e tests, fix API docs and email deploy ([2f445ee](https://github.com/danielreified/merlynn-demo/commit/2f445ee1bbcd73898f520971eac31dbad07dbc80))


### Bug Fixes

* add @types/node to db package for CI typecheck ([78304f0](https://github.com/danielreified/merlynn-demo/commit/78304f07ddb74509313bd64063d6b5daf305bc3d))
* add AUTH_TRUST_HOST for NextAuth behind load balancer ([d96106e](https://github.com/danielreified/merlynn-demo/commit/d96106efe4eea59a95b7902809afd8c1fa08210d))
* add missing email package to Dockerfile and fix email export path ([d57c3df](https://github.com/danielreified/merlynn-demo/commit/d57c3df113b44f7ecb271f65100503fb38a0fc78))
* add mongoose and bcryptjs to serverExternalPackages ([003e096](https://github.com/danielreified/merlynn-demo/commit/003e09611febab7a517845223b31294e4dd8ae7d))
* add public directory for Docker build runner stage ([4773f19](https://github.com/danielreified/merlynn-demo/commit/4773f1950a974fc5f33d6a06f0670d869d1c3b78))
* copy all workspace node_modules in Docker build ([e9969fe](https://github.com/danielreified/merlynn-demo/commit/e9969fe2f04f7a756b741b128f0e479526e45cd0))
* copy workspace node_modules for next binary in Docker build ([3bd7462](https://github.com/danielreified/merlynn-demo/commit/3bd746247a78d01dd5c2d9eb7310a3a6eeb3ca39))
* exclude bun test files from db package typecheck ([4cf552f](https://github.com/danielreified/merlynn-demo/commit/4cf552f34fb613dcdf862679a9ee6597e08ab5f8))
* exclude stories from ui package typecheck ([a5c9165](https://github.com/danielreified/merlynn-demo/commit/a5c9165b75415c27bc97d8bf82a3666ee86062ef))
* externalize mongoose from webpack to prevent DocumentArray runtime error ([d152123](https://github.com/danielreified/merlynn-demo/commit/d1521235b03018284d26295e4e5b8ba5c08b7829))
* install bun manually in Playwright container ([a031bc9](https://github.com/danielreified/merlynn-demo/commit/a031bc9a3e20eaaf4760eb967d479fb202c7c8a1))
* make auth config edge-compatible for middleware ([59beb5d](https://github.com/danielreified/merlynn-demo/commit/59beb5d54ee8c43e299a9e67911cdd520128a15f))
* move @merlynn/db to serverExternalPackages to prevent mongoose bundling ([395a14f](https://github.com/danielreified/merlynn-demo/commit/395a14f170cd379214282bc659e213ea6dc8d2c9))
* pass secrets_arns to ECS module for Secrets Manager access ([325a910](https://github.com/danielreified/merlynn-demo/commit/325a910b6def43ce369934b4aaf394012db93200))
* remove invalid COPY shell syntax from Dockerfile ([7eabdab](https://github.com/danielreified/merlynn-demo/commit/7eabdab106bf90c8113195cc24f902179a260176))
* remove Storybook browser tests from CI ([7e7c5bd](https://github.com/danielreified/merlynn-demo/commit/7e7c5bdc281e8546d6d19487a9fabc1e1aef17fe))
* replace subdocument schemas with Mixed type to prevent DocumentArray bundling error ([309084b](https://github.com/danielreified/merlynn-demo/commit/309084bd5fd60f7a699b5b024ba14d564eb155a4))
* set PATH for hoisted node_modules binaries in Docker build ([fea429c](https://github.com/danielreified/merlynn-demo/commit/fea429c93801545277d9c1a55730b0c52218b6cb))
* split CI into individual test jobs with Playwright container ([0efe866](https://github.com/danielreified/merlynn-demo/commit/0efe866076621c63e2da2c252558ad65d1683b67))
* use bunx to resolve next binary in Docker build ([f0f1e86](https://github.com/danielreified/merlynn-demo/commit/f0f1e86644b6ba7a7c73d313d0e91c3c88d0c357))
* use correct authjs cookie name in API auth middleware ([9848b32](https://github.com/danielreified/merlynn-demo/commit/9848b325e592ef5fecee9d71094f2c66f0f23a7f))
* use dynamic imports for @merlynn/db in server actions ([ce80534](https://github.com/danielreified/merlynn-demo/commit/ce80534c460f9f168e48e6023283bc1ffe919146))
* use getToken with correct cookie name instead of auth() wrapper ([632f403](https://github.com/danielreified/merlynn-demo/commit/632f4036cf99f0479f68c1715a336323fb1b5179))
* use NextAuth v5 auth() wrapper in middleware ([05985a4](https://github.com/danielreified/merlynn-demo/commit/05985a4029c2c61b91825296745b2fac09fde711))
* use webpack externals to keep mongoose out of bundle ([d15f87f](https://github.com/danielreified/merlynn-demo/commit/d15f87f600c76653f9353dc208ca1c67ca36751c))

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

교훈 1 Service의 constructor 안에는 injectable한 친구들만 import해서 넣어야 한다.
교훈 2 Nestjs 서버를 배포하기 위해서는 dist 폴더를 따로 업로드 해주어야 한다. (프리티어 기준)
교훈 3 SQL문을 모르는 상태에서 SQL문의 형태를 모사하는 typeORM의 queryBuilder를 사용하며 익숙해질 수 있었다.
교훈 4 굳이 필요 없는 댓글 갯수 같은 걸 column으로 넣으면, 읽는 속도는 빨라지지만 오히려 쓰는 경우가 너무 많이 늘어난다.
가능한 한 이런 column은 최소화하되, 꼭 필요한 경우만 추가하자
교훈 5 소셜 로그인 과정에서 쿼리스트링을 활용하여 필요한 것 이외의 정보를 담을 경우, 사용자가 악용하거나 버그가 생길 여지가 생긴다.
교훈 6 NestJS는 꽤나 무거워서 ec2 프리티어에서는 잘 안 돌아간다.
교훈 7 REST API와 SOCKET을 동시에 쓸 수 있다.
교훈 8 EC2에서 npm을 이용한 패키지 설치는 조심해서 진행해야 한다.
교훈 9 페이지네이션은 커서 기반 페이지네이션과 오프셋 기반 페이지네이션이 존재한다. 오프셋 기반의 경우, 실제로 DB에서 오프셋만큼의 row를 추가로 읽기 때문에 DB에 부하가 심하게 걸리고, 중간에 변동사항이 생기면 쉽게 overlap이 발생하는 단점이 존재한다.
교훈 10 로그인이 필요하지 않은 경우, 토큰과 관련하여 에러를 내기보다는, 그냥 보여주는 것이 옳다.
교훈 11 OAUTH를 구현하는 과정에서, 인가 코드를 요청하는 서버와 그 외 관련 API를 호출하는 서버가 동일해야 한다. 그렇지 않으면 구글의 경우 에러가 발생한다. - invalid grant
교훈 12 https를 설정하기 위해서 letsencrypt를 이용할 수 있다. 이 때, standalone 등 여러 방법으로 도메인을 소유하고 있는 지 인증이 가능한데, 이 때 명령어는 sudo certbot certonly --standalone이다. 이메일과 도메인 주소를 적고, 하면 된다.
교훈 13 모든 데이터는 나름의 순서가 있고, 따라서 그 순서를 생각하며 데이터를 구해야 한다.

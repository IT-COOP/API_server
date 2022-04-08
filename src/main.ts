import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const whitelist = [
  'https://d2g3jmj866i7dj.cloudfront.net/',
  'https://it-coop.co.kr',
  'http://it-coop.s3-website.ap-northeast-2.amazonaws.com',
];

dotenv.config();
const httpsOptions = {
  key: fs.readFileSync(process.env.DIR + 'privkey.pem'),
  cert: fs.readFileSync(process.env.DIR + 'cert.pem'),
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors({
    origin: function (origin, callback) {
      console.log(origin);
      whitelist.indexOf(origin) !== -1
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    ['/api'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('ITCOOP')
    .setDescription('ITCOOP Description')
    .setVersion('1.0')
    .setDescription('ITCOOP Server APIs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();

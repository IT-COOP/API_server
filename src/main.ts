import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  app.enableCors({
    origin: (origin, cb) => {
      cb(
        null,
        true,
        // process.env.whiteList.split(' ').indexOf(origin) !== -1
        //   ? null
        //   : new BadRequestException('Not Allowed CORS ERROR'),
        // true,
      );
    },
    credentials: true,
  });
  await app.listen(3000);
}
dotenv.config();
bootstrap();

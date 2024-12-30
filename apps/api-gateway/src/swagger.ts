import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  const theme = new SwaggerTheme();
  const themoptions = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK)
  };

  SwaggerModule.setup('swagger', app, document, themoptions);

  const jsonDocument = JSON.stringify(document, null, 2);
   
  app.getHttpAdapter().get('/postman-collection.json', (req, res) => {
    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
    const filename = `api-gateway-${currentDate}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonDocument);
  });
}

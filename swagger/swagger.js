const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        info: {
            title: 'Ast API',
            version: 'Beta',
            description: 'Backend API for A Simple tag / made by Devleo & D0hwQ1',
        },
        host: 'https://d0hwq1.xyz',
        basePath: '/'
    },
    //apis: ['./routes/*.js', './swagger/*']
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
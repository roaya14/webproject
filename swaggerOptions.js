const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Evently API Documentation",
        version: "1.0.0",
        description: "Documentation for API",
      },
    },
    apis: ["./controllers/*.js","./routes/sms.js"], 
  };
  const specs = swaggerJsdoc(options);

  
  module.exports = specs;
  
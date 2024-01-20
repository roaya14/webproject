const express = require('express');
const app = express();
const axios = require("axios");

const authRoutes = require('./routes/user_route');
const eventRoutes = require('./routes/event_route');
const session = require('express-session');
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swaggerOptions");

const indexRouter = require("./routes/sms");

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));

app.use(express.json());
app.use(
  session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
  })
);


app.use('/auth', authRoutes);
app.use('/event',eventRoutes);
app.use("/api", indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



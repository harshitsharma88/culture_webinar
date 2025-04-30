const express = require('express');
const app = express();
const path = require("path");

// Routes
const webinarRoutes = require("./routes/webinar");

app.use('/webinar', express.static(path.join(__dirname, '../public')));
app.use('/webinar', webinarRoutes);

module.exports = app;
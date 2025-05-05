const express = require('express');
const app = express();
const path = require("path");

// Parse the form data and body from request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../', 'public/views'));

// Routes
const webinarRoutes = require("./routes/homeRoute");

app.use('/webinar', express.static(path.join(__dirname, '../public')));
app.use('/webinar', webinarRoutes);

module.exports = app;
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const cron = require("node-cron");

const app = express();
const indexRouter = require('./app/routes/index');
const { Scraping } = require('./app/services');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/', indexRouter);

cron.schedule("0 7,8,9,10,11,12,13,14,15,16,17,18,19,20 * * *", function() {
    console.log("Start scraping of processes");
    Scraping.start();
});

// cron.schedule("07 12 * * *", function() {
//     console.log("Start scraping of processes");
//     Scraping.start();
// });

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
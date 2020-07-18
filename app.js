const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const cron = require("node-cron");

const app = express();
const indexRouter = require('./app/routes/index');
const { Scraping } = require('./app/services');

const pdf = require('html-pdf');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/', indexRouter);

cron.schedule("0 8,15,17 * * *", function() {
    console.log("Start scraping of processes");
    Scraping.start();
});
cron.schedule("30 10,12 * * *", function() {
    console.log("Start scraping of processes");
    Scraping.start();
});
cron.schedule("45 19 * * *", function() {
    console.log("Start scraping of processes");
    Scraping.start();
});

// let process = {code: '50622.000638/2018-39', urlQuery: 'https://sei.dnit.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?PZI69t_Z_hj3AifdlTrE4iTpBcSuICOmNN150aCRiIlX3c-BEmh9gzEC8gKvkzpdxz5WncELtJoM98tHLPT2NeoT0e1q6EApiMdSdWWeOM39Aup13S95t_C1Hqh-yKnf'};
// Scraping.scrapProcess(process).then( result => {
//     console.log(result.documents.length);
//     for (const document of result.documents) {
//         Scraping.workDocument(document).then( result => {
//             Scraping.sendDocumentEmail(process, document);
//         });
//     }
// });

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
const pdf = require('html-pdf');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const URL = 'https://sei.dnit.gov.br/sei/modulos/pesquisa/md_pesq_documento_consulta_externa.php?F4MU6hXy4iR5MjawpRQs9-noq3b14z4MX8NUh2TOpTJpMvZTWZ0qa25o7Yl0nPhZu8Rwl8Mqr0xUwd5Kei9RwMjM08MxvazzKluU4g-Ky3HOiIVEwRx1-77-QPSc0Qz5';

function getDocumento(type = 'text') {
    axios.get(URL, {
        responseType: type,
        responseEncoding: 'latin1',
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(function (response) {
        if (type == 'stream') {
            response.data.pipe(fs.createWriteStream("./out.pdf"));
            return;
        }

        // CASO O DOCUMENTO SEJA PDF, REFAZER REQUISICAO
        if (response.data.startsWith('%PDF'))
            return getDocumento('stream');

        pdf.create(response.data, { format: 'Letter' }).toFile('./out.pdf', function (err, res) {
            if (err) return console.log(err);
            console.log(res);
            console.log("DONE");
        });
    }).catch(function (error) {
        // handle error
        console.log(error);
    });
}

getDocumento();
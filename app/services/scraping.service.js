const { Process } = require('../models');
const pdf = require('html-pdf');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const { Console } = require('console');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mcostap80@gmail.com',
        pass: 'Mc24041997'
    }
});
module.exports = {
    start() {
        Process.findAll({
            where: { status: 'OPEN' },
            order: [['createdAt', 'DESC'],],
        }).then((processes) => {

            for (let process of processes) {
                console.log(process.urlQuery);
            }

        }).catch((error) => {
            console.log(error);
        });
    },

    workDocument(document) {
        return new Promise(async (resolve, reject) => {
            const response = await axios.get(`https://sei.dnit.gov.br/sei/modulos/pesquisa/${document.url}`, {
                responseType: 'text',
                responseEncoding: 'latin1',
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });

            // CASO O DOCUMENTO SEJA PDF, REFAZER REQUISICAO
            if (response.data.startsWith('%PDF')){
                console.log("DOCUMENTO DO TIPO PDF, NOVA REQUISICAO SERA REALIZADA");
                const response = await axios.get(`https://sei.dnit.gov.br/sei/modulos/pesquisa/${document.url}`, {
                    responseType: 'stream',
                    responseEncoding: 'latin1',
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                });
                await response.data.pipe(fs.createWriteStream(`./uploads/${document.code}.pdf`));
                console.log("FINALIZANDO ESCRITA DE DOCUMENTO");
                resolve(document);
            } else {
                pdf.create(response.data, { format: 'Letter' }).toFile(`./uploads/${document.code}.pdf`, (err, res,) => {
                    if (err) reject(err);
                    console.log("FINALIZANDO ESCRITA DE DOCUMENTO");
                    resolve(document);
                });
            }
        });
    },

    scrapProcess(process) {
        return new Promise((resolve, reject) => {
            axios.get(process.urlQuery, {
                responseType: 'text',
                responseEncoding: 'latin1',
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }).then((response) => {
                const $ = cheerio.load(response.data);

                const lengthProcess = $('#tblDocumentos tbody .infraTrClara').length;
                const result = { lastDocument: lengthProcess, documents: [] };
                let lastDocument = 219;

                if (lengthProcess > lastDocument) {

                    // DECREMENTO NECESSARIO POIS NO BANCO GRAVA O LENGTH E NAO O INDEX.
                    lastDocument--;
                    $('#tblDocumentos tbody .infraTrClara').each((index, item) => {
                        if (index >= lastDocument) {
                            let dataDocument = {};
                            $(item).find('td').each((id, td) => {
                                switch (id) {
                                    case 1:
                                        let urlDocument = $(td).find('a').attr('onclick').replace("window.open('", "").replace("');", "");
                                        let codeDocument = $(td).find('a').html();
                                        dataDocument.url = urlDocument;
                                        dataDocument.code = codeDocument;
                                        break;
                                    case 2:
                                        let typeDocument = $(td).html();
                                        dataDocument.type = typeDocument;
                                        break;
                                    case 3:
                                        let dateDocument = $(td).html();
                                        dataDocument.date = dateDocument;
                                        break;
                                    case 4:
                                        let registerDateDocument = $(td).html();
                                        dataDocument.registerDate = registerDateDocument;
                                        break;
                                    case 5:
                                        let unityDocument = $(td).find('a').html();
                                        dataDocument.unity = unityDocument;
                                        break;
                                    default:
                                        break;
                                }
                            });
                            result.documents.push(dataDocument);
                        }
                    });
                }

                resolve(result);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });

    },

    sendDocumentEmail(process, document) {
        console.log("INICIANDO ENVIO DE EMAIL");
        const mailOptions = {
            from: 'mcostap80@gmail.com',
            to: 'f7midia@gmail.com',
            subject: `Sistema: Novo Registro no Processo ${process.code}`,
            html: `Olá, um novo registro foi adicionado no processo <b>${process.code}</b>, arquivo em anexo.<br>
                    <b>Documento:</b> ${document.code} <br>
                    <b>Tipo de Documento:</b> ${document.type}<br>
                    <b>Data do Documento:</b>  ${document.date}<br>
                    <b>Data de Registro:</b>  ${document.registerDate}<br>
                    <b>Unidade:</b>  ${document.unity}`,
            attachments: {
                path: `./uploads/${document.code}.pdf`
            }
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                try {
                    fs.unlinkSync(`./uploads/${document.code}.pdf`)
                } catch (err) {
                    console.error(err)
                }
            }
        });
    }
}
const { Process } = require('../models');
const pdf = require('html-pdf');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const enviroment = require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seidespachos@gmail.com',
        pass: '101196Ae'
    }
});
module.exports = {
    start() {
        Process.findAll({
            where: { status: 'OPEN' },
            order: [['createdAt', 'DESC'],],
        }).then((processes) => {

            for (let process of processes) {
                this.scrapProcess(process).then(async result => {
                    console.log(result.lastDocument);

                    for (const document of result.documents) {
                        await this.workDocument(process, document).then(async docs => {
                            await this.sendDocumentEmail(process, document);
                        });
                    }

                    process.update({ lastDocument: result.lastDocument });
                });
            }

        }).catch((error) => {
            console.log(error);
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
                let lastDocument = process.lastDocument;

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

    workDocument(process, document) {
        return new Promise(async (resolve, reject) => {
            const response = await axios.get(`https://sei.dnit.gov.br/sei/modulos/pesquisa/${document.url}`, {
                responseType: 'text',
                responseEncoding: 'latin1',
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });

            // CASO O DOCUMENTO SEJA PDF, REFAZER REQUISICAO
            if (response.data.startsWith('%PDF')) {
                console.log("DOCUMENTO DO TIPO PDF, NOVA REQUISICAO SERA REALIZADA");
                document.attachmentLink = true;
                resolve(document);
                // const response = await axios.get(`https://sei.dnit.gov.br/sei/modulos/pesquisa/${document.url}`, {
                //     responseType: 'stream',
                //     responseEncoding: 'latin1',
                //     httpsAgent: new https.Agent({ rejectUnauthorized: false })
                // });

                // await response.data.pipe(await fs.createWriteStream(`./uploads/${document.code}.pdf`));
                // console.log(`FINALIZANDO ESCRITA DE DOCUMENTO TIPO PDF PROCESS: ${process.code} DOCUMENT: ${document.code}`);
            } else {
                pdf.create(response.data, { format: 'Letter' }).toFile(`./uploads/${document.code}.pdf`, (err, res,) => {
                    if (err) reject(err);
                    console.log(`FINALIZANDO ESCRITA DE DOCUMENTO PROCESS: ${process.code} DOCUMENT: ${document.code}`);
                    resolve(document);
                });
            }
        });
    },

    sendDocumentEmail(process, document) {
        return new Promise(async (resolve, reject) => {
            console.log("INICIANDO ENVIO DE EMAIL EMAIL: " + process.code);

            const mailOptions = {
                from: enviroment.parsed.EMAIL_SEND,
                to: enviroment.parsed.EMAIL_TO,
                subject: `Sistema: Novo Registro no Processo ${process.code}`,
                html: `Olá, um novo registro foi adicionado no processo <b>${process.code}</b>, arquivo em anexo.<br>
                    <b>Documento:</b> ${document.code} <br>
                    <b>Tipo de Documento:</b> ${document.type}<br>
                    <b>Data do Documento:</b>  ${document.date}<br>
                    <b>Data de Registro:</b>  ${document.registerDate}<br>
                    <b>Unidade:</b>  ${document.unity}`,
            };

            let documentFile = { path: `./uploads/${document.code}.pdf` }
            if(document.attachmentLink){
                documentFile = null;
                mailOptions.html = `${mailOptions.html}<br>
                    <b>URL Download:</b> https://sei.dnit.gov.br/sei/modulos/pesquisa/${document.url}`;
            }
            mailOptions.attachments = documentFile

            transporter.sendMail(mailOptions, function (error, info) {
                if (error)
                    reject(error);
                else {
                    console.log('Email sent: ' + info.response);
                    try {
                        if(!document.attachmentLink)
                            fs.unlinkSync(`./uploads/${document.code}.pdf`);

                        resolve('Email sent');
                    } catch (err) {
                        reject(err)
                    }
                }
            });
        });
    }
}
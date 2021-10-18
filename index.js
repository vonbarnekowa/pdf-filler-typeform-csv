const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.get('/',function(req,res) {
    res.sendFile(__dirname +'/form.html');
});

/*app.get('/hit', function(req, res, next) {

    var filename = "WhateverFilenameYouWant.pdf";
    // Be careful of special characters
    var error = false

    var npa = req.query.zip;
    var address = req.query.address;
    var bday = req.query.bday;
    var communeD = ""
    var canton = ""
    console.log(commune[npa]);

    if (commune[npa] !== undefined) {
        communeD = commune[npa].commune;
        canton = commune[npa].canton;
    } else {
        error = true;
    }

    filename = encodeURIComponent(filename);
    // Ideally this should strip them
    (async () => {
        res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');


        // This should be a Uint8Array or ArrayBuffer
        // This data can be obtained in a number of different ways
        // If your running in a Node environment, you could use fs.readFile()
        // In the browser, you could make a fetch() call and use res.arrayBuffer()
        const fsPromises = require('fs').promises;
        const existingPdfBytes = await fsPromises.readFile("./bogen-1.pdf");
        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Embed the Helvetica font
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Get the first page of the document
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        // Get the width and height of the first page
        const {width, height} = firstPage.getSize()

        if (error) {
            firstPage.drawText('ERREUR', {
                x: 40,
                y: 440,
                size: 70,
                font: helveticaFont,
                color: rgb(0.95, 0.1, 0.1)
            })
        } else {

            // NPA
            firstPage.drawText(npa, {
                x: 50,
                y: 540,
                size: 15,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            })

            // commune
            firstPage.drawText(communeD, {
                x: 220,
                y: 540,
                size: 15,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            })

            // commune
            firstPage.drawText(canton, {
                x: 460,
                y: 540,
                size: 11,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            })

            // Date de naissance
            var date = new Date(bday);
            firstPage.drawText(date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear(), {
                x: 212,
                y: 480,
                size: 11,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            })

            // Adresse
            firstPage.drawText(address, {
                x: 275,
                y: 480,
                size: 11,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            })

        }
        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()


        //fs.createWriteStream('bogen-filled.pdf').write(pdfBytes);
        //res.contentType("application/pdf");
        //fs.createReadStream(pdfBytes).stream(res);

        var Readable = require('stream').Readable

        var s = new Readable()
        s.push(pdfBytes)    // the string you want
        s.push(null)

        s.pipe(res);
    })();
});*/

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT || port}`)
});

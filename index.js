const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const csv = require('fast-csv');
const ObjectsToCsv = require('objects-to-csv');
const app = express();
const port = 3000;

let pdfBytes = null;
let errorArray = [];

app.get('/',function(req,res) {
    res.sendFile(__dirname +'/form.html');
});

function fillFirstPage(firstPage, bday, address, city, zip, state, font) {
    firstPage.drawText(zip, {
        x: 50,
        y: 256,
        size: 15,
        font: font,
        color: rgb(0, 0, 0)
    });

    firstPage.drawText(city, {
        x: 185,
        y: 256,
        size: 15,
        font: font,
        color: rgb(0, 0, 0)
    });

    firstPage.drawText(state, {
        x: 450,
        y: 256,
        size: 15,
        font: font,
        color: rgb(0, 0, 0)
    });

    var date = new Date(bday);
    firstPage.drawText(date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear(), {
        x: 212,
        y: 218,
        size: 8,
        font: font,
        color: rgb(0, 0, 0)
    });

    firstPage.drawText(address, {
        x: 265,
        y: 218,
        size: 8,
        font: font,
        color: rgb(0, 0, 0)
    })

    return firstPage;
}

function fillSecondPage(secondPage, firstName, lastName, address, city, zip, font) {
    return secondPage;

    secondPage.drawText(firstName + " " + lastName, {
        x: 75,
        y: 255,
        size: 8,
        font: font,
        color: rgb(0, 0, 0)
    });

    secondPage.drawText(address, {
        x: 60,
        y: 238,
        size: 8,
        font: font,
        color: rgb(0, 0, 0)
    });

    secondPage.drawText(zip + " " + city, {
        x: 50,
        y: 221,
        size: 8,
        font: font,
        color: rgb(0, 0, 0)
    });

    return secondPage;
}

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.post('/hit', function(req, res, next) {

    var filename = "GAS.pdf";

    filename = encodeURIComponent(filename);
    // Ideally this should strip them
    (async () => {
        //res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
        //res.setHeader('Content-type', 'application/pdf');


        const fsPromises = require('fs').promises;
        const existingPdfBytes = await fsPromises.readFile((req.files.pdf) ? req.files.pdf.tempFilePath : "./gas-bogen/de.pdf");
        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Embed the Helvetica font
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const mergedPdf = await PDFDocument.create();

        errorArray = [];
        fs.createReadStream(req.files.csv.tempFilePath)
            .pipe(csv.parse({headers: true}))
            .on('data', async (row) => {
                const arr = Object.values(row);

                if (arr.length !== 13) {
                    console.log(row);
                    errorArray.push(row);
                    return;
                }

                const firstName = arr[1];
                const lastName = arr[2];
                const address = arr[3];
                const zip = arr[4];
                const city = arr[5];
                const bday = arr[6];
                const state = arr[7];
                const email = arr[8];

                if (!firstName || !lastName || !address || !zip || !city || !bday || !state || !email)  {
                    console.log(row);
                    errorArray.push(row);
                    return;
                }

                const [firstDonorPage] = await mergedPdf.copyPages(pdfDoc, [0]);
                const [second] = await mergedPdf.copyPages(pdfDoc, [1]);
                const fp = fillFirstPage(firstDonorPage, bday, address, city, zip, state, helveticaFont);
                const fp2 = fillSecondPage(second, firstName, lastName, address, city, zip, helveticaFont);


                mergedPdf.addPage(fp);
                mergedPdf.addPage(fp2);



            })
            .on('end', () => {
                console.log('CSV file successfully processed');


            })
            .on('finish',async () => {
                pdfBytes = await mergedPdf.save();

                res.render(__dirname +'/result.html', {nbrOfErrors: errorArray.length});
            });
    })();
});

app.get('/pdf', function(req, res, next) {
    if (!pdfBytes) {
        res.sendStatus(404);
    }
    res.setHeader('Content-disposition', 'inline; filename="bogen.pdf"');
    res.setHeader('Content-type', 'application/pdf');

    var Readable = require('stream').Readable;

    var s = new Readable();
    s.push(pdfBytes);
    s.push(null);

    s.pipe(res);
});

app.get('/csv', async function(req, res, next) {
    if (errorArray.length === 0) {
        res.sendStatus(404);
    }

    const csv = new ObjectsToCsv(errorArray);
    res.setHeader('Content-disposition', 'attachment; filename=errors.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(await csv.toString());
});

app.get("/clear", function(req, res) {
   errorArray = [];
   pdfBytes = null;
   res.redirect("/");
});

app.listen(process.env.PORT || port, () => {
    console.log(`App listening at http://localhost:${process.env.PORT || port}`)
});

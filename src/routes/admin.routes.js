const express = require('express');
const router = express.Router();
const fs = require('fs');
const AdmZip = require('adm-zip');

router.post('/login', (req, res) => {
    const body = req.body;
    const usuario = body.username;
    const password = body.password;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("select * from administrators where username = ?  and password = ?", [usuario, password], function (error, results, fields) {
            if (error) throw error;
            if (results) {
                res.send(results);
            }
        });

    })
})

router.post('/statsperspider', (req, res) => {
    const body = req.body;
    const spidername = body.spidername;
   
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("CALL spiderstats(?, @promedio, @registrostotales);  SELECT @promedio as promedio, @registrostotales as registrostotales", [spidername], function (error, results, fields) {
            if (error) throw error;
            if (results) {
                res.send(results);
            }
        });

    })
})


router.post('/adminData', (req, res) => {

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("SELECT spiders.species, COUNT(*) as 'CantidadEncuestas' FROM spiders INNER JOIN predictions ON spiders.idSpider = predictions.prediction INNER JOIN surveys ON predictions.idPrediction= surveys.idPrediction group by spiders.idSpider", function (error, results, fields) {
            if (error) res.send(error);
            if (results) {
                res.send(results);
            }
        });

    })
})

router.post('/satisfaccionG', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("SELECT (AVG((surveyResult)*100)/3) as Positiva , 100-(AVG((surveyResult)*100)/3)  as Negativa FROM surveys", function (error, results, fields) {
            if (error) res.send(error);
            if (results) {
                res.send(results);
            }
        });
    })
})


router.post('/totalEncuestas', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("SELECT COUNT(*) as encuestas FROM surveys", function (error, results, fields) {
            if (error) res.send(error);
            if (results) {
                res.send(results);
            }
        });
    })
})

router.post('/satisfaccionA', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        conn.query("SELECT spiders.species, AVG(surveyResult) as 'PromedioEncuestas' FROM spiders INNER JOIN predictions ON spiders.idSpider = predictions.prediction INNER JOIN surveys ON predictions.idPrediction= surveys.idPrediction group by spiders.idSpider order by AVG(surveyResult) DESC;",
         function (error, results, fields) {
            if (error) res.send(error);
            if (results) {
                res.send(results);
            }
        });
    })
})


router.get('/descargarImagenes', (req, res) => {
    const zip = new AdmZip();

    // Lee todos los archivos de la carpeta "imagenes"
    fs.readdir('./src/imagesUploaded', (error, archivos) => {
        if (error) {
            res.status(500).send('Error al leer la carpeta de imágenes');
            return;
        }

        // Agrega todos los archivos a la instancia de AdmZip
        archivos.forEach(archivo => {
            const contenido = fs.readFileSync(`./src/imagesUploaded/${archivo}`);
            zip.addFile(archivo, contenido, '', 0o644 << 16);
        });

        // Genera el archivo "zip"
        const zipBuffer = zip.toBuffer();

        // Establece la cabecera de descarga y envía el archivo "zip" al cliente
        res.attachment('imagenes.zip');
        res.send(zipBuffer);
    });
});

module.exports = router;
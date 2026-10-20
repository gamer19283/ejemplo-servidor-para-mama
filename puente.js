const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PUERTO = 8080;

const TIPOS_MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
};

const servidor = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/calcular') {
        let expresion = '';
        req.on('data', trozo => expresion += trozo);
        req.on('end', () => {
            if (!expresion.trim()) {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('ERROR: Expresión vacía');
                return;
            }

            // Se llama a Python pasándole el texto plano
            execFile('python', ['calculadora.py', expresion], (error, stdout) => {
                if (error) {
                    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('ERROR: Fallo al ejecutar Python');
                    return;
                }
                // Se envía la respuesta de Python como texto plano
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(stdout.trim());
            });
        });
        return;
    }

    // Servir archivos estáticos
    let ruta = req.url === '/' ? '/index.html' : req.url;
    const archivo = path.join(__dirname, ruta);

    fs.readFile(archivo, (err, contenido) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 - No encontrado');
            return;
        }
        const ext = path.extname(archivo).toLowerCase();
        res.writeHead(200, { 'Content-Type': TIPOS_MIME[ext] || 'text/plain' });
        res.end(contenido);
    });
});

servidor.listen(PUERTO, () => {
    console.log(`Servidor iniciado en http://localhost:${PUERTO}`);
});

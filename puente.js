const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PUERTO = 8080;

const TIPOS_MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
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
        let cuerpo = '';
        req.on('data', trozo => cuerpo += trozo);
        req.on('end', () => {
            let expresion = '';
            try {
                expresion = JSON.parse(cuerpo).expresion || '';
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, error: 'JSON inválido' }));
                return;
            }

            if (!expresion.trim()) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, error: 'Expresión vacía' }));
                return;
            }

            // En Windows a veces 'python' falla y hay que usar 'py'
            execFile('python', ['calculadora.py', expresion], (error, stdout) => {
                if (error) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ ok: false, error: 'Error ejecutando Python' }));
                    return;
                }
                // Enviamos la respuesta limpia de Python
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
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
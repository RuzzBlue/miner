import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/calculator.js':'calculator.js'};
http.createServer(async(req,res)=>{try{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);return res.end('No encontrado');}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');res.end(await readFile(new URL(file,import.meta.url)));}catch{res.writeHead(500);res.end('Error');}}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));

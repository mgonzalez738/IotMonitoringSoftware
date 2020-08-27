const FtpSrv = require('ftp-srv'); 
const bunyan = require('bunyan'); 
const path = require('path');

const dayTime = require('../services/daytime')
const dns = require('../services/dns')

// Inicia el servicio

exports.start = async () => {  

    // Resuelve la direccion IP externa
    let pasiveIp;
    try{
        pasiveIp = await dns.resolve(process.env.FTP_SRV_PASV_DNS);
    }catch(err){
        console.error(err);
    }

    // Crea el servicio

    const server = new FtpSrv({
        log: bunyan.createLogger({name: 'test', level: 60}),
        url: 'ftp://0.0.0.0:' + process.env.FTP_SRV_PORT,
        pasv_url: pasiveIp,
        pasv_min: process.env.FTP_SRV_PASV_PORT_MIN,
        pasv_max: process.env.FTP_SRV_PASV_PORT_MIN,
        greeting: ['Welcome', 'to', 'IotMonitoring', 'Server'],
        whitelist: ['ABOR', 'AUTH', 'CWD', 'DELE', 'LIST', 'OPTS', 'PASS', 'PASV', 'PORT', 'PWD', 'QUIT', 'RETR', 'STOR', 'TYPE', 'USER']
      });
  
    // Evento de loggeo
    server.on('login', ({ connection, username, password }, resolve, reject) => { 
    
        /// TODO: Cambiar a validar un usuario y pass asignado por proyecto
        /// TODO: Agregar habilitacion para carga de datos por ftp en proyecto
        if (username == "gie" && password == "giegie") { 
            console.log(dayTime.getUtcString() + "\x1b[33mFtpServer: Client logged\x1b[0m");
            // Devuelve la carpeta raiz 
            /// TODO: Agregar subcarpeta por proyecto como raiz
            resolve({ root: path.join(__dirname, "../" + process.env.FTP_SRV_IMPORT_PATH) }); 
            // Agrega el handler para manejar las cargas de archivos
            connection.on('STOR', (error, fileName) => { 
                if (error) { 
                    console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: Error receiving file ${fileName} | Error -> ${error}\x1b[0m`);
                } 
                /// TODO: Llamar a funcion de parseo del archivo
                console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: File received ${fileName}\x1b[0m`);
            });
            connection.on('RETR', (error, filePath) => { 
                if (error) { 
                    console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: Error retrieving file ${filePath} | Error -> ${error}\x1b[0m`);
                } 
                console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: File retrieved ${filePath}\x1b[0m`);
            });             
        } else { 
            reject(new Error('Unable to authenticate with FTP server: bad username or password')); 
            console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: Authentication error\x1b[0m`);
        } 
    }); 
  
    // Evento de error del cliente
    server.on('client-error', ({ context, error }) => { 
        console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: Error interfacing with client | Error -> ${error}\x1b[0m`); 
    }); 
  
    const closeFtpServer = async () => { 
        await server.close(); 
    }; 
  
    // The types are incorrect here - listen returns a promise 
    server.listen().then(
        console.log(dayTime.getUtcString() + "\x1b[33mFtpServer: Start listening on port " + process.env.FTP_SRV_PORT + "\x1b[0m")
    ); 

    return { 
        shutdownFunc: async () => { 
        // server.close() returns a promise - another incorrect type 
        await closeFtpServer(); 
        }, 
    }; 
}; 
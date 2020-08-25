const FtpSrv = require('ftp-srv'); 
const bunyan = require('bunyan'); 

const dayTime = require('../services/daytime')

// Cadenas de conexion activa y pasiva
const url_string = "ftp://" + process.env.FTP_SRV_ADDRESS + ":" + process.env.FTP_SRV_PORT;
const pasv_url_string = "ftp://" + process.env.FTP_SRV_ADDRESS

// Inicia el servicio

exports.start = async () => {  

    // Opciones del servicio
    const options = {
        url: url_string,
        //greeting: ["Hola"],
        pasv_url: pasv_url_string,
        log: bunyan.createLogger({ 
                name: 'quiet-logger', 
                level: 60})
    }

    // Crea el servicio
    const server = new FtpSrv(options); 
  
    // Evento de loggeo
    server.on('login', ({ connection, username, password }, resolve, reject) => { 
    
        /// TODO: Eliminar y cambiar a usuario y pass asignado por proyecto
        /// TODO: Agregar habilitacion para carga de datos por ftp en proyecto
        if (username == "gie" && password == "giegie") { 
            console.log(dayTime.getUtcString() + "\x1b[33mFtpServer: Client logged\x1b[0m");
            // Devuelve la carpeta raiz 
            /// TODO: Agregar subcarpeta por proyecto
            resolve({ root: process.env.FTP_SRV_IMPORT_PATH }); 
            // Agrega el handler para manejar las cargas de archivos
            connection.on('STOR', (error, fileName) => { 
                if (error) { 
                    console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: Error receiving file ${fileName} | Error -> ${error}\x1b[0m`);
                } 
                console.log(dayTime.getUtcString() + `\x1b[33mFtpServer: File received ${fileName}\x1b[0m`);
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
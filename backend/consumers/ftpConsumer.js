const FtpSrv = require('ftp-srv'); 
const bunyan = require('bunyan'); 

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
            // Si conecta, agrega el handler para manejar las cargas de archivos 
            connection.on('STOR', (error, fileName) => { 
                if (error) { 
                    console.error(`FTP server error: could not receive file ${fileName} for upload ${error}`); 
                } 
                console.info(`FTP server: upload successfully received - ${fileName}`); 
             }); 
            // Devuelve la carpeta raiz 
            /// TODO: Agregar subcarpeta por proyecto
            resolve({ root: process.env.FTP_SRV_IMPORT_PATH }); 
        } else { 
            reject(new Error('Unable to authenticate with FTP server: bad username or password')); 
        } 
    }); 
  
    // Evento de error del cliente
    server.on('client-error', ({ context, error }) => { 
        console.error(`FTP server error: error interfacing with client ${context} ${error} on ftp://${host}:${port} ${JSON.stringify(error)}`); 
    }); 
  
    const closeFtpServer = async () => { 
        await server.close(); 
    }; 
  
    // The types are incorrect here - listen returns a promise 
    await server.listen(); 
  
    return { 
        shutdownFunc: async () => { 
        // server.close() returns a promise - another incorrect type 
        await closeFtpServer(); 
        }, 
    }; 
}; 
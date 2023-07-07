const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const multer = require('multer');
const upload_image = multer({ dest: 'uploads/' });//Carpeta destino a guarda la imagen
const app = express()//Inicializar express


app.use(function(req, res, next) { //Permitir peticiones de otros servidores
    res.setHeader('Access-Control-Allow-Origin', '*');//* permite que se haga desde cualquier servidor
    res.setHeader('Access-Control-Allow-Methods', '*');//* permite que se haga desde cualquier servidor
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");//Permitir que se envíen datos desde el cliente
    next()//Pasar al siguiente middleware
})

app.use(bodyParser.json())//Permitir peticiones con formato json

const PUERTO =  3000//Puerto por el que se ejecutará el servidor

const conexion = mysql.createConnection(/*Datos de conexión a la base de datos*/
    {
        host:'localhost',
        database: 'pruebas',
        user: 'root',
        password: '',
    }
)

app.listen(PUERTO, () => {//Iniciar servidor
    console.log(`Servidor corriendo en el puerto ${PUERTO}`);
})

conexion.connect(error => {//Conexión a la base de datos
    if(error) throw error //Si hay error, mostrarlo
    console.log('Conexión exitosa a la base de datos');
})

app.get('/', (req, res) => {//Ruta inicial
    res.send('API')//Mensaje de bienvenida
})

app.get('/usuarios', (req, res) => {//Ruta para obtener todos los usuarios

    const query = 'SELECT * FROM usuarios;'//Consulta SQL
    conexion.query(query, (error, resultado) => {//Ejecutar consulta
        if(error) return console.error(error.message)//Si hay error, mostrarlo

        const obj = {}//Objeto para almacenar los datos de la consulta
        if(resultado.length > 0) {//Si hay registros
            obj.listaUsuarios = resultado//Almacenar los registros en el objeto
            res.json(obj)//Enviar objeto como respuesta
        } else {
            res.send('No hay registros')
        }
    })
})

app.get('/usuario/:id', (req, res) => {//Ruta para obtener un usuario por su id
    const { id } = req.params//Obtener el id de los parámetros de la ruta

    const query = `SELECT * FROM usuarios WHERE idUsuario=${id};`//Consulta SQL
    conexion.query(query, (error, resultado) => {//Ejecutar consulta
        if(error) return console.error(error.message)//Si hay error, mostrarlo

        if(resultado.length > 0){//Si hay registros
            res.json(resultado);//Enviar registros como respuesta
        } else {
            res.send('No hay registros');
        }
    })
})

// Configurar multer para almacenar los archivos en una carpeta específica
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');//Ruta de almacenamiento
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
// Crear el middleware de multer
const upload = multer({ storage: storage })

app.post('/usuario/add', upload.single('imagen'), (req, res) => {//Ruta para agregar un usuario
    /*const usuario = {//Objeto con los datos del usuario
        nombre: req.body.nombre,//Obtener los datos del cuerpo de la petición
        email: req.body.email, //Obtener los datos del cuerpo de la petición
        imagen: req.file.filename // Obtener el nombre del archivo cargado
    }
     // Lee el archivo de imagen en un buffer
  const imageData = fs.readFileSync(image.path);
    const query = `INSERT INTO usuarios SET ?`//Consulta SQL
    conexion.query(query, usuario, (error) => {//Ejecutar consulta
        if(error) return console.error(error.message)//Si hay error, mostrarlo
        res.json(`Se inserto correctamente el usuario`)
    })*/
    const { idUsuario, nombre, email } = req.body;
    const imagen = req.file.path;
  
    const usuario = {
      idUsuario: parseInt(idUsuario),
      nombre,
      email,
      imagen
    };
  
    connection.query('INSERT INTO usuarios SET ?', usuario, (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
})

app.put('/usuario/update/:id', (req, res) => {//Ruta para actualizar un usuario
    const { id } = req.params
    const { nombre, email } = req.body

    const query = `UPDATE usuarios SET nombre='${nombre}', email='${email}' WHERE idUsuario='${id}';`//Consulta SQL
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)//Si hay error, mostrarlo

        res.json(`Se actualizó correctamente el usuario`)//Enviar respuesta
    })
})

app.delete('/usuario/delete/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM usuarios WHERE idUsuario=${id};`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se eliminó correctamente el usuario`)
    })
})
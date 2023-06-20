const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const Post = require('./models/Post');
const { Sequelize, sequelize, DataTypes } = require('./models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');




// Define a pasta "public" como o local dos arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Define a pasta "views" como o local dos arquivos EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



// Configuração do middleware express-session
app.use(session({
  secret: 'chave-secreta',
  resave: false,
  saveUninitialized: false
}));


// Inicialização do Passport.js
app.use(passport.initialize());
app.use(passport.session());


//body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Configuração do Passport.js
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'senha'
}, async function(email, senha, done) {
  try {
    const usuario = await Post.findOne({ where: { email } });

    if (usuario) {
      return done(null, false, { message: 'Email já cadastrado.' });
    }

    return done(null, true);
  } catch (error) {
    return done(error);
  }
}));


//Serialização e Deserialização 
  // Serialização do usuário
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });


  // Deserialização do usuário
  passport.deserializeUser(function(id, done) {
    Post.findByPk(id)
      .then(function(user) {
        done(null, user);
      })
      .catch(function(error) {
        done(error);
      });
  });


//rote de inicio 
app.get("/", function(req, res) {
  res.render("inicio_gato");
  });


//rota para o login
app.get("/login", function(req, res){
  res.render("login_gato");
})


// Rota para a página principal
app.post('/logar', function(req, res) {
  const { email, senha } = req.body;

  Post.findOne({
    where: {
      email: email,
      senha: senha
    }
  }).then(function(result) {
    if (result) {
      const fotosDir = path.join(__dirname, "public", "fotos");

      fs.readdir(fotosDir, function(err, files) {
        if (err) {
          console.log(err);
          res.status(500).send('Erro ao carregar a galeria de fotos.');
        } else {
          const fotoPaths = files.map(file => '/fotos/' + file);
          res.render("galeria", { fotos: fotoPaths });
        }
      });
    } else {
      res.send("Usuário ou senha inválido. <a href='/login'>Ir para login</a>");
    }
  }).catch(function(erro) {
    res.send("Houve um erro: " + erro);
  });
});



// Rota de cadastro
app.get("/cadastro", function(req, res) {
  res.render("cadastro_gato");
});


// Rota de cadastrar
app.post('/add', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.send("Houve um erro: " + err);
    }
    if (!user) {
      return res.send("Email já cadastrado. <a href='/cadastro'>Voltar ao cadastro</a>");
    }
    Post.create({
      nome: req.body.nome,
      email: req.body.email,
      adm: '0',
      senha: req.body.senha
    }).then(function() {
      res.render("login_gato");
    }).catch(function(erro) {
      res.send("Houve um erro: " + erro);
    });
  })(req, res, next);
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/fotos'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});


const upload = multer({ storage: storage });


const Foto = sequelize.define('Foto', {
  jpg: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'fotos' 
});


// Middleware de verificação de autenticação
const verificarAutenticacao = (req, res, next) => {
 
  if (req.isAuthenticated()) {
    
    return next();
  }
  
  // Caso contrário, redireciona o usuário para a página de login
  res.redirect('/login');
};


app.get("/fotogato", function(req, res) {
  res.render("principal_gato");
});


app.post('/upload', upload.single('foto'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('Nenhuma foto foi selecionada.');
    return;
  }

  const fileName = req.file.filename;

  try {
    await Foto.create({ jpg: fileName });

    const fotosDir = path.join(__dirname, "public", "fotos");
    fs.readdir(fotosDir, function(err, files) {
      if (err) {
        console.log(err);
        res.status(500).send('Erro ao carregar a galeria de fotos.');
      } else {
        const fotoPaths = files.map(file => '/fotos/' + file);
        res.render("galeria", { fotos: fotoPaths });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao salvar a foto no banco de dados.');
  }
});



// Rota para exibir a galeria de fotos (requer autenticação)
app.get("/galeria", verificarAutenticacao, function(req, res) {
  const fotosDir = path.join(__dirname, "public", "fotos");

  fs.readdir(fotosDir, function(err, files) {
    if (err) {
      console.log(err);
      res.status(500).send('Erro ao carregar a galeria de fotos.');
    } else {
      const fotoPaths = files.map(file => '/fotos/' + file);
      res.render("galeria", { fotos: fotoPaths });
    }
  });
});



// Rota de logout
app.get('/logout', function(req, res) {
  res.redirect('/login'); // Redireciona para a página de login
});





app.listen(4800, function() {
    console.log("Servidor gato rodando na url http://localhost:4800");
  });
  
var path = require('path');

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

//Carga Modelo ORM
var Sequelize = require('sequelize');

//Usat BBDD SQlite:
var sequelize = new Sequelize(DB_name, user, pwd,{
	dialect: protocol,
	protocol: protocol,
	port: port,
	host: host,
	storage: storage,
	omitNull: true
	}
);


//Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

//Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

//Importar definicion de la tabla User
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// los quizes pertenecen a un usuario registrado
Quiz.belongsTo(Quiz);
User.hasMany(Quiz);

exports.Quiz = Quiz; //exportar definición de tabla Quiz
exports.Comment = Comment;
exports.User = User;

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function(){
	Quiz.count().then(function(count){
		if(count === 0){
			User.bulkCreate(
				[{username: 'admin', password: '1234', isAdmin: true},
				 {username: 'pepe', password: '5678'} //isAdmin por defecto: false
				]
			).then(function(){
				console.log('Base de datos (tabla user) incializada');
				Quiz.count().then(function(count){
					if(count === 0) {
						Quiz.bulkCreate( //estos quizes pertenecen al usuario pepe (2)
							[ {pregunta: 'Capital de Italia', respuesta: 'Roma', userId: 2},
							  {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', userId: 2}
							]
						/*Quiz.create({
							pregunta: 'Capital de Italia',
							respuesta: 'Roma',
							userId: 2
						});
						Quiz.create({
							pregunta: 'Capital de Portugal',
							respuesta: 'Lisboa',
							userId: 2
						}*/
						).then(function(){console.log('Base de datos (tabla quiz) inicializada')});
					};
				});
			});
		};
	});
});
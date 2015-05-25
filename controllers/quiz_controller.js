var models = require('../models/models.js')

//MW que permite acciones solamente si el quiz objeto
//pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	if(isAdmin || objQuizOwner === logUser){
		next();
	} else {
		res.redirect('/');
	}
};


//Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
			where: {id: Number(quizId)},
			include: [{model: models.Comment}] //solicita cargar en la propiedad quiz.Comments los comentarios asociados a quiz a traves de la relacion 1-N entre Quiz y Comment
		}).then(function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			} else{
				next(new Error('No existe quizId = '+ quizId));
			}
		}
	).catch(function(error){next(error);});
};

//GET /quizes
exports.index = function(req, res){
	var options = {};
	var logUser = req.session.user;

	if(req.user){ //req.user es creado por autoload de usuario 
		options.where = {UserId: req.user.id} //si la ruta lleva el parametro .quizId
	}
	if(req.session && req.session.user){
		options.include = {model: models.User, as:"Groupies"}
	}
	if(req.query.search != null){
		req.query.search = '%'+req.query.search+'%';
		models.Quiz.findAll({where: ["pregunta like ?", req.query.search], order: ['pregunta']}).then(function(quizes){
			res.render('quizes/index', {quizes: quizes, errors: []});	
		}).catch(function(error){next(error);})
	}
	else {
		models.Quiz.findAll(options).then(function(quizes){
			if(req.session.user) {
				quizes.forEach(function(quiz){
					quiz.isFav = quiz.Groupies.some(function(groupie){return groupie.id == req.session.user.id});
				});
			}
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}).catch(function(error){next(error);})
	}
	
};

//GET /quizes/:id
exports.show = function(req, res){
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req,res){
	var resultado = "Incorrecto";
	if(req.query.respuesta === req.quiz.respuesta){
		resultado = "Correcto";
	} 
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

//POST /quizes/create
 exports.create = function(req, res){
 	req.body.quiz.UserId = req.session.user.id;
 	if(req.files.image){
 		req.body.quiz.image = req.files.image.name;
 	}
 	var quiz = models.Quiz.build(req.body.quiz);

 	quiz
 	.validate()
 	.then(
 		function(err){
 			if(err){
 				res.render('quizes/new', {quiz: quiz, errors: err.errors});
 			} else{
 				quiz //save: guarda en DB los campos pregunta y respuesta de quiz
 				.save({fields: ["pregunta", "respuesta","UserId", "image"]})
 				.then(function(){res.redirect('/quizes')})
 			} //res.redirect: Redirección HTTP a lista de preguntas
 		}
 	);
 };

//GET /quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; //autoload de instancia de quiz
	res.render('quizes/edit',{quiz: quiz, errors: []});
};

//PUT /quizes/:id
exports.update = function(req, res){
	if(req.files.image){
 		req.quiz.image = req.files.image.name;
 	}
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else{
				req.quiz //save: guarda campos pregunta y respuesta en DB
				.save({fields: ["pregunta", "respuesta", "image"]})
				.then(function(){res.redirect('/quizes');});
			} //Redirección HTTP a lista de preguntas (URL relativo)
		}
	);
};

//DELETE /quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};






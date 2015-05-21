var models = require('../models/models.js');

//GET /quizes/statistics
exports.statistics = function(req, res){
	models.Quiz.findAll().then(function(quizes){
		var numPregs = quizes.length;
		models.Comment.findAll().then(function(comments){
			var numComentarios = comments.length;
			var media = numComentarios/numPregs;
			var sinComments = 0;
			var conComments = 0;
			var i = 0;
			var k = 0;
			var array=[];
			for(i=0; i<numComentarios; i++){
				if(array[comments[i].QuizId]){
					array[comments[i].QuizId]++;
				}else{
					array[comments[i].QuizId] = 1;
				}
				conComments = 0;
			}
			for(k=0; k<array.length; k++){
				if(array[k]){
					conComments++;
				}
			}
			sinComments = numPregs - conComments;
			res.render('quizes/statistics', {quizes: quizes, preguntas: numPregs, comentarios: numComentarios, media: media, sinComments: sinComments, conComments: conComments, errors: []});
		}).catch(function(error){next(error);})
	}).catch(function(error){next(error);})
	
			
};
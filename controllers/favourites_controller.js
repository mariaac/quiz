var models = require('../models/models.js')

exports.show = function(req, res, next){
	req.user.getFavourites().then(function(favoritos){
		favoritos.forEach(function(favorito){
			favorito.isFav = true;
		});
		res.render('quizes/index.ejs', {quizes: favoritos, errors:[]});
	}).catch(function(error){next(error)});
};


//PUT /user/:userId/favourites/:quizId
exports.isFavourite = function(req, res, next){
	var dir = req.body.redir || '/user/'+req.user.id+'/favourites';
	req.user.addFavourites(req.quiz).then(function(){
		res.redirect(dir);
	}).catch(function(error){next(error)});
};

exports.destroy = function(req, res, next){
	var dir = req.body.redir || '/user/'+req.user.id+'/favourites';
	req.user.removeFavourites(req.quiz).then(function(){
		res.redirect(dir);
	}).catch(function(error){next(error)});
};
module.exports = function(sequelize, DataTypes){
	return sequelize.define(
	'Favourites',
	{ favorito: {
		type: DataTypes.STRING
		}
	});
}
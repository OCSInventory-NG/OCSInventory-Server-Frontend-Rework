let publicPath = process.env.NODE_ENV === 'production' ? './' : './';

module.exports = {
	devServer: {
		host: '172.18.26.12', 
		port: 3000,
	}, 
	publicPath,
	productionSourceMap: false,
};

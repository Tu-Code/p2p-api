exports.pageNotFound = (req, res, next) => {
	// res.status(404).render('404');
	res.send({'error':404});
};
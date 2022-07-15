const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({
            status: 'error',
            message: 'Please authenticate',
        })

        const decoded = jwt.verify(token, process.env.JWT_KEY)

        req.user_id = decoded.id;
        
        next()
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 'error',
            message: 'An error occured',
        })
    }
}

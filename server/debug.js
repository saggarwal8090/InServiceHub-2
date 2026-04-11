const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const dir = req.query.dir || '.';
    try {
        const files = fs.readdirSync(path.join(process.cwd(), dir));
        res.json({ cwd: process.cwd(), dir, files });
    } catch (err) {
        res.json({ error: err.message, cwd: process.cwd(), dir });
    }
};

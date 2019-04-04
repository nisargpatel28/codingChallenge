module.exports = {
    getTransactions: () => {
        return new Promise(function(resolve, reject) {
            let query = "SELECT * FROM `transaction` ORDER BY tId DESC"; // query database to get all the players
            // execute query
            db.query(query, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
    },

    addTransaction: (req, res) => {
        return new Promise(function(resolve, reject) {
            let tAmount = req.body.tAmount;
            let tAccount = req.body.tAccount;
            let query = "INSERT INTO `transaction` (tAmount, tAccount) VALUES ('" +
                tAmount + "', '" + tAccount + "')";
            db.query(query, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
    },
};
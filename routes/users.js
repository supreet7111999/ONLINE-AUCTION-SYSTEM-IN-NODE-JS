var express = require('express');
const conn = require("../connection");
var router = express.Router();
const session = require('express-session')


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/user-products', function (req, res, next) {
    if (session.username !== undefined)
        res.render('userproducts')
    else
        res.redirect('/user_login')
});

router.post('/insert-user-product', (req, res) => {
    // console.log(req.body);
    let p_id = req.body.p_id;
    let name = req.body.name;
    let category = req.body.category;
    let image = req.files.image;
    let realpath = "public/userproductphotos/" + image.name;
    let dbpath = "userproductphotos/" + image.name;
    let user_email = req.body.user_email;
    let price = req.body.price;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    let description = req.body.description;
    let status = req.body.status;


    console.log(image);
    if (price > 100000000) {
        res.send("enter less value");
    } else {
        image.mv(realpath, function (err) {
            if (err) throw err;
        })
        let CheckUser = `SELECT * FROM user_products WHERE p_id="${p_id}"`;
        conn.query(CheckUser, (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                res.send('exist');
            } else {
                let Query = "insert into user_products (name,category,price,description,image,user_email) values ('" + name + "','" + category + "','" + price + "','" + description + "','" + dbpath + "','" + session.username + "')";
                // console.log(Query);
                conn.query(Query, function (err) {
                    if (err) throw err;
                    res.send("Data Inserted");
                });
            }
        });
    }
});

router.get('/get-catName-data', function (req, res, next) {
    var Query = "select cat_name,cat_id from categories";
    conn.query(Query, function (err, rows) {
        res.send(rows)
    })
});


router.get('/userhome', function (req, res) {
    if (session.username !== undefined)
        res.render('userhome', {username: session.username})
    else
        res.redirect('/user_login')
})
router.get('/logout', function (req, res) {
    session.username = undefined;
    res.send('logout')
})


//Add Bid code


router.get('/BidPlace', function (req, res) {
    let p_id = req.query.p_id;
    let Query = `select p_id from user_products where p_id = "${p_id}"`;
    // console.log(Query);
    conn.query(Query, function (err, row) {
        if (err) throw err;
        if (row.length > 0) {
            console.log(row);
            res.send(row);
        } else {
            res.send('No data Found')
        }

    })
});

router.get('/Bidingview', function (req, res) {
    let p_id = req.query.pid;
    // console.log(p_id);
    var Query = `select * from user_products where p_id = ${p_id}`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Product Found')
        }

    })
});


router.get('/add-bid', (req, res) => {
    if (session.username !== undefined)
        res.render('bid');
    else
        res.redirect('/user_login')

});

router.get('/photoview', function (req, res) {
    var Query = `select * from user_products where status='active' and user_email !='${session.username}'`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Product Found')
        }

    })
});
router.get('/mainView', function (req, res) {
    var Query = `select * from user_products where status='active' or status='closed' `;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Product')
        }

    })
});

router.get('/WinnerView', function (req, res) {
    let Query = `select * from winners inner join user_products on user_products.p_id=winners.winner_pid`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Winners')
        }

    })
});


router.get('/Bidder', function (req, res) {
    let p_id = req.query.pid;
    let Query = `select * from bid inner join user_products on user_products.p_id = bid.p_id where bid.p_id="${p_id}"`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Product Found')
        }
    })
});

router.get('/BidLeader', function (req, res) {
    let p_id = req.query.pid;
    let Query = `select  MAX(amount) as maxAmount ,u_email from bid where bid.p_id=${p_id}`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send('No Product Found')
        }

    })
});

router.get('/getEndDate', function (req, res) {
    // console.log(req.query);
    let p_id = req.query.pid;
    let Query = `select end_date from user_products where p_id=${p_id}`;
    // console.log(Query);
    conn.query(Query, function (err, rows) {
        if (err) throw err;

        if (rows.length > 0) {
            console.log(rows);
            res.send(rows);
        } else {
            res.send('No Date Found')
        }
    })
});

router.post('/insertBid', (req, res) => {
    let amount = req.body.amount;
    let p_id = req.body.p_id;
    let u_email = req.body.u_email;
    let curr_date = req.body.curr_date;
    let price = req.body.price;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;

    let c_date = new Date();
    let day = c_date.getDate();
    let mon = c_date.getMonth() + 1;
    let year = c_date.getFullYear();
    let today_date = mon + "/" + day + "/" + year;

    if (amount > 0) {
        let CheckPrice = `select price,end_date from user_products where p_id="${p_id}"`;
        conn.query(CheckPrice, function (err, rows) {
            if (err) {
               return res.send("Error");
            } else {
                if (amount < rows[0].price) {
                    return res.send("lowAmount");
                }

                let currentDate = new Date(`${today_date}`);
                currentDate = currentDate.getTime();

                let endDate = new Date(`${rows[0].end_date}`);
                endDate = endDate.getTime();
                let diff = currentDate - endDate;

                if (diff >= 0) {
                    let Update = `update user_products set status="closed" where p_id = ${p_id}`;
                    conn.query(Update, function (err) {
                        if (err) {
                            return res.send("Error");
                        }
                        return res.send("BidClosed");
                    });

                }
                let InsertBid = "insert into bid (p_id,u_email,amount) values ('" + p_id + "','" + session.username + "','" + amount + "')";
                console.log(InsertBid);
                conn.query(InsertBid, function (err) {
                    if (err) {
                        return res.send("Error");
                    }
                    res.send("BidInserted");
                });
            }
        });
    }
})



//user profile portal

router.get('/profile', (req, res) => {
    if (session.username !== undefined)
        res.render('userprofile');
    else
        res.redirect('/user_login')

});

router.get('/profileview', function (req, res) {
    var Query = "select * from usersignup where email = '" + session.username + "'";
    // console.log(Query);
    conn.query(Query, function (err, row) {
        if (err) throw err;
        if (row.length > 0) {
            // console.log(rows);
            res.send(row);
        } else {
            res.send('No data Found')
        }

    })
});

router.post("/updateProfile", (req, res) => {
    // console.log(req.body);
    let fullname = req.body.fullname;
    let fathername = req.body.fathername;
    let phone_no = req.body.phone_no;
    let password = req.body.password;


    var Query = `update usersignup set  fullname="${fullname}",fathername="${fathername}",password="${password}",phone_no="${phone_no}" where email = '${session.username}'`;
    // console.log(Query);
    conn.query(Query, (error) => {
        if (error) throw error;
        res.send("Data Updated.");
    })
});






module.exports = router;

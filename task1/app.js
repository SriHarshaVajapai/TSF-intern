let express = require("express");
let app = express();
let mysql = require("mysql");
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
const { type } = require("os");

//database connection
let db = mysql.createPool({
    host:"b7uhd3fgm2dnrhulecce-mysql.services.clever-cloud.com",
    user:"unbw07pfhheeozkq",
    password:"Ec6YuHoJY98NZvivKwQp",
    database:"b7uhd3fgm2dnrhulecce"
});

db.getConnection(function(err){
    if(err) console.log(err);
    console.log("Mysql connected!!");
})


db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        var db = mysql.createPool({
            host:"b2igf1z9myrel0jdktho-mysql.services.clever-cloud.com",
            user:"un1futwnvfk7qtpw",
            password:"mik0E17fJ1diko6pgVWm",
            database:"b2igf1z9myrel0jdktho"
        })
        
        db.getconnection(function(error){
            if(error) console.log(error)
            console.log("Mysql connected..");
        });                        // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
});

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get("/",function(req,res){
    res.render("index");
});

app.get("/customerdetails",function(req,res){
    let sql = "SELECT * FROM customers;"
    db.query(sql,function(err,entries){
        if(err) throw err;
        else{
            res.render("customerdetails",{entries:entries});
        }
    }); 
});

//Show individual details

app.get("/customerdetails/:id",function(req,res){
    let sql = "SELECT * FROM customers WHERE id='"+req.params.id+"'";
    db.query(sql,(err,foundCustomer)=>{
        if(err){
            throw err;
        }
        else {
           res.render("show",{detail:foundCustomer});
        }
    });
});

//EDIT ROUTE
app.get("/customerdetails/:id/transfer",function(req,res){
    let select_all = "SELECT * FROM customers;"
    let sql = "SELECT * FROM customers WHERE id='"+req.params.id+"'";
    db.query(sql,(err,foundCustomer)=>{
        if(err) throw err;
        else{
            db.query(select_all,(err,all)=>{
                if(err) throw err;
                else{
                    res.render("transaction",{detail:foundCustomer,all:all});
                }
            })
        }
    });
});

//UPDATE ROUTE
app.put("/customerdetails/:id",(req,res)=>{
    let pay_to = req.body.pay_to;
    let amount = Number(req.body.amount);
    let get_pay_from = "SELECT * FROM customers WHERE id='"+req.params.id+"'";
    db.query(get_pay_from,(err,pay_from)=>{
        if(err) throw err;
        else{
            let current_balance = pay_from[0].current_balance;
            if(current_balance < amount){
                res.redirect("/customerdetails/"+req.params.id+"/transfer");
            }
            else{
                current_balance = current_balance - amount;
                let update_payfrom = "UPDATE customers SET current_balance="+current_balance+" WHERE id="+req.params.id+";";
                db.query(update_payfrom,(err)=>{
                    if(err) throw err;
                    else{
                        let get_pay_to = "SELECT * FROM customers WHERE name='"+pay_to+"'";
                        db.query(get_pay_to,(err,temp)=>{
                            if(err) throw err;
                            else{
                                let pay_to_balance = temp[0].current_balance;
                                pay_to_balance = pay_to_balance + amount;

                                let update_payto = "UPDATE customers SET current_balance="+pay_to_balance+" WHERE name='"+pay_to+"';";
                                db.query(update_payto,(err)=>{
                                    if(err) throw err;
                                    else{
                                        let add_transaction = "INSERT INTO all_transactions (pay_form,pay_to,amount) VALUES('"+pay_from[0].name+"','"+pay_to+"','"+amount+"');";
                                        db.query(add_transaction,(err)=>{
                                            if(err) throw err;
                                            else{
                                                res.redirect("/customerdetails");
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                });
            }
        }
    })
});

//transaction history route
app.get("/transactionHistory",function(req,res){
    let get_transactions = "SELECT * FROM all_transactions"
    db.query(get_transactions,(err,all_transactions)=>{
        if(err) throw err;
        else{
            res.render("transactionHistory",{all_transactions:all_transactions});
        }
    })
});

app.listen(process.env.PORT || 3000)
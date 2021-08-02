let express = require("express");
let app = express();


app.get("/",function(req,res){
    res.send("Hello");
});

app.get("/harsha",function(req,res){
    res.send("This is harsha!!hehe");
})

app.listen(3000,function(){
    console.log("Server Connected!!");
})
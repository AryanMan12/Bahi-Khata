const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))

const db = mysql.createPool({
    host: "localhost",
    user: "user1",
    password: "aryan1212",
    database: "khata_app"
});

const onDateChange = (date, num) =>{
    let dd = parseInt(String(date).slice(8, 10))+num;
    let mm = parseInt(String(date).slice(5, 7));
    let yy = parseInt(String(date).slice(0,4));
    let new_date = "";
    if(dd === 0){
        mm = String((mm-2)%12).padStart(2, '0');
        console.log()
        if (["00","02","04","06","07","09","11"].includes(mm)){
            dd = 31;
        }else if (["03","05","08","10"].includes(mm)){
            dd = 30;
        }else if (mm === "01"){
            if (parseInt(String(date).slice(0,4))%4 === 0){
                dd = 29;
            }else{
                dd = 28;
            }
        }else if (mm === "11"){
            yy = yy-1;
        }
        mm = parseInt(mm)+1;
        new_date = `${yy}-${mm}-`+String(dd).padStart(2, '0');
    }
    else{
        new_date = String(date).slice(0, 8)+String(dd).padStart(2, '0');
    }
    return new_date;
    
}

app.post("/api/setDaily/", (req, res) =>{
    console.log("api/setDaily/"+req.body.date+" called!");
    const ssql = "select total_bal from daily_exp where date=?";
    let new_date = onDateChange(req.body.date, -1);
    let tot_bal = 0;
    db.query(ssql, [new_date], (err, result) =>{
        if (err) {
            console.log(err);
        }else {
            // console.log(result);
            if (result.length > 0){
                tot_bal = result[0].total_bal;
            }else{
                tot_bal = 0;
            }
        }
        const sql = "insert into daily_exp (date, items_list, items_prices, total_remaining, total_exp, grand_total, bal_item_list, bal_price_list, balance, bal_left, total_bal) values (?,?,?,?,?,?,?,?,?,?,?)";
        db.query(sql, [req.body.date, '[]', '[]', 0, 0, 0, '[]', '[]', tot_bal, tot_bal, tot_bal], (err, result) => {
            if (err) console.log(err);
            // else console.log(result);
            console.log("api/setDaily/"+req.body.date+" finished!");

        });
    });
    
});

app.put("/api/updateItem/", (req, res) =>{
    const sql = "update daily_exp set items_list=JSON_ARRAY(?), items_prices=JSON_ARRAY(?), total_remaining=?, total_exp=?, grand_total=? where date=?";
    const items = req.body.items;
    const costs = req.body.costs;
    db.query(sql, [items, costs, parseInt(req.body.remaining), req.body.exp, req.body.grandTotal, req.body.date], (err, result) => {
        if (err) console.log(err);
        // else console.log(result);
    });
});

app.put("/api/updateBalItem/", (req, res) =>{
    const sql = "update daily_exp set bal_item_list=JSON_ARRAY(?), bal_price_list=JSON_ARRAY(?), bal_left=?, total_bal=? where date=?";
    const items = req.body.items;
    const costs = req.body.costs;
    db.query(sql, [items, costs, req.body.bal_left, req.body.bal_total, req.body.date], (err, result) => {
        if (err) console.log(err);
        // else console.log(result);
    });
});

app.put("/api/updateSingleItem/", (req, res) =>{
    const sql = "update daily_exp set items_list=JSON_ARRAY(?), items_prices=JSON_ARRAY(?), total_exp=?, grand_total=? where date=?";
    const items = req.body.items;
    const costs = req.body.costs;
    db.query(sql, [items, costs, req.body.exp, req.body.grandTotal, req.body.date], (err, result) => {
        if (err) console.log(err);
        // else console.log(result);
    });
});

app.put("/api/updateSingleBalItem/", (req, res) =>{
    const sql = "update daily_exp set bal_item_list=JSON_ARRAY(?), bal_price_list=JSON_ARRAY(?), bal_left=?, total_bal=? where date=?";
    const items = req.body.items;
    const costs = req.body.costs;
    db.query(sql, [items, costs, req.body.bal_left, req.body.bal_total, req.body.date], (err, result) => {
        if (err) console.log(err);
        // else console.log(result);
    });
});

app.get("/api/daily/:date", (req, res) =>{
    console.log("api/daily/"+req.params.date+" called!");
    const date = req.params.date;
    const sql = "select * from daily_exp where date=?";
    db.query(sql, [date], (err, result) => {
        if (err) console.log(err);
        else res.send(result);

        console.log("api/daily/"+req.params.date+" finished!")
    });
});


app.listen(3001, () => {
    console.log("running on port 3001");
});
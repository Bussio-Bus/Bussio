const express = require('express');
var cors = require('cors')
const path = require('path');
const cheerio = require('cheerio')
const fs = require('fs');
const app = express()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.options('*', cors())
app.use(cors())

//Middleware which parses Requestbody as JSON
app.use(express.json());
const PORT = 8080;

//starting server and adding a callback function to notify when it has started
app.listen(PORT, () => console.log(`[SERVER]: running on localhost: ${PORT}`));


app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/index.html'));
});


//Adds a test GET request
app.get("/test", function (req, res) {

    //returns a status of 200(OK) and a message
    res.status(200).send({
        msg: "fogg",
        time: new Date().toTimeString()
    })

});


//Adds a test Post request with one Param
app.post("/testPOST/:msg", (req, res) =>{

    const msg = req.params.msg

    //this gets the body information in JSON, would not work without line 5
    const body = req.body;

    res.send(msg + " date you send: " + body.date);

});

//TODO: add check to verify that parameters are set or add default values
//TODO: maybe add additional parameters like outputformat
app.get("/GET_BUS_INFO/:name/:dd/:mm/:hh/", async (req, res) =>{
    const name = req.params.name;
    const day = req.params.dd;
    const month = req.params.mm;
    const hour = req.params.hh;

    console.log("[SERVER]: incoming GET_BUS_INFO request")
    let json = null;
    await fetch('https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%Dantestraße&mode=direct&outputFormat=json&itdDateDayMonthYear=29-01-2022')
        .then(response => response.json()) //the fetch returns the entire HTTP response so inorder to extract it the .json() Method has to be used which returns another promise
        .then(data => json=data); //data is the actual information we need in json
    if(json){
        console.log("[SERVER]: sending info")
        res.status(200).send(json);
    }else{
        console.log("[SERVER]: unable to get info")
        res.status(400).send("unable to get info");
    }

});

async function generate_table(){
    let html = fs.readFileSync(path.join(__dirname, '/index.html')).toString();
    cheerio.load(html);

}
generate_table();
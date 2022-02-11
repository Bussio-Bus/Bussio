const express = require('express');
var cors = require('cors')
const path = require('path');
const fs = require('fs');
const app = express()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const regions = ["bozen", "burggrafenamt", "vinschgau", "eisacktal", "wipptal", "pustertal", "ladinien"];

app.options('*', cors())
app.use(cors())

//Middleware which parses Requestbody as JSON
app.use(express.json());
//const PORT = process.env.PORT || 8085;
const PORT = 8085;
const IP = "10.10.30.15"

//starting server and adding a callback function to notify when it has started
app.listen(PORT, IP, () => console.log(`[SERVER]: running on ${IP}: ${PORT}`));


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
app.get("/GET_BUS_INFO/:name/:dd?/:mm?/:hh?/:min?/", async (req, res) =>{
    const name = req.params.name.split("_");
    const day = req.params.dd === undefined ? new Date().getDate() : req.params.dd;
    const month = req.params.mm === undefined ? new Date().getMonth() : req.params.mm;
    const hour = req.params.hh === undefined ? new Date().getHours() : req.params.hh;
    const minute = req.params.min === undefined ? new Date().getMinutes() : req.params.min;



    let fetch_string="https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&mode=direct&outputFormat=json&name_dm=";
    name.forEach(value => {fetch_string += value + "%20"});
    fetch_string.substring(0, fetch_string.length - 1);
    fetch_string+="&itdDateDayMonthYear="+day+"-"+(parseInt(month) > 9 ? month.toString()  : "0" + month.toString()) +"-" +new Date().getFullYear()
    fetch_string+="&itdTime="+hour+""+ (parseInt(minute) > 9 ? minute.toString()  : "0" + minute.toString())

    let name_str = name.join(" ");

    console.log("[SERVER]: incoming GET_BUS_INFO request")
    console.log("[SERVER]: request-> " + fetch_string);
    let json = null;
    try{
        let response = await fetch(fetch_string);
        json = await response.json();

        if(json.servingLines.lines != null){
            if(!checkDuplicateStops(name_str)) {
                addStop(name_str)
                console.log("[SERVER]: Added new stop, " + name_str)
            }
        }
        else{
            console.log("[SERVER]: serving lines is null")
            res.status(401).send("unable to get info");
            return;
        }
    }
    catch(e){
        console.log("[SERVER]: Failed to fetch, reason: \n" + e)
    }
    if(json){
        console.log("[SERVER]: sending info")
        res.status(200).send(json);
    }else{
        console.log("[SERVER]: unable to get info")
        res.status(400).send("unable to get info");
    }

});
app.get("/GET_WEATHER_INFO/:name?/", async (req, res)=>{
    console.log("[SERVER]: incoming GET_WEATHER_INFO request")
    //let fetch_string = "http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json";
    let fetch_string = "http://daten.buergernetz.bz.it/services/weather/bulletin?format=json&lang=de"
    console.log("[SERVER]: request-> " + fetch_string);
    let name = req.params.name;
    let json;
    try{
        let response = await fetch(fetch_string);
        json = await response.json();
        if(name){
            name = name.toLowerCase();
            if(regions.indexOf(name) != -1){
                let ret_json=[];
                if(json.today != null){
                    ret_json.push(json.today.stationData[regions.indexOf(name)])
                }
                else
                    ret_json.push(null)

                if(json.tomorrow != null){
                    ret_json.push(json.tomorrow.stationData[regions.indexOf(name)])
                }
                else
                    ret_json.push(null)

                console.log(ret_json);
                res.status(200).send(ret_json)
                console.log("[SERVER]: Sending info for: " + name)
            }else{
                res.status(400).send("Unkown region: " + name + ".\n Available regions: " + regions.toString())
                console.log("[SERVER]: Unkown region, sending error")
            }
        }else{
            console.log("[SERVER]: Sending info")
            res.status(200).send(json)
        }
    }
    catch (e){
        console.log("[SERVER]: Failed to fetch, reason: \n" + e.stack)
        console.log("[SERVER]: unable to get info")
        res.status(400).send("unable to get info");
    }
});

app.get("/GET_STOPS/", (req, res)=>{

    console.log("[SERVER]: incoming GET_STOPS request");
    let ret_json = {
        "stops":[

        ]
    };
    try {
        const data = fs.readFileSync('./res/stops', 'utf8')
        console.log(data)
        data.split(',').forEach(value => ret_json.stops.push({"name":value.toString()}))
    } catch (err) {
        console.error("[SERVER]: could not read from file, reason:" + err)
        res.status(400).send("could not get stops")
    }

    console.log(ret_json);
    console.log("[SERVER]: sending info")
    res.status(200).send(ret_json)


});

function addStop(stop){
    stop = stop.replaceAll("_", " ");
    stop = stop.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    let stream = fs.createWriteStream("./res/stops", {flags:'a'})
    stream.write(","+stop);
    return true
}

app.post("/ADD_STOP/:stop", async (req, res) =>{
    const stop = req.params.stop.toLowerCase()
    console.log("[SERVER]: incoming ADD_STOP request");
    if(checkDuplicateStops(stop)){
        res.status(400).send("cannot add, stop exists")
        return
    }

    let fetch_string="https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&mode=direct&outputFormat=json&name_dm=";
    stop.split("_").forEach(value => {fetch_string += value + "%20"});
    fetch_string.substring(0, fetch_string.length - 1);
    try{
        let response = await fetch(fetch_string);
        json = await response.json();
        if(json.servingLines.lines != null){
            if(addStop(stop)){
                console.log("[SERVER]: Added stop, " +stop)
                res.status(200).send("Added stop, thank you :)")
            }
        }
        else{
            console.log("[SERVER]: could not add stop: " + stop);
            res.status(400).send("cannot add, servingLines null")
        }
    }
    catch(e){
        console.log("[SERVER]: an error has occured: \n" + e.stack)
        res.status(400).send("failed");
    }
});

function checkDuplicateStops(stop){
    stop = stop.replaceAll("_", " ");
    const data = fs.readFileSync('./res/stops', 'utf8')
    console.log(data);
    if(data.toLowerCase().split(",").includes(stop.toLowerCase()))
        return true
    else
        return false
}

const express = require('express');
const app = express()

//Middleware which parses Requestbody as JSON
app.use(express.json());

const PORT = 8080;

//starting server and adding a callback function to notify when it has started
app.listen(PORT, () => console.log(`[SERVER ALIVE ON]: localhost: ${PORT}`));

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

function feedtable(json){
    for (const linesKey in json.servingLines.lines) {
        console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
    }
    console.log("-------------------------------------------");
}


import fetch from "node-fetch"


async function fetch_bus_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    const response = await fetch('http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE/29/01/13')
        .then(response => response.json()) //the fetch returns the entire HTTP response so inorder to extract it the .json() Method has to be used which returns another promise
        .then(data => json = data); //data is the actual information we need in json

    print_info(json)
    feedtable(json)
    setTimeout(fetch_bus_info, 2000)
}

function print_info(json){
    for (const linesKey in json.servingLines.lines) {
        console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
    }
    console.log("-------------------------------------------");
}

fetch_bus_info();



console.log("test");


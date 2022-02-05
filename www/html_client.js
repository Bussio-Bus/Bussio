let serverRequestURL=""

function suche_haltestelle() {
    let input = document.getElementById('searchbar').value
    input=input.toLowerCase();
    let x = document.getElementsByClassName('haltestelle');

    for (i = 0; i < x.length; i++) {
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display="none";
        }
        else {
            x[i].style.display="list-item";
        }
    }
}

async function fetch_bus_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    const response = await fetch(serverRequestURL)
        .then(response => response.json()) //the fetch returns the entire HTTP response so inorder to extract it the .json() Method has to be used which returns another promise
        .then(data => json = data); //data is the actual information we need in json


    //console.log(json);
    //print_info(json)
    feedtable(json);
    //setTimeout(fetch_bus_info, 2000)
}

function print_info(json){
    for (const linesKey in json.servingLines.lines) {
        console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
    }
    console.log("-------------------------------------------");
}


let bus_table_current_row=0;
function feedtable_line(json, line=0){
    let table = document.getElementById("bus-table").getElementsByTagName("tbody")[0];
    var row = table.insertRow(bus_table_current_row++);


    for(let column=0; column<5; column++){
        var cell = row.insertCell(column);
        var newText = document.createTextNode(getInformation(column, json.servingLines.lines[line], json.departureList[line]));
        cell.appendChild(newText)
    }
}

function feedtable(json){
    for(line=0; line<5; line++){
        feedtable_line(json, line)
    }
}

function getInformation(index, json, json_Dep){
    let string="No Info"
    if(json == undefined){
        return string;
    }
    console.log(json_Dep);
    switch (index){
        case 0: string = bus_table_current_row; break;
        case 1: string = json.mode.number; break;
        case 2: string = json.mode.destination; break;
        case 3: string = json_Dep.countdown; break;
        case 4: string = json.mode.destination;
    }

    return string;
}


function reload_table(){
    let table = document.getElementById("bus-table").getElementsByTagName("tbody")[0];

    while(bus_table_current_row>0){
        table.deleteRow((bus_table_current_row--)-1)
    }

    fetch_bus_info();
}

//feedtable_line();
function updatetime(){
    let element = document.getElementById("Jetzige-Zeit-id");
    let today = new Date();
    let time = today.getHours() + ":" + ((parseInt(today.getMinutes()) > 10) ? today.getMinutes() : "0"+today.getMinutes()) + ":" + ((parseInt(today.getSeconds()) > 9) ? today.getSeconds() : "0"+today.getSeconds());



    element.innerHTML = time;
    setTimeout(updatetime, 1000);
}

function writeNameAndRequestURL(){
    //const urlSearchParams = new URLSearchParams(window.location.search);
    //const params = Object.fromEntries(urlSearchParams.entries());
    const params = new URLSearchParams(window.location.search)
    let halte_id = document.getElementById("Bushaltestelle-id")

    if(params.has('haltestelle')){
        let val = params.get('haltestelle');
        halte_id.innerHTML = val.replace("_"," ");

        serverRequestURL = "http://localhost:8080/GET_BUS_INFO/" + val;
        console.log("Server Request URL = " + serverRequestURL)
        //http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE

    }else{
        window.location.href = 'index.html';
    }
}

function setup(){
    updatetime();
    writeNameAndRequestURL();
    fetch_bus_info();
}

console.log("test");

setup()
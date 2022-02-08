let serverRequestURL_bus=""
let serverRequestURL_weather="http://localhost:8080/GET_WEATHER_INFO/Eisacktal"


//TODO: verspätung entfernen und wos onderes adden vlt
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

function displayError(){
    document.getElementById("error_msg_div_id").classList.remove("error_msg_div_class_none")
    document.getElementById("error_msg_div_id").classList.add("error_msg_div_class_show")
}

function hideError(){
    document.getElementById("error_msg_div_id").classList.remove("error_msg_div_class_show")
    document.getElementById("error_msg_div_id").classList.add("error_msg_div_class_none")
}

async function fetch_bus_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    try{
        let response = await fetch(serverRequestURL_bus);
        json = await response.json();
    }
    catch(e){
        console.log("Error")
        displayError();
    }


    //console.log(json);
    //print_info(json)
    if(json) feedtable(json);

    setTimeout(reload_table, 60000)
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

    //console.log(json);

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
    //console.log(json_Dep);
    switch (index){
        case 0: string = bus_table_current_row; break;
        case 1: string = json.mode.number; break;
        case 2: string = json.mode.destination; break;
        case 3: string = json_Dep.dateTime.hour + ":" + (json_Dep.dateTime.minute > 9 ? json_Dep.dateTime.minute : "0" + json_Dep.dateTime.minute); break;
        case 4: string = json_Dep.countdown;
    }

    return string;
}


async function reload_table() {
    hideError();
    document.getElementById("reload_id").classList.toggle('button--loading')
    let table = document.getElementById("bus-table").getElementsByTagName("tbody")[0];
    bus_table_current_row=0;

    await fetch_bus_info();

    while (bus_table_current_row+5 > 5) {
        table.deleteRow((bus_table_current_row--) - 1+5)
    }


    document.getElementById("reload_id").classList.toggle('button--loading')
}

//feedtable_line();
function updatetime(){
    let element = document.getElementById("Jetzige-Zeit-id");
    let today = new Date();
    let time = ((parseInt(today.getHours()) > 9) ? today.getHours() : "0"+today.getHours()) + ":" + ((parseInt(today.getMinutes()) > 9) ? today.getMinutes() : "0"+today.getMinutes()) + ":" + ((parseInt(today.getSeconds()) > 9) ? today.getSeconds() : "0"+today.getSeconds());



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

        serverRequestURL_bus = "http://localhost:8080/GET_BUS_INFO/" + val;
        console.log("Server Request URL = " + serverRequestURL_bus)
        //http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE

    }else{
        window.location.href = 'index.html';
    }
}

function setup(){
    updatetime();
    writeNameAndRequestURL();
    fetch_bus_info();
    fetch_weather_info();
}
async function fetch_weather_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    try{
        let response = await fetch(serverRequestURL_weather);
        json = await response.json();
    }
    catch(e){
        console.log("Error")
        displayError();
    }

    if(json)
        write_weather(json);
    else
        setTimeout(fetch_bus_info, 5000)
}

function write_weather(json){
    console.log(json)

    document.getElementById("weather_min_heute").innerHTML = "Max: " + json[0].min + "°C"
    document.getElementById("weather_max_heute").innerHTML = "Min: " + json[0].max + "°C"
    document.getElementById("weather_status_heute").innerHTML = "Status: " + json[0].symbol.description
    document.getElementById("weather_icon_heute").src = json[0].symbol.imageUrl


    document.getElementById("weather_min_morgen").innerHTML = "Max: " + json[1].min + "°C"
    document.getElementById("weather_max_morgen").innerHTML = "Min: " + json[1].max + "°C"
    document.getElementById("weather_status_morgen").innerHTML = "Status: " + json[1].symbol.description
    document.getElementById("weather_icon_morgen").src = json[1].symbol.imageUrl
}


console.log("test");

setup()
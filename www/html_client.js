//let serverRequestURL_bus=""         //URL for the server for bus
//let serverRequestURL_weather="http://localhost:8080/GET_WEATHER_INFO/Eisacktal" //URL for the server for weather
let serverRequestURL_bus=""         //URL for the server for bus
let serverRequestURL_weather="http://10.10.30.15:8085/GET_WEATHER_INFO/Eisacktal" //URL for the server for weather


//function um einen Fehler auf der Seite anzuzeigen
function displayError(message="Es ist ein Fehler aufgetreten - Bitte versuche es erneut"){
    document.getElementById("error_msg_div_id").classList.remove("error_msg_div_class_none")
    document.getElementById("error_msg_div_id").classList.add("error_msg_div_class_show")
    document.getElementById("error_msg_div_id").innerHTML = message
}

//Um den Fehler wieder zu verstecken
function hideError(){
    document.getElementById("error_msg_div_id").classList.remove("error_msg_div_class_show")
    document.getElementById("error_msg_div_id").classList.add("error_msg_div_class_none")
}


//Funktion um von unserem Webserver die Daten abzufragen
async function fetch_bus_info(){
    let json = null;
    let response = "";
    //Gets information from URL and returns Promise which has to be resolved using then
    try{
        response = await fetch(serverRequestURL_bus);
        json = await response.json();
    }
    catch(e){
        console.log("Error")
        displayError();
    }

    if(response.status === 401){
        //console.log("Haltestelle nicht gefunden!")
        displayError("Haltestelle nicht gefunden - Bitte versuche eine andere Haltestelle");
        return;
    }
    if(json) feedtable(json);

    setTimeout(reload_table, 60000)
}



//Funktion um den table zu "füttern mit informationen" es wird hier nur eine line hinzugefügt
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

//Funktion um den Table mit 5 lines aufzufüllen
function feedtable(json){
    for(line=0; line<5; line++){
        feedtable_line(json, line)
    }
}

//Funktion um vom übergebenen json die Infos für den Table zu kriegen
function getInformation(index, json, json_Dep){
    let string="No Info"
    if(json == undefined){
        return string;
    }
    //console.log(json_Dep);
    switch (index){
        case 0: string = bus_table_current_row; break;
        case 1: string = json_Dep.servingLine.number; break;
        case 2: string = json_Dep.servingLine.direction; break;
        case 3: string = json_Dep.dateTime.hour + ":" + (json_Dep.dateTime.minute > 9 ? json_Dep.dateTime.minute : "0" + json_Dep.dateTime.minute); break;
        case 4: string = json_Dep.countdown;
    }

    return string;
}

//Funktion um den table zu reloaden. Wenn der User z.B. auf den Button drückt
async function reload_table() {
    hideError();
    document.getElementById("reload_id").classList.toggle('button--loading')
    let table = document.getElementById("bus-table").getElementsByTagName("tbody")[0];
    bus_table_current_row=0;

    await fetch_bus_info();

    console.log(table.rows);

    //while (bus_table_current_row+5 > 5) {
    //    table.deleteRow((bus_table_current_row--) - 1+5)
    //}

    while(table.rows.length > 5){   //Schaut nach ob durch irgendeinen fehler mehr rows sind. Dann löscht er diesen
        bus_table_current_row--
        table.deleteRow(table.rows.length-1)
    }


    document.getElementById("reload_id").classList.toggle('button--loading')
}

//Funktion um die Zeit pro Sekunde zu updaten
function updatetime(){
    let element = document.getElementById("Jetzige-Zeit-id");
    let today = new Date();
    let time = ((parseInt(today.getHours()) > 9) ? today.getHours() : "0"+today.getHours()) + ":" + ((parseInt(today.getMinutes()) > 9) ? today.getMinutes() : "0"+today.getMinutes()) + ":" + ((parseInt(today.getSeconds()) > 9) ? today.getSeconds() : "0"+today.getSeconds());



    element.innerHTML = time;
    setTimeout(updatetime, 1000);
}

//Funktion um den Namen der Haltestelle zu schreiben und auch die Request URL für den Bus aufzubauen
function writeNameAndRequestURL(){
    //const urlSearchParams = new URLSearchParams(window.location.search);
    //const params = Object.fromEntries(urlSearchParams.entries());
    const params = new URLSearchParams(window.location.search)
    let halte_id = document.getElementById("Bushaltestelle-id")

    if(params.has('haltestelle')){
        let val = params.get('haltestelle');
        halte_id.innerHTML = val.replace("_"," ");

        //serverRequestURL_bus = "http://localhost:8080/GET_BUS_INFO/" + val;
        serverRequestURL_bus = "http://10.10.30.15:8085/GET_BUS_INFO/" + val;
        console.log("Server Request URL = " + serverRequestURL_bus)
        //http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE

    }else{
        window.location.href = 'index.html';
    }
}

//Setup funktion die beim start der Seite aufgerufen wird
function setup(){
    updatetime();
    writeNameAndRequestURL();
    fetch_bus_info();
    fetch_weather_info();
}

//Funktion um die Wetter info zu verarbeiten und anzufragen
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

//Funktion um das Wettter in das HTML zu schreiben
function write_weather(json){
    console.log(json)

    if(json[0] != null){
        document.getElementById("weather_max_heute").innerHTML = "Max: " + json[0].max + "°C"
        document.getElementById("weather_min_heute").innerHTML = "Min: " + json[0].min + "°C"
        document.getElementById("weather_status_heute").innerHTML = "Status: " + json[0].symbol.description
        document.getElementById("weather_icon_heute").src = json[0].symbol.imageUrl
    }else{
        document.getElementById("weather_max_heute").innerHTML = "Max: " + "No Info"
        document.getElementById("weather_min_heute").innerHTML = "Min: " +"No Info"
        document.getElementById("weather_status_heute").innerHTML = "Status: " +"No Info"
    }


    if(json[1] != null){
        document.getElementById("weather_max_morgen").innerHTML = "Max: " + json[1].max + "°C"
        document.getElementById("weather_min_morgen").innerHTML = "Min: " + json[1].min + "°C"
        document.getElementById("weather_status_morgen").innerHTML = "Status: " + json[1].symbol.description
        document.getElementById("weather_icon_morgen").src = json[1].symbol.imageUrl
    }else{
        document.getElementById("weather_max_morgen").innerHTML = "Max: " + "No Info"
        document.getElementById("weather_min_morgen").innerHTML = "Min: " + "No Info"
        document.getElementById("weather_status_morgen").innerHTML = "Status: " + "No Info"
    }

}

//Funktion wenn der User auf den Zurück Knopf drückt
function return_to_index() {
    window.location.href = 'index.html';
}

setup()
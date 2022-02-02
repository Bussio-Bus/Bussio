

async function fetch_bus_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    const response = await fetch('http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE/29/01/13')
        .then(response => response.json()) //the fetch returns the entire HTTP response so inorder to extract it the .json() Method has to be used which returns another promise
        .then(data => json = data); //data is the actual information we need in json


    console.log(json);
    //print_info(json)
    //feedtable_line(json)
    //setTimeout(fetch_bus_info, 2000)
}

function print_info(json){
    for (const linesKey in json.servingLines.lines) {
        console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
    }
    console.log("-------------------------------------------");
}


let bus_table_current_row=4;
function feedtable_line(json){
    let table = document.getElementById("bus-table");
    var row = table.insertRow(bus_table_current_row++);

    for(let column=0; column<5; column++){
        var cell = row.insertCell(column);
        var newText = document.createTextNode(getInformation(column, json));
        cell.appendChild(newText)
    }
}

function feedtable(json){
    for (const linesKey in json.servingLines.lines) {
        //console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
        feedtable_line(servingLines.lines[linesKey]);
    }
    console.log("-------------------------------------------");
}

function getInformation(index, json){
    let string="No Info"

    switch (index){
        case 0: string = index;
        case 1: string = mode.name;
        case 2: string = mode.destination;
        case 3: string = mode.destination;
        case 4: string = mode.destination;
    }


    return string;
}



feedtable_line();



console.log("test");


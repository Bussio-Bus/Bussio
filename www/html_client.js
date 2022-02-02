

async function fetch_bus_info(){
    let json = null;

    //Gets information from URL and returns Promise which has to be resolved using then
    const response = await fetch('http://localhost:8080/GET_BUS_INFO/BRIXEN_DANTESTRAßE')
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
        var newText = document.createTextNode(getInformation(column, json.servingLines.lines[line]));
        cell.appendChild(newText)
    }
}

function feedtable(json){
    for(line=0; line<5; line++){
        feedtable_line(json, line)
    }
}

function getInformation(index, json){
    let string="No Info"
    if(json == undefined){
        return string;
    }

    switch (index){
        case 0: string = bus_table_current_row; break;
        case 1: string = json.mode.number; break;
        case 2: string = json.mode.destination; break;
        case 3: string = json.mode.number; break;
        case 4: string = json.mode.destination;
    }

    return string;
}



//feedtable_line();

function setup(){
    let element = document.getElementById("Jetzige-Zeit-id");
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();

    element.innerHTML = time;
}

console.log("test");

setup()
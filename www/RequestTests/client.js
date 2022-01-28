import fetch from "node-fetch"


//Gets information from URL and returns Promise which has to be resolved using then
let json = null;
await fetch('https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%Dantestraße&mode=direct&outputFormat=json&itdDateDayMonthYear=29-01-2022')
    .then(response => response.json()) //the fetch returns the entire HTTP response so inorder to extract it the .json() Method has to be used which returns another promise
    .then(data => json = data); //data is the actual information we need in json

console.log(json.servingLines.lines)

for (const linesKey in json.servingLines.lines) {
    console.log(json.servingLines.lines[linesKey].mode.destination + " " + json.servingLines.lines[linesKey].mode.name)
}


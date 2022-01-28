import fetch from "node-fetch"


//Gets information from URL and returns Promise which has to be resolved using then
fetch('https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%Dantestraße&mode=direct&outputFormat=json&itdDateDayMonthYear=29-01-2022')
    .then(response => response.json())
    .then(data => console.log(data));


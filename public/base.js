/*
 * The contents of this file are subject to the terms of the
 * Common Development and Distribution License, Version 1.0 only
 * (the "License").  You may not use this file except in compliance
 * with the License.
 *
 * See the file LICENSE in this distribution for details.
 * A copy of the CDDL is also available via the Internet at
 * http://www.opensource.org/licenses/cddl1.txt
 *
 * When distributing Covered Code, include this CDDL HEADER in each
 * file and include the contents of the LICENSE file from this
 * distribution.
 */

function panic(str) {
    // AAAAAAAAAAAHHHH!
    console.log("@tux0r hat einen Fehler gemacht!... " + str);
}

function handleAPIError(str) {
    // Zeigt ein Fehler-DIV bei Verbindungsproblemen mit dem API an.
    fetch("APIErrorHandler/" + str, { method: "POST" })
    .then(res => res.text())
    .then(data => {
        document.getElementById("errorDiv").innerHTML = data;
    })
    .catch(error => panic(error));
}

function fillInitSelect() {
    // Füllt die Parteitagsselectbox zu Beginn.
    let selParteitag = document.getElementById("parteitage");

    fetch("Parteitage",
        { method: "POST" })
    .then(res => res.json())
    .then(data => {
        let dummyoption = document.createElement("option");
        dummyoption.value = "dummy";
        dummyoption.innerHTML = "- bitte auswählen -";
        selParteitag.appendChild(dummyoption);
        
        document.getElementById("errorDiv").innerHTML = "";
        
        if (data["data"] !== undefined && data["data"].length > 0) {
            data["data"].forEach(parteitag => {
                /* parteitag["Key"] und parteitag["Name"] in Selectbox
                   füllen: */
                let option = document.createElement("option");
                option.value = parteitag["Key"];
                option.innerHTML = parteitag["Name"];
                selParteitag.appendChild(option);
            });
            
            selParteitag.disabled = false;
        }
        else {
		    document.getElementById("inhalt").innerHTML = "Zurzeit sind keine Anträge vorhanden.";
		}
    })
    .catch(error => handleAPIError(error));
}

function listAntraege() {
    // Füllt die Antragsselectbox.
    let selParteitag = document.getElementById("parteitage");
    let selAntrag = document.getElementById("antraege");
    
    fetch("Parteitag/" + selParteitag.value,
        { method: "POST" })
    .then(res => res.json())
    .then(data => {
        // Anträge zurücksetzen vorm Neubefüllen:
        while (selAntrag.firstChild) {
            selAntrag.removeChild(selAntrag.firstChild);
        }

        let dummyoption = document.createElement("option");
        dummyoption.value = "dummy";
        dummyoption.innerHTML = "- bitte auswählen -";
        selAntrag.appendChild(dummyoption);
        
        data.forEach(antrag => {
            /* Antrag in Selectbox füllen: */
            let option = document.createElement("option");
            option.value = antrag["id"];
            option.innerHTML = antrag["id"] /* + " - " + antrag["title"] */;
            selAntrag.appendChild(option);
        });
        
        selAntrag.disabled = false;
    })
    .catch(error => panic(error));
}

function zeigeAntrag() {
    // Ruft einen Antrag ab und zeigt ihn an.
    let selParteitag = document.getElementById("parteitage");
    let selAntrag = document.getElementById("antraege");
    let divInhalt = document.getElementById("inhalt");
    
    fetch("Parteitag/" + selParteitag.value + "/Antrag/" + selAntrag.value,
        { method: "POST" })
    .then(res => res.text())
    .then(data => {
        divInhalt.innerHTML = data;
    })
    .catch(error => panic(error));
}

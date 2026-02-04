import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";



// ---------- FIREBASE CONFIG - fill these values ----------
const firebaseConfig = {
    apiKey: "AIzaSyC0QKeV0zRj2OG_ixidIUISsIR95I7qiCU",
    authDomain: "cs13---lebanon.firebaseapp.com",
    databaseURL: "https://cs13---lebanon-default-rtdb.firebaseio.com",
    projectId: "cs13---lebanon",
    storageBucket: "cs13---lebanon.firebasestorage.app",
    messagingSenderId: "245930734900",
    appId: "1:245930734900:web:641ba43a8323d27c1ce161",
    measurementId: "G-N0S4T6JT68"
};// --------------------------------------------------------


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const matchesCol = collection(db, "matches_dev");

const SERVERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27"];

const SERVERS_NO_CHEATS = ["10"]

// Real-time listener
let bookings = [];
onSnapshot(matchesCol, (snapshot) => {
    bookings = snapshot.docs.map(doc => doc.data());
    console.log("Updated bookings:", bookings);
});

// const snapshot = await getDocs(collection(db, "matches_dev"));
// const bookings = snapshot.docs.map(doc => doc.data());


//   const server = autoAssignServer(bookings, "2025-12-09", "20:00");
//   console.log(server)
//   if (!server) {
//     alert("No servers available at this time.");    
//   }

//   alert("Assigned server:" + server);


document.getElementById("bookMatchBtn").addEventListener("click", bookMatch);
// ---------- App state ----------
let matches = []; // array of {id:key, team1, team2, time, server}
let selectedTime = null;
let selectedServer = null;
const timeButtonsContainer = document.getElementById("timeButtons");
const serverButtons = document.querySelectorAll(".server-button");

//const enabledServers = [1, 2, 3, 4, 5]; 
let enabledServers = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    Ghadab: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
    15: true,
    16: true,
    17: true,
    18: true,
    19: true,
    20: true,
    21: true,
    22: true,
    23: true
};
function renderServerTables() {
    const container = document.getElementById("serverTables");
    container.innerHTML = "";

    Object.keys(enabledServers).forEach(s => {
        const enabled = enabledServers[s];
        console.log(enabled);
        const card = document.createElement("div");
        card.className = "server-card";
        card.innerHTML = `            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <h3 style="margin:0; ${enabled ? '' : 'color:#555;'}" id="${s}">Server ${s}<span>${s == 10 ? ' - Cheats 0' : ''}</h3>
                <label class="switch">
  			<input type="checkbox"  ${enabledServers[s] ? "checked" : ""} onchange="toggleServer(${s}, this)">
			  <span class="slider round"></span>
		</label>
                
            </div>

            <div class="server-content" style="${enabled ? '' : 'pointer-events:none; opacity:0.4;'}">
                <table id="server${s}">
                    <thead>
                        <tr><th>Teams</th><th>Time</th><th>Action</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
                ${!enabled ? '<div style="color:#aaa; margin-top:5px;">Server disabled</div>' : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

window.toggleServer = function (i, checkbox) {
    const userInput = prompt("Enter Admin Password:");
    if (userInput !== password) {
        alert("Wrong password!");
        checkbox.checked = !checkbox.checked;
        return;
    }

    const serverBtn = document.getElementById("server" + i + "Btn");


    enabledServers[i] = !enabledServers[i];

    if (!enabledServers[i]) {
        serverBtn.disabled = true;
        // Change the color and style
        serverBtn.style.backgroundColor = "grey";  // background
        serverBtn.style.color = "white";           // text color
        serverBtn.style.cursor = "not-allowed";    // cursor style
    } else {
        serverBtn.disabled = false;
        serverBtn.style.backgroundColor = "#228B22";
        serverBtn.style.cursor = "pointer";
    }
    //console.log(enabledServers);
    renderServerTables();
    renderAllMatches(matches);
};

function showSpinner() {
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideSpinner() {
    document.getElementById("loadingOverlay").style.display = "none";
}

// ---------- Helpers ----------
function to12Hour(timeStr) {
    let [h, m] = timeStr.split(":").map(Number);
    let ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}
function timeToMinutes(t) { let [h, m] = t.split(":").map(Number); if (h < 8) h += 24; return h * 60 + m; }

// ---------- Generate times (hours only) ----------
function generateTimes() {
    timeButtonsContainer.innerHTML = "";
    for (let h = 18; h <= 23; h++) { addTimeButton(h); }
    for (let h = 0; h <= 3; h++) { addTimeButton(h); }
}
function addTimeButton(hour) {
    const t = `${String(hour).padStart(2, '0')}:00`;
    const btn = document.createElement("button");
    btn.className = "time-button";
    btn.textContent = to12Hour(t);
    btn.dataset.time = t;
    btn.onclick = () => { selectedTime = t; highlightSelectedTime(); };
    timeButtonsContainer.appendChild(btn);
}
function highlightSelectedTime() {
    Array.from(timeButtonsContainer.children).forEach(b => b.style.border = "1px solid #007bff");
    Array.from(timeButtonsContainer.children).forEach(b => { if (b.dataset.time === selectedTime) b.style.border = "3px solid #ffbf00"; });
}

// ---------- Server selection ----------
serverButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        selectedServer = btn.dataset.server;
        serverButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        if (matches.length > 0) {
            updateTimeButtons(matches);
        }
    });
});

const password = "havoc";
const passwordGhadab = "havoc22";
let skipConfirm = false;

window.deleteMatch = async function (server, id) {
    if (server === 'Ghadab') {
        const userInput = prompt("Enter Admin-Ghadab Password:");
        if (userInput !== passwordGhadab) {
            alert("Wrong password!");
            return;
        }

    }
    if (!skipConfirm && server !== 'Ghadab') {
        const userInput = prompt("Enter Admin Password:");
        if (userInput !== password) {
            alert("Wrong password!");
            return;
        }
    }

    //if (!confirm("Delete this match?")) return;


    try {
        const matchRef = doc(matchesCol, id);
        //await deleteDoc(matchRef);

        // Mark as deleted instead of removing permanently
        await updateDoc(matchRef, { deleted: true });
        console.log("Deleted match:", id);
    } catch (err) {
        console.error(err);
    }
};

// Reset Matches
window.resetAllMatches = async function () {

    if (!confirm("Are you sure you want to delete ALL matches?")) return;

    const pwd = prompt("Enter password");
    if (pwd !== password) return;

    skipConfirm = true;

    const buttons = document.querySelectorAll('.delete');

    buttons.forEach(btn => {
        btn.click();      // triggers your existing deleteMatch() logic
    });

    skipConfirm = false;
    // Finally clear the table visually
    //document.querySelector('#myTable tbody').innerHTML = "";    
}


// ---------- Firebase real-time listener ----------
function loadMatches(callback) {
    showSpinner();
    const q = query(matchesCol, where("deleted", "==", false));
    onSnapshot(q, snapshot => {
        matches = [];
        snapshot.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
        renderAllMatches(matches);
        hideSpinner();
        //callback(matches);
        updateTimeButtons(matches);
    });
}
// ---------- Book match (writes to Firebase) ----------
async function bookMatch() {
    if (selectedServer === 'Ghadab') {
        const userInput = prompt("Enter Admin-Ghadab Password:");
        if (userInput !== passwordGhadab) {
            alert("Wrong password!");
            return;
        }
    }
    const t1 = document.getElementById("team1").value.trim();
    const t2 = document.getElementById("team2").value.trim();    
    
    if (!t1 || !t2 || !selectedTime) {
        alert("Fill all fields.");
        return;
    }


    const today = new Date().toISOString().split("T")[0];
    //console.log(selectedTime)
    try {
        const availableServer = getFirstAvailableServer(today, selectedTime);
        if(availableServer == null){
            alert("❌FULLY BOOKED - NO AVAILABLE SERVERS❌");
            return;
        }
            

        await addDoc(matchesCol, {
            team1: t1,
            team2: t2,
            time: selectedTime,
            server: availableServer,
            date: today,
            deleted: false
        });

        document.getElementById("team1").value = "";
        document.getElementById("team2").value = "";
        //selectedTime = null;
        highlightSelectedTime();
        alert("✅ Match booked successfully:\n\n---------Server: " + availableServer + "\n---------Time: " + to12Hour(selectedTime));
        //showAlert("✅Match booked successfully! -Server: ")
        console.log("✅ Match booked successfully!");
    } catch (error) {
        console.error("Error adding match:", error);
        alert("Failed to book match.❌");
    }
}

// ---------- Render matches into tables ----------
function renderAllMatches(matches) {
    for (let s = 1; s <= Object.keys(enabledServers).length; s++) {
        //console.log(Object.keys(enabledServers)[s-1]);
        const tbody = document.querySelector(`#server${Object.keys(enabledServers)[s - 1]} tbody`);
        tbody.innerHTML = "";

        const serverMatches = matches.filter(m => m.server === (Object.keys(enabledServers)[s - 1])).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
        serverMatches.forEach(m => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${escapeHtml(m.team1)} vs ${escapeHtml(m.team2)}</td>
                             <td>${to12Hour(m.time)}</td>
                             <td><button class="delete" onclick="deleteMatch('${m.server}', '${m.id}')">X</button></td>`;
            tbody.appendChild(row);
        });
    }
    updateTimeButtons(matches);
}

function updateTimeButtons(matches) {
    const currentMatches = matches || [];
    Array.from(timeButtonsContainer.children).forEach(btn => {
        if (!selectedServer) {
            btn.disabled = false;
            btn.style.border = "1px solid #007bff";
            return;
        }

        // Disable if time already exists in matches for the selected server
        const conflict = matches.some(
            m => m.server == selectedServer && m.time == btn.dataset.time
        );

        btn.disabled = conflict;
        btn.style.border = conflict ? "1px solid grey" : "1px solid #007bff";
    });
}

// ---------- small helper to avoid HTML injection ----------
function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m]));
}


function bindToggleLabel(switchId, labelId, name, valueOn, valueOFF) {
    const sw = document.getElementById(switchId);
    const label = document.getElementById(labelId);

    function update() {
        const enabled = sw.checked;
        label.textContent = `${name}: ${enabled ? valueOn : valueOFF}`;
        label.classList.toggle("enabled", enabled);
    }

    sw.addEventListener("change", update);

    // initialize on page load
    update();
}

// Query function: checks if a server is booked at a given date & time
function isServerBooked(server, date, time) {
    return bookings.some(b =>
        !b.deleted && b.server === server && b.date === date && b.time === time
    );
}

// Function to find the first available server
function getFirstAvailableServer(date, time) {
    console.log("Dateeee: " + date)

    const cheatsValue = document.getElementById("cheatsSwitch").checked;
    let SERVERS_TO_CHECK = [];
    if(!cheatsValue)
        SERVERS_TO_CHECK=SERVERS_NO_CHEATS
    else
        SERVERS_TO_CHECK=SERVERS

    
    for (const server of SERVERS_TO_CHECK) {
        if (!isServerBooked(server, date, time)) {
            console.log("Assigned server:", server);
            return server; // ✅ first available server
        }
    }

    console.log("No servers available.");
    return null; // or handle the "fully booked" case
}

bindToggleLabel("cheatsSwitch", "cheatsLabel", "💵Cheats", "1", "0");
//bindToggleLabel("airmoveSwitch", "airmoveLabel", "Airmove & Airaccelerate", "999", "10");
// ---------- init ----------
renderServerTables();
generateTimes();

loadMatches(matches => { console.log(matches); renderAllMatches(matches) });









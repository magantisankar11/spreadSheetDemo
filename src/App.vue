<template>
  <div style="padding:16px; max-width:1100px; margin:0 auto;">
    <h2>Google Sheet Data (via JSpreadsheet)</h2>

    <!-- JSpreadsheet host -->
    <div ref="host" style="margin-top:12px; border:1px solid #e2e8f0; border-radius:8px; padding:8px;"></div>
    <button @click="cellValue">Last updated cell value</button>
    <button @click="checkForChanges">Last cell value</button>
    <div id="cellValue"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import jspreadsheet from 'jspreadsheet-ce'
import 'jspreadsheet-ce/dist/jspreadsheet.css'
import 'jsuites/dist/jsuites.css'

const host = ref(null);
const workbook = ref(null)
let sheetInstance = null

// helper returning the first worksheet object or the sheet object itself
const sheet = () => {
  if (!workbook.value) return null
  return workbook.value.worksheets ? workbook.value.worksheets[0] : workbook.value
}

// initial sample data (array of arrays)
const initialData = [
  ['1', 'John Doe', 'Developer', 29],
  ['2', 'Jane Smith', 'Designer', 25],
  ['3', 'Mike Johnson', 'Manager', 35]
]

// column config
const columns = [
  { title: 'ID', width: 80 },
  { title: 'Name', width: 220 },
  { title: 'Role', width: 180 },
  { title: 'Age', type: 'numeric', width: 80 }
]

function renderJSpreadsheet(data) {
  // destroy old instance if exists
  if (sheetInstance) {
    host.value.innerHTML = ""
  }

  sheetInstance = jspreadsheet(host.value, {
    data,
    minDimensions: [data[0]?.length || 4, data.length || 10],
    search: true,
    editable: false // read-only view
  })
}
function checkForChanges() {
   if (typeof google !== "undefined" && google.script && google.script.run) {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("Last edited cell:", data);
        console.log(`Last edited value: ${data.value} at row ${data.row}, col ${data.col}`);
        document.getElementById("cellValue").innerText = data.value;
      })
      .getLastEdited();
   }
}

function cellValue() {
   if (typeof google !== "undefined" && google.script && google.script.run) {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("Last edited cell:", data);
        console.log(`Last edited value: ${data.value} at row ${data.row}, col ${data.col}`);
        document.getElementById("cellValue").innerText = data.value;
      })
      .getLastChange();
   }
}
// auto-load when sidebar mounts
onMounted(() => {
  const handleMessage = (event) => {
        // Ensure message is from the iframe
        if (event.data.action === "getSheetData") {
          google.script.run
            .withSuccessHandler((data) => {
              // Send data back to iframe
              event.source.postMessage({ action: "sheetData", data }, event.origin);
            })
            .getSheetData();
        }
  };
setTimeout(() => {
    window.parent.postMessage({ action: "getSheetData" }, "*");
}, 7000);
  window.addEventListener("message", handleMessage);
   // create a workbook with a single worksheet — works with modern jspreadsheet versions
  workbook.value = jspreadsheet(host.value, {
    worksheets: [
      {
        data: initialData,
        columns,
        minDimensions: [4, 6],
        search: true,
        // allow editing
        editable: true
      }
    ],
    // basic options for older versions fallback
    data: initialData,
    columns
  })
   if (typeof google !== "undefined" && google.script && google.script.run) {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("Loaded sheet data:", data)
        renderJSpreadsheet(data)
      })
      .getSheetData()
  }
     // poll every 5 seconds
  // setInterval(checkForChanges, 5000)
});
onBeforeUnmount(() => {
        window.removeEventListener("message", handleMessage);
      });
</script>

<style>
button {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  cursor: pointer;
}
button:hover { background:#f8fafc }
</style>

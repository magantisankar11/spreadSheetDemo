<template>
  <div style="padding:16px; max-width:1100px; margin:0 auto;">
    <h2>JSpreadsheet (Vue 3) — Render on load + CRUD</h2>

    <!-- host for the spreadsheet -->
    <div ref="host" style="margin-top:12px; border:1px solid #e2e8f0; border-radius:8px; padding:8px;"></div>

    <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
      <button @click="addRow">Add Row</button>
      <button @click="deleteSelectedOrLastRow">Delete Selected / Last Row</button>
      <button @click="updateFirstCell">Update [A1]</button>
      <button @click="showData">Show Data (console & alert)</button>
    </div>

    <p style="margin-top:12px; color:#666">
      Notes: The code uses defensive checks (works across jspreadsheet versions that return a workbook or a sheet directly).
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// community edition package
import jspreadsheet from 'jspreadsheet-ce'
import 'jspreadsheet-ce/dist/jspreadsheet.css'
import 'jsuites/dist/jsuites.css'

const host = ref(null)
const workbook = ref(null)

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

onMounted(() => {
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

  // small safety: if workbook created but no worksheets and newer api is different,
  // ensure at least workbook is usable.
  console.log('JSpreadsheet workbook created:', workbook.value)
})

// --- CRUD helpers with defensive checks ---

function addRow() {
  const s = sheet()
  if (!s) return alert('Sheet not ready yet')

  const newRow = [`${Date.now()}`, 'New User', 'Role', 20]

  try {
    // try the convenient insertRow API first (many jspreadsheet versions have it)
    if (typeof s.insertRow === 'function') {
      // some implementations accept the values array directly, some require a nested array
      try { s.insertRow(newRow) } catch (e) { s.insertRow([newRow]) }
    } else {
      // fallback: rebuild data array and set it (if setData exists)
      const d = typeof s.getData === 'function' ? s.getData() : []
      d.push(newRow)
      if (typeof s.setData === 'function') {
        s.setData(d)
      } else {
        // last-resort: log so you can inspect
        console.warn('No insertRow or setData available; new data:', d)
        alert('Add-row fallback used; check console for details.')
      }
    }
  } catch (err) {
    console.error('addRow error:', err)
    alert('Failed to add row — check console for details.')
  }
}

function deleteSelectedOrLastRow() {
  const s = sheet()
  if (!s) return alert('Sheet not ready yet')

  try {
    // prefer deleting a selected row if API exposes selected rows
    if (typeof s.getSelectedRows === 'function') {
      const sel = s.getSelectedRows()
      if (Array.isArray(sel) && sel.length) {
        // some versions expect deleteRow(index) or deleteRow(index, count)
        if (typeof s.deleteRow === 'function') {
          try { s.deleteRow(sel[0]) } catch (e) { s.deleteRow(sel[0], 1) }
          return
        }
      }
    }

    // otherwise delete last row
    if (typeof s.getData === 'function') {
      const d = s.getData()
      if (d.length === 0) return alert('No rows to delete')
      const newData = d.slice(0, -1)
      if (typeof s.setData === 'function') {
        s.setData(newData)
      } else if (typeof s.deleteRow === 'function') {
        try { s.deleteRow(d.length - 1) } catch (e) { s.deleteRow(d.length - 1, 1) }
      } else {
        alert('Cannot delete rows with current jspreadsheet API (see console).')
        console.warn('delete fallback, newData:', newData)
      }
    } else {
      alert('Cannot read data; getData not available.')
    }
  } catch (err) {
    console.error('deleteSelectedOrLastRow error:', err)
    alert('Failed to delete row — check console.')
  }
}

function updateFirstCell() {
  const s = sheet()
  if (!s) return alert('Sheet not ready yet')
  try {
    if (typeof s.setValueFromCoords === 'function') {
      // setValueFromCoords(col, row, value, triggerEvent?)
      s.setValueFromCoords(0, 0, 'UPDATED', true)
    } else if (typeof s.setValue === 'function') {
      // some older variants have setValue(colIndex, rowIndex, value)
      try { s.setValue(0, 0, 'UPDATED') } catch (e) { s.setValue(0, 'UPDATED') }
    } else {
      // fallback: replace via data array
      const d = typeof s.getData === 'function' ? s.getData() : null
      if (d) {
        if (!d[0]) d[0] = []
        d[0][0] = 'UPDATED'
        if (typeof s.setData === 'function') s.setData(d)
        else console.warn('No setData; data updated locally:', d)
      } else {
        alert('No API available to update cells.')
      }
    }
  } catch (err) {
    console.error('updateFirstCell error:', err)
    alert('Failed to update cell — check console.')
  }
}

function showData() {
  const s = sheet()
  if (!s) return alert('Sheet not ready yet')
  try {
    const d = typeof s.getData === 'function' ? s.getData() : null
    console.log('Sheet data:', d ?? s)
    alert(JSON.stringify(d ?? 'no getData', null, 2))
  } catch (err) {
    console.error('showData error:', err)
    alert('Failed to read data — check console.')
  }
}
</script>

<style>
/* optional light styling for buttons */
button {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  cursor: pointer;
}
button:hover { background:#f8fafc }
</style>

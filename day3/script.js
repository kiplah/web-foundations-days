let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter(note => note.text.toLowerCase().includes(word.toLowerCase()));
}

function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) => {
    return current.text.length > longest.text.length ? current : longest;
  });
}

function countByCategory() {
  let counts = {};
  for (let note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

function getSummary() {
  let counts = countByCategory();
  let totalNotes = notes.length;
  let word = totalNotes === 1 ? "note" : "notes";
  let parts = [];
  for (let category in counts) {
    parts.push(`${counts[category]} ${category}`);
  }
  return `${totalNotes} ${word}: ${parts.join(', ')}.`;
}

function isDuplicate(text) {
  let trimmedText = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === trimmedText);
}

function addNote(text, category) {
  if (typeof text !== 'string' || text.length < 1 || text.length > 200) {
    console.log("Failed to add: Text must be between 1 and 200 characters.");
    return false;
  }
  
  if (isDuplicate(text)) {
    console.log("Failed to add: Note already exists.");
    return false;
  }

  if (category !== "personal" && category !== "work" && category !== "study") {
    console.log("Failed to add: Invalid category.");
    return false;
  }

  let nextId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  notes.push({ id: nextId, text: text, category: category });
  return true;
}

// Tests

// searchNotes
console.log(searchNotes("javascript")); // Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]
console.log(searchNotes("nonexistent")); // Expected: []

// longestNote
console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
let tempNotes = notes; // Save notes for edge case
notes = []; 
console.log(longestNote()); // Expected: null
notes = tempNotes; // Restore notes

// countByCategory
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }
tempNotes = notes;
notes = [];
console.log(countByCategory()); // Expected: {}
notes = tempNotes;

// getSummary
console.log(getSummary()); // Expected: "5 notes: 2 personal, 2 study, 1 work."
tempNotes = notes;
notes = [{ id: 1, text: "Single note", category: "personal" }];
console.log(getSummary()); // Expected: "1 note: 1 personal."
notes = tempNotes;

// isDuplicate
console.log(isDuplicate("  Call mum  ")); // Expected: true
console.log(isDuplicate("Cook dinner")); // Expected: false

// addNote
console.log(addNote("Cook dinner", "personal")); // Expected: true, adds { id: 6, text: "Cook dinner", category: "personal" }
console.log(addNote("Cook dinner", "personal")); // Expected: false, logs "Failed to add: Note already exists."
console.log(addNote("", "work")); // Expected: false, logs "Failed to add: Text must be between 1 and 200 characters."
console.log(addNote("Valid note", "invalid_category")); // Expected: false, logs "Failed to add: Invalid category."

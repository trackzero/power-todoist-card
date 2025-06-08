// Mock PowerTodoistCard class
class MockPowerTodoistCard {
    constructor() {
        this.myConfig = {}; // Initialize myConfig
    }

    // This is the actual function from powertodoist-card.js
    sortByLabel(items) {
        if (!this.myConfig.sort_by_label || this.myConfig.sort_by_label === "false") return items; // feature off or explicitly "false"

        const dir = this.myConfig.sort_by_label === 'descending' ? -1 : 1;

        items.sort((a, b) => {
            const la = (a.labels && a.labels.length ? a.labels[0] : '').toLowerCase();
            const lb = (b.labels && b.labels.length ? b.labels[0] : '').toLowerCase();
            if (la < lb) return -1 * dir;
            if (la > lb) return 1 * dir;
            return 0; // tie
        });

        return items;
    }
}

// Assertion function
function assertArraysEqual(actual, expected, testName) {
    const actualOrder = actual.map(item => item.content);
    const expectedOrder = expected.map(item => item.content);
    if (JSON.stringify(actualOrder) === JSON.stringify(expectedOrder)) {
        console.log(`PASSED: ${testName}`);
    } else {
        console.error(`FAILED: ${testName} - Expected order: ${JSON.stringify(expectedOrder)}, but got: ${JSON.stringify(actualOrder)}`);
        console.error(`   Expected full: ${JSON.stringify(expected)}`);
        console.error(`   Actual full: ${JSON.stringify(actual)}`);
    }
}

// --- Test Data ---
const baseItems = () => [
    { content: 'Task C', labels: ['cherry'] }, // Will be third in ascending
    { content: 'Task A', labels: ['apple'] },  // Will be first in ascending
    { content: 'Task E', labels: [''] },       // Empty label
    { content: 'Task D', labels: [] },         // No labels
    { content: 'Task B', labels: ['banana'] }, // Will be second in ascending
    { content: 'Task F', labels: ['banana'] }  // Same as Task B for stability
];

// --- Test Suite ---
console.log("Running sortByLabel Test Suite...");

const card = new MockPowerTodoistCard();
let itemsToSort;
let sortedItems;

// Test Case 1: sort_by_label is "false"
card.myConfig.sort_by_label = "false";
itemsToSort = baseItems();
sortedItems = card.sortByLabel([...itemsToSort]); // Use spread to avoid modifying original
assertArraysEqual(sortedItems, itemsToSort, 'sort_by_label is "false" (should remain unsorted)');

// Test Case 2: sort_by_label is "ascending"
card.myConfig.sort_by_label = "ascending";
itemsToSort = baseItems();
sortedItems = card.sortByLabel([...itemsToSort]);
// Expected: Empty/No labels first (as '' < 'apple'), then apple, banana, banana, cherry
const expectedAsc = [
    { content: 'Task E', labels: [''] },
    { content: 'Task D', labels: [] },
    { content: 'Task A', labels: ['apple'] },
    { content: 'Task B', labels: ['banana'] },
    { content: 'Task F', labels: ['banana'] },
    { content: 'Task C', labels: ['cherry'] }
];
assertArraysEqual(sortedItems, expectedAsc, 'sort_by_label is "ascending"');

// Test Case 3: sort_by_label is "descending"
card.myConfig.sort_by_label = "descending";
itemsToSort = baseItems();
sortedItems = card.sortByLabel([...itemsToSort]);
// Expected: cherry, banana, banana, apple, then Empty/No labels (as '' is smallest)
const expectedDesc = [
    { content: 'Task C', labels: ['cherry'] },
    { content: 'Task B', labels: ['banana'] },
    { content: 'Task F', labels: ['banana'] },
    { content: 'Task A', labels: ['apple'] },
    { content: 'Task E', labels: [''] },
    { content: 'Task D', labels: [] }
];
assertArraysEqual(sortedItems, expectedDesc, 'sort_by_label is "descending"');

// Test Case 4: sort_by_label is not provided (undefined)
card.myConfig.sort_by_label = undefined;
itemsToSort = baseItems();
const originalOrderUndefined = [...itemsToSort]; // Capture original order
sortedItems = card.sortByLabel([...itemsToSort]);
assertArraysEqual(sortedItems, originalOrderUndefined, 'sort_by_label is undefined (should remain unsorted)');

// Test Case 5: sort_by_label is an empty string
card.myConfig.sort_by_label = "";
itemsToSort = baseItems();
const originalOrderEmptyString = [...itemsToSort]; // Capture original order
sortedItems = card.sortByLabel([...itemsToSort]);
assertArraysEqual(sortedItems, originalOrderEmptyString, 'sort_by_label is "" (empty string, should remain unsorted)');

// Test Case 6: sort_by_label is any other string (should default to ascending)
card.myConfig.sort_by_label = "random_string";
itemsToSort = baseItems();
sortedItems = card.sortByLabel([...itemsToSort]);
// Expected: Same as ascending
assertArraysEqual(sortedItems, expectedAsc, 'sort_by_label is "random_string" (should default to ascending)');

// Test Case 7: Items with no labels or mixed labels (ascending)
card.myConfig.sort_by_label = "ascending";
let itemsForTest7 = [ // Use a new variable to ensure fresh data
    { content: 'Task Z', labels: ['zebra'] },
    { content: 'Task N', labels: [] },        // No label
    { content: 'Task M', labels: ['middle'] },
    { content: 'Task E', labels: [''] },      // Empty label
];
sortedItems = card.sortByLabel([...itemsForTest7]);
const expectedMixedAsc = [ // N before E based on stable sort (original order for identical keys)
    { content: 'Task N', labels: [] },
    { content: 'Task E', labels: [''] },
    { content: 'Task M', labels: ['middle'] },
    { content: 'Task Z', labels: ['zebra'] },
];
assertArraysEqual(sortedItems, expectedMixedAsc, 'Mixed labels with empty/no labels (ascending)');

// Test Case 8: Items with no labels or mixed labels (descending)
card.myConfig.sort_by_label = "descending";
let itemsForTest8 = [ // Use a new variable to ensure fresh data
    { content: 'Task Z', labels: ['zebra'] },
    { content: 'Task N', labels: [] },        // No label
    { content: 'Task M', labels: ['middle'] },
    { content: 'Task E', labels: [''] },      // Empty label
];
sortedItems = card.sortByLabel([...itemsForTest8]);
const expectedMixedDesc = [ // N before E based on stable sort (original order for identical keys)
    { content: 'Task Z', labels: ['zebra'] },
    { content: 'Task M', labels: ['middle'] },
    { content: 'Task N', labels: [] },
    { content: 'Task E', labels: [''] },
];
assertArraysEqual(sortedItems, expectedMixedDesc, 'Mixed labels with empty/no labels (descending)');


// Test Case 9: All items have no labels
card.myConfig.sort_by_label = "ascending";
itemsToSort = [
    { content: 'Task 1', labels: [] },
    { content: 'Task 2', labels: [] },
    { content: 'Task 3', labels: [] },
];
const originalOrderNoLabels = [...itemsToSort];
sortedItems = card.sortByLabel([...itemsToSort]);
assertArraysEqual(sortedItems, originalOrderNoLabels, 'All items no labels (ascending, should remain stable)');

// Test Case 10: All items have empty string labels
card.myConfig.sort_by_label = "ascending";
itemsToSort = [
    { content: 'Task X', labels: [''] },
    { content: 'Task Y', labels: [''] },
    { content: 'Task Z', labels: [''] },
];
const originalOrderEmptyLabels = [...itemsToSort];
sortedItems = card.sortByLabel([...itemsToSort]);
assertArraysEqual(sortedItems, originalOrderEmptyLabels, 'All items empty string labels (ascending, should remain stable)');

console.log("--- Test Suite Finished ---");

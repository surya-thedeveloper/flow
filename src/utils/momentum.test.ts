import { calculateMomentum, formatFactualCount, formatRelativeTime } from './momentum';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Testing Momentum Calculation ---');

// Test 0 tasks
console.log('0 total tasks:', calculateMomentum(0, 0));
assert(calculateMomentum(0, 0) === 0, '0 tasks should return 0%');

// Test 1 task
console.log('1 task (0/1):', calculateMomentum(0, 1));
console.log('1 task (1/1):', calculateMomentum(1, 1));
assert(calculateMomentum(0, 1) === 0, '0 of 1 should be 0%');
assert(calculateMomentum(1, 1) === 100, '1 of 1 should be 100%');

// Test 2 tasks
console.log('2 tasks (0/2):', calculateMomentum(0, 2));
console.log('2 tasks (1/2):', calculateMomentum(1, 2));
console.log('2 tasks (2/2):', calculateMomentum(2, 2));
assert(calculateMomentum(0, 2) === 0, '0 of 2 should be 0%');
assert(calculateMomentum(1, 2) >= 50, '1 of 2 should reach ~50%+ momentum');
assert(calculateMomentum(2, 2) === 100, '2 of 2 should be 100%');

// Test 5 tasks (as specified: 1->30%, 2->50%, 3->68%, 4 (1 remaining)-> >90%, 5->100%)
console.log('\n5 tasks curve:');
const fiveTasks = [0, 1, 2, 3, 4, 5].map((c) => {
  const p = calculateMomentum(c, 5);
  console.log(`  ${c}/5 completed -> ${p}%`);
  return p;
});
assert(fiveTasks[0] === 0, '5 tasks: 0 completed should be 0%');
assert(fiveTasks[1] >= 28 && fiveTasks[1] <= 35, `5 tasks: 1 completed was ${fiveTasks[1]}%`);
assert(fiveTasks[2] >= 48 && fiveTasks[2] <= 53, `5 tasks: 2 completed was ${fiveTasks[2]}%`);
assert(fiveTasks[3] >= 65 && fiveTasks[3] <= 72, `5 tasks: 3 completed was ${fiveTasks[3]}%`);
assert(fiveTasks[4] > 90, `5 tasks: 4 completed was ${fiveTasks[4]}% (must be > 90%)`);
assert(fiveTasks[5] === 100, '5 tasks: 5 completed should be 100%');

// Test 10 tasks (9 of 10 must be > 90%)
console.log('\n10 tasks curve:');
const tenTasks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
  const p = calculateMomentum(c, 10);
  console.log(`  ${c}/10 completed -> ${p}%`);
  return p;
});
assert(tenTasks[0] === 0, '10 tasks: 0 completed should be 0%');
assert(tenTasks[3] >= 48 && tenTasks[3] <= 53, `10 tasks: 3 completed was ${tenTasks[3]}%`);
assert(tenTasks[9] > 90, `10 tasks: 9 completed was ${tenTasks[9]}% (must be > 90%)`);
assert(tenTasks[10] === 100, '10 tasks: 10 completed should be 100%');

// Verify strict monotonicity (never decreases, strictly increases)
for (let i = 1; i < tenTasks.length; i++) {
  assert(tenTasks[i] > tenTasks[i - 1], `Strictly increasing violated at ${i}: ${tenTasks[i]} <= ${tenTasks[i - 1]}`);
}

// Test formatting helpers
console.log('\nTesting Format Helpers:');
assert(formatFactualCount(3, 10) === '3 of 10 done', 'formatFactualCount should return "3 of 10 done"');
assert(formatFactualCount(0, 0) === 'No items', 'formatFactualCount with 0 total should return "No items"');
assert(formatRelativeTime(Date.now() - 5000) === 'Just now', 'formatRelativeTime recent should be "Just now"');

console.log('\n✓ All Momentum & Formatting Tests Passed Successfully!');

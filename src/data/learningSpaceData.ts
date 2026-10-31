import { LearningItem, LearningStreakData } from '../types';

export const initialLearningItems: LearningItem[] = [
  // 1. MISTAKE BOOK ENTRIES
  {
    id: 'mistake-1',
    studentId: 'student-current',
    section: 'mistakes',
    title: 'Off-by-One in Binary Search Upper Boundary',
    category: 'DSA - Binary Search',
    description: 'When updating the high pointer in a closed-interval binary search `[low, high]`, using `high = mid` instead of `high = mid - 1` caused an infinite loop when target was smaller than `nums[mid]`.',
    date: '2026-10-28',
    tags: ['binary-search', 'off-by-one', 'two-pointers', 'edge-case'],
    status: 'Need Revision',
    bookmarked: true,
    nextRevisionDate: '2026-10-31',
    lastRevisedDate: '2026-10-28',
    revisionCount: 1,
    problemId: 'lc-easy-binary-search',
    problemTitle: 'Binary Search',
    failureType: 'Time Limit Exceeded / Infinite Loop',
    failedInput: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
    expectedOutput: '-1',
    actualOutput: 'Time Limit Exceeded (low=2, high=2 loop)',
    buggyCode: `function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] > target) {
      high = mid; // BUG! Should be mid - 1
    } else {
      low = mid + 1;
    }
  }
  return -1;
}`,
    correctedSolution: `function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] > target) {
      high = mid - 1; // Correct!
    } else {
      low = mid + 1;
    }
  }
  return -1;
}`,
    fixExplanation: 'In an inclusive search range `[low, high]`, element `mid` has already been inspected. If `nums[mid] > target`, the target can only exist strictly in `[low, mid - 1]`. Setting `high = mid` keeps length 1 ranges cycling forever.',
    codeLanguage: 'javascript',
  },
  {
    id: 'mistake-2',
    studentId: 'student-current',
    section: 'mistakes',
    title: 'Pandas SettingWithCopyWarning & In-Place Mutation Trap',
    category: 'Data Science - Pandas',
    description: 'Attempted to modify filtered rows using chained indexing `df[df["age"] > 30]["status"] = "Senior"`. Pandas generated SettingWithCopyWarning and changes did not apply reliably.',
    date: '2026-10-27',
    tags: ['pandas', 'data-science', 'python', 'dataframe'],
    status: 'Understood',
    bookmarked: false,
    nextRevisionDate: '2026-11-04',
    lastRevisedDate: '2026-10-29',
    revisionCount: 2,
    failureType: 'Chained Indexing / Silent Assignment Failure',
    failedInput: 'df = pd.DataFrame({"age": [25, 34, 42], "status": ["Junior", "Mid", "Mid"]})',
    expectedOutput: 'status column updated to ["Junior", "Senior", "Senior"]',
    actualOutput: 'SettingWithCopyWarning; values remained unchanged in original dataframe',
    buggyCode: `# Buggy chained indexing
df[df['age'] > 30]['status'] = 'Senior' # Warning and possible failure`,
    correctedSolution: `# Correct solution using .loc indexer
df.loc[df['age'] > 30, 'status'] = 'Senior'`,
    fixExplanation: 'Chained indexing `df[mask][col]` first invokes `__getitem__` which might return a copy rather than a view of the underlying memory block. `df.loc[row_indexer, col_indexer]` performs atomic assignment on the parent DataFrame.',
    codeLanguage: 'python',
    resources: [
      {
        id: 'res-pandas-1',
        label: 'Pandas Docs: Returning a view versus a copy',
        url: 'https://pandas.pydata.org/pandas-docs/stable/user_guide/indexing.html#returning-a-view-versus-a-copy',
        type: 'link',
      },
    ],
  },
  {
    id: 'mistake-3',
    studentId: 'student-current',
    section: 'mistakes',
    title: 'Missing Base Case in Coin Change Top-Down Memoization',
    category: 'DSA - Dynamic Programming',
    description: 'In Coin Change, forgot to handle `amount === 0` returning 0, and returned Infinity for negative amounts without caching negative results, leading to stack overflow.',
    date: '2026-10-29',
    tags: ['dynamic-programming', 'memoization', 'recursion', 'dsa'],
    status: 'Need Revision',
    bookmarked: true,
    nextRevisionDate: '2026-10-31',
    lastRevisedDate: '2026-10-29',
    revisionCount: 0,
    problemId: 'lc-medium-coin-change',
    problemTitle: 'Coin Change',
    failureType: 'Maximum Call Stack Exceeded',
    failedInput: 'coins = [1, 2, 5], amount = 11',
    expectedOutput: '3 (5 + 5 + 1)',
    actualOutput: 'RangeError: Maximum call stack size exceeded',
    buggyCode: `function coinChange(coins, amount) {
  const memo = {};
  function dp(rem) {
    if (rem < 0) return Infinity;
    // Forgot: if (rem === 0) return 0;
    if (memo[rem] !== undefined) return memo[rem];
    let min = Infinity;
    for (const c of coins) min = Math.min(min, 1 + dp(rem - c));
    return memo[rem] = min;
  }
  const ans = dp(amount);
  return ans === Infinity ? -1 : ans;
}`,
    correctedSolution: `function coinChange(coins, amount) {
  const memo = new Map();
  function dp(rem) {
    if (rem < 0) return Infinity;
    if (rem === 0) return 0; // Essential base case!
    if (memo.has(rem)) return memo.get(rem);
    let minCoins = Infinity;
    for (const c of coins) {
      const res = dp(rem - c);
      if (res !== Infinity) minCoins = Math.min(minCoins, 1 + res);
    }
    memo.set(rem, minCoins);
    return minCoins;
  }
  const ans = dp(amount);
  return ans === Infinity ? -1 : ans;
}`,
    fixExplanation: 'Zero amount requires zero coins. Without `if (rem === 0) return 0`, the recursion runs until `rem < 0`, but because `1 + dp(0 - c)` keeps subtracting, call stack depth blows up.',
    codeLanguage: 'javascript',
  },

  // 2. NEW LEARNING CONCEPTS
  {
    id: 'learn-1',
    studentId: 'student-current',
    section: 'learnings',
    title: "Floyd's Tortoise & Hare Cycle Finding Algorithm",
    category: 'DSA - Linked Lists & Pointers',
    description: "Cycle detection algorithm using two pointers moving at different speeds (1 step and 2 steps). If there is a cycle, the fast pointer will lap and catch the slow pointer in O(n) time and O(1) auxiliary space.",
    date: '2026-10-26',
    tags: ['floyd-cycle', 'two-pointers', 'linked-list', 'dsa'],
    status: 'Understood',
    bookmarked: true,
    nextRevisionDate: '2026-11-06',
    lastRevisedDate: '2026-10-30',
    revisionCount: 3,
    codeSnippet: `function hasCycle(head) {
  if (!head || !head.next) return false;
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;         // 1 step
    fast = fast.next.next;    // 2 steps
    if (slow === fast) return true; // Cycle detected!
  }
  return false;
}`,
    codeLanguage: 'javascript',
    fixExplanation: 'Mathematical proof: Let cycle length be C. At each step after slow enters the loop, distance between fast and slow decreases by 1 modulo C. Therefore fast must meet slow within C steps.',
    resources: [
      {
        id: 'res-floyd-1',
        label: "Floyd's Algorithm Proof & Visual Notes (PDF)",
        url: 'https://en.wikipedia.org/wiki/Cycle_detection#Floyd\'s_tortoise_and_hare',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'learn-2',
    studentId: 'student-current',
    section: 'learnings',
    title: 'Pandas GroupBy `.transform()` vs `.apply()` vs `.agg()`',
    category: 'Python & Data Science - Pandas',
    description: "`.transform()` preserves the original DataFrame index and broadcasts the aggregated group summary back to every individual row. `.agg()` reduces each group to a single row summary, while `.apply()` handles arbitrary custom DataFrame operations.",
    date: '2026-10-29',
    tags: ['pandas', 'data-science', 'python', 'aggregation'],
    status: 'Understood',
    bookmarked: true,
    nextRevisionDate: '2026-11-05',
    lastRevisedDate: '2026-10-29',
    revisionCount: 1,
    codeSnippet: `import pandas as pd

df = pd.DataFrame({
    'department': ['Eng', 'Eng', 'HR', 'HR', 'Eng'],
    'salary': [120000, 140000, 70000, 85000, 110000]
})

# 1. .transform() returns a Series with same length as df!
df['dept_mean_salary'] = df.groupby('department')['salary'].transform('mean')

# 2. Compute salary relative to department benchmark:
df['dept_diff'] = df['salary'] - df['dept_mean_salary']
print(df)`,
    codeLanguage: 'python',
    resources: [
      {
        id: 'res-pandas-transform',
        label: 'Pandas Guide: GroupBy Transform Patterns',
        url: 'https://pandas.pydata.org/docs/reference/api/pandas.core.groupby.DataFrameGroupBy.transform.html',
        type: 'link',
      },
    ],
  },
  {
    id: 'learn-3',
    studentId: 'student-current',
    section: 'learnings',
    title: 'Precision-Recall AUC vs ROC-AUC for Imbalanced Classification',
    category: 'Data Science - Machine Learning Evaluation',
    description: 'ROC-AUC can be deceptively optimistic when the negative class dominates (e.g. fraud detection where 99.8% is non-fraud). False Positive Rate denominator (FP + TN) remains huge, suppressing FPR. PR-AUC evaluates Precision against Recall directly and exposes false alarms.',
    date: '2026-10-25',
    tags: ['machine-learning', 'metrics', 'classification', 'data-science'],
    status: 'Need Revision',
    bookmarked: false,
    nextRevisionDate: '2026-10-31',
    lastRevisedDate: '2026-10-25',
    revisionCount: 0,
    codeSnippet: `from sklearn.metrics import roc_auc_score, average_precision_score, precision_recall_curve

# True labels (highly imbalanced: only 2 positive cases out of 100)
# Use PR-AUC (Average Precision) instead of ROC-AUC
pr_auc = average_precision_score(y_true, y_scores)
print(f"PR-AUC (Focused on minority class): {pr_auc:.3f}")`,
    codeLanguage: 'python',
    resources: [
      {
        id: 'res-prauc-paper',
        label: 'The Relationship Between PR and ROC Curves (Research Paper PDF)',
        url: 'https://ftp.cs.wisc.edu/machine-learning/shavlik-group/davis.icml06.pdf',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'learn-4',
    studentId: 'student-current',
    section: 'learnings',
    title: 'Monotonic Decreasing Stack for "Next Greater Element"',
    category: 'DSA - Stacks',
    description: 'Maintains elements in strictly decreasing order. When encountering a new element `nums[i]` that is larger than the stack top, the top element has found its "Next Greater Element"! Pop and resolve until invariant holds.',
    date: '2026-10-30',
    tags: ['monotonic-stack', 'dsa', 'arrays', 'next-greater-element'],
    status: 'Learning',
    bookmarked: false,
    nextRevisionDate: '2026-11-02',
    lastRevisedDate: '2026-10-30',
    revisionCount: 0,
    codeSnippet: `function nextGreaterElements(nums) {
  const n = nums.length;
  const result = new Array(n).fill(-1);
  const stack = []; // Stores indices
  
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop();
      result[idx] = nums[i]; // nums[i] is next greater element
    }
    stack.push(i);
  }
  return result; // Total time: O(n) because each index is pushed & popped once
}`,
    codeLanguage: 'javascript',
  },

  // 3. MY IDEAS & DISCOVERIES
  {
    id: 'idea-1',
    studentId: 'student-current',
    section: 'ideas',
    title: 'In-Browser Visual AST Debugger for Coding Practice',
    category: 'Project Idea - Developer Tooling',
    description: 'Build an interactive stepper that transpiles student JavaScript into an AST (Abstract Syntax Tree) using Babel/Acorn and visually steps through variable scopes, call stack frames, and array pointers in real time.',
    date: '2026-10-27',
    tags: ['ast', 'visualizer', 'compiler', 'project-idea'],
    status: 'Learning',
    bookmarked: true,
    ideaStage: 'In Progress',
    actionItems: [
      { id: 'act-1', text: 'Parse JavaScript code into ESTree AST tokens', done: true },
      { id: 'act-2', text: 'Render live call stack and heap pointers visually', done: false },
      { id: 'act-3', text: 'Support step-over, step-into, and breakpoint pause', done: false },
    ],
    discoveryNotes: 'Using Acorn parser in a Web Worker keeps execution isolated without blocking the main UI thread.',
  },
  {
    id: 'idea-2',
    studentId: 'student-current',
    section: 'ideas',
    title: 'Python 3.12 Dict Merge Operator Trick with Default Dicts',
    category: 'Useful Trick - Python Clean Code',
    description: 'Instead of repetitive `.update()` calls or mutating input dictionaries, use the `|` union operator to merge defaults, user settings, and overrides cleanly in one expressive line.',
    date: '2026-10-28',
    tags: ['python', 'tricks', 'clean-code'],
    status: 'Understood',
    bookmarked: true,
    ideaStage: 'Tested & Validated',
    codeSnippet: `# Clean config merge without mutation
DEFAULT_CONFIG = {"theme": "dark", "timeout": 30, "retries": 3}
user_prefs = {"timeout": 60}
runtime_flags = {"verbose": True}

final_config = DEFAULT_CONFIG | user_prefs | runtime_flags
print(final_config) # Output: {'theme': 'dark', 'timeout': 60, 'retries': 3, 'verbose': True}`,
    codeLanguage: 'python',
    discoveryNotes: 'Works from Python 3.9+ onwards (PEP 584). Right-most dictionary keys take precedence.',
  },
  {
    id: 'idea-3',
    studentId: 'student-current',
    section: 'ideas',
    title: 'Quiz Duplicate Question Detector via TF-IDF Vector Cosine Similarity',
    category: 'Experiment - NLP & Search',
    description: 'When teachers create new quiz questions, compare the question text against existing question bank vectors using n-gram cosine similarity to instantly flag potential duplicates.',
    date: '2026-10-29',
    tags: ['nlp', 'cosine-similarity', 'quiz-platform', 'experiment'],
    status: 'Learning',
    bookmarked: false,
    ideaStage: 'Hypothesis',
    actionItems: [
      { id: 'act-tf-1', text: 'Extract 2-gram and 3-gram character shingles', done: true },
      { id: 'act-tf-2', text: 'Benchmark cosine distance cutoff (0.82 threshold)', done: false },
    ],
  },

  // 4. SAVED NOTES & RESOURCES
  {
    id: 'note-1',
    studentId: 'student-current',
    section: 'notes',
    title: 'Graph Traversal & Shortest Path Master Cheatsheet',
    category: 'DSA - Graphs & Shortest Path',
    description: 'Comprehensive quick-reference table for Graph algorithms: BFS (unweighted shortest path), Dijkstra (non-negative weights), Bellman-Ford (handles negative weight cycles), and Floyd-Warshall (all-pairs shortest paths).',
    date: '2026-10-24',
    tags: ['graphs', 'dijkstra', 'bfs', 'algorithms', 'cheatsheet'],
    status: 'Understood',
    bookmarked: true,
    nextRevisionDate: '2026-11-10',
    lastRevisedDate: '2026-10-30',
    revisionCount: 4,
    codeSnippet: `/* Graph Algorithm Time & Space Complexities
1. BFS: O(V + E) time, O(V) space — Shortest path in unweighted graphs
2. DFS: O(V + E) time, O(V) space — Connected components, topological sort
3. Dijkstra (Min-Heap): O((V + E) log V) — Non-negative edge weights
4. Bellman-Ford: O(V * E) — Detects negative weight cycles
5. Floyd-Warshall: O(V^3) — All-pairs shortest path dynamic programming
*/`,
    codeLanguage: 'javascript',
    resources: [
      {
        id: 'res-mit-graph',
        label: 'MIT 6.006 Lecture Notes: Dijkstra & Graphs (PDF)',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec16/',
        type: 'pdf',
      },
      {
        id: 'res-visualgo',
        label: 'VisuAlgo Interactive Graph Visualizer',
        url: 'https://visualgo.net/en/sssp',
        type: 'link',
      },
    ],
  },
  {
    id: 'note-2',
    studentId: 'student-current',
    section: 'notes',
    title: 'Data Preprocessing Pipeline: Missing Values, Outliers & Scaling Checklist',
    category: 'Data Science - Preprocessing Checklist',
    description: 'Order of operations for tabular ML data pipelines: 1) Train/test split FIRST to avoid data leakage; 2) Impute missing values with train median/mode; 3) StandardScale or RobustScale (if heavy outliers exist); 4) One-Hot Encode categoricals with drop_first=True.',
    date: '2026-10-27',
    tags: ['data-science', 'scikit-learn', 'pipeline', 'machine-learning'],
    status: 'Need Revision',
    bookmarked: false,
    nextRevisionDate: '2026-10-31',
    lastRevisedDate: '2026-10-27',
    revisionCount: 1,
    codeSnippet: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

num_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', num_pipeline, numeric_cols),
    ('cat', cat_pipeline, categorical_cols)
])`,
    codeLanguage: 'python',
    resources: [
      {
        id: 'res-sklearn-pipe',
        label: 'Scikit-Learn Official ColumnTransformer Guide',
        url: 'https://scikit-learn.org/stable/modules/compose.html',
        type: 'link',
      },
    ],
  },
];

export const initialStreakData: LearningStreakData = {
  currentStreak: 6,
  longestStreak: 14,
  activityMap: {
    // Generate recent 28 days of activity data
    '2026-10-05': 1,
    '2026-10-06': 2,
    '2026-10-08': 3,
    '2026-10-09': 1,
    '2026-10-12': 2,
    '2026-10-14': 4,
    '2026-10-15': 1,
    '2026-10-18': 2,
    '2026-10-19': 3,
    '2026-10-21': 1,
    '2026-10-22': 2,
    '2026-10-25': 3,
    '2026-10-26': 2,
    '2026-10-27': 4,
    '2026-10-28': 3,
    '2026-10-29': 5,
    '2026-10-30': 4,
  },
  todayCount: 4,
  lastActiveDate: '2026-10-30',
};

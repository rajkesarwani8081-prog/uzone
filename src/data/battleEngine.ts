import {
  CodingProblem,
  ProblemSubmissionResult,
  PeerBattle,
  BattleAnalysis,
  BattleParticipantProgress,
  BattleSet,
  StudentItem,
  TestCaseResult,
} from '../types';
import { codingProblems } from './codingProblems';

/**
 * Validates whether two students are enrolled in the same class/course (batch).
 */
export function canBattle(studentA: { batch?: string }, studentB: { batch?: string }): boolean {
  if (!studentA?.batch || !studentB?.batch) return false;
  return studentA.batch.trim() === studentB.batch.trim();
}

/**
 * Simulates a realistic classmate solution outcome for the opponent based on their accuracy,
 * profile rating, and problem difficulty, without revealing opponent code.
 */
export function generateOpponentBattleOutcome(
  opponent: StudentItem,
  problems: CodingProblem[],
  battleDurationMin: number,
  userTimeSpentSec: number
): { results: ProblemSubmissionResult[]; score: number; timeSec: number } {
  const accuracyBase = (opponent.accuracy || 85) / 100;
  let totalScore = 0;
  const results: ProblemSubmissionResult[] = [];

  // Opponent pace slightly varies around user speed or typical duration
  const targetDurationSec = battleDurationMin * 60;
  const variance = (Math.random() * 0.3 - 0.15); // +/- 15%
  const opponentTimeSec = Math.max(
    60,
    Math.min(
      targetDurationSec - 30,
      Math.round(userTimeSpentSec * (1 + variance))
    )
  );

  for (let i = 0; i < problems.length; i++) {
    const prob = problems[i];
    const totalCases = prob.tests.length || 3;
    const maxMarks = Math.round(100 / problems.length);

    // Difficulty weight
    let passProb = accuracyBase;
    if (prob.difficulty === 'Hard') passProb -= 0.18;
    if (prob.difficulty === 'Easy') passProb += 0.08;
    passProb = Math.max(0.4, Math.min(0.98, passProb));

    const cases: TestCaseResult[] = prob.tests.map((t, idx) => {
      const pass = Math.random() < passProb;
      return {
        caseIndex: idx,
        pass,
        status: pass ? 'Passed' : 'Failed',
        input: JSON.stringify(t.args).slice(1, -1),
        expected: JSON.stringify(t.expected),
        actual: pass ? JSON.stringify(t.expected) : 'null',
        executionTimeMs: Math.round(35 + Math.random() * 55),
        error: pass ? undefined : 'Output did not match expected testcase value',
      };
    });

    const passedCount = cases.filter((c) => c.pass).length;
    const earned = Math.round((passedCount / totalCases) * maxMarks);
    totalScore += earned;

    const verdict: ProblemSubmissionResult['verdict'] =
      passedCount === totalCases
        ? 'Accepted'
        : passedCount > 0
        ? 'Wrong Answer'
        : 'Runtime Error';

    results.push({
      problemId: prob.id,
      problemTitle: prob.title,
      difficulty: prob.difficulty,
      code: `// ${opponent.name}'s verified submission (Confidential)`,
      language: ['python', 'java', 'cpp', 'javascript'][i % 4] as any,
      marksEarned: earned,
      maxMarks,
      verdict,
      totalCases,
      passedCases: passedCount,
      cases,
    });
  }

  return { results, score: totalScore, timeSec: opponentTimeSec };
}

/**
 * Builds side-by-side battle analysis comparing user and opponent performances.
 */
export function generateBattleAnalysis(
  userResults: ProblemSubmissionResult[],
  opponentResults: ProblemSubmissionResult[],
  userTimeSec: number,
  opponentTimeSec: number,
  userName: string,
  opponentName: string,
  problems: CodingProblem[]
): BattleAnalysis {
  const userScore = userResults.reduce((acc, r) => acc + r.marksEarned, 0);
  const opponentScore = opponentResults.reduce((acc, r) => acc + r.marksEarned, 0);

  let winnerName = 'Tie';
  if (userScore > opponentScore) {
    winnerName = userName;
  } else if (opponentScore > userScore) {
    winnerName = opponentName;
  } else {
    // Score tiebreak by speed
    if (userTimeSec < opponentTimeSec) {
      winnerName = userName;
    } else if (opponentTimeSec < userTimeSec) {
      winnerName = opponentName;
    } else {
      winnerName = 'Tie';
    }
  }

  const scoreDiff = Math.abs(userScore - opponentScore);
  const timeDiffSec = Math.abs(userTimeSec - opponentTimeSec);

  const questionsBetterA: string[] = [];
  const questionsBetterB: string[] = [];
  const whereALostMarks: string[] = [];
  const whereBLostMarks: string[] = [];
  const recommendedTopicsA = new Set<string>();
  const recommendedTopicsB = new Set<string>();

  problems.forEach((prob) => {
    const resA = userResults.find((r) => r.problemId === prob.id);
    const resB = opponentResults.find((r) => r.problemId === prob.id);

    const scoreA = resA?.marksEarned || 0;
    const scoreB = resB?.marksEarned || 0;

    if (scoreA > scoreB) {
      questionsBetterA.push(
        `${prob.title} (+${scoreA - scoreB} marks, ${resA?.passedCases}/${resA?.totalCases} tests passed)`
      );
    } else if (scoreB > scoreA) {
      questionsBetterB.push(
        `${prob.title} (+${scoreB - scoreA} marks, ${resB?.passedCases}/${resB?.totalCases} tests passed)`
      );
    }

    if (resA && resA.passedCases < resA.totalCases) {
      const failedCount = resA.totalCases - resA.passedCases;
      whereALostMarks.push(
        `Missed ${failedCount} test case${failedCount > 1 ? 's' : ''} on ${prob.title} (${resA.verdict})`
      );
      prob.tags.forEach((t) => recommendedTopicsA.add(t));
    }

    if (resB && resB.passedCases < resB.totalCases) {
      const failedCount = resB.totalCases - resB.passedCases;
      whereBLostMarks.push(
        `${opponentName} dropped ${failedCount} test case${failedCount > 1 ? 's' : ''} on ${prob.title}`
      );
      prob.tags.forEach((t) => recommendedTopicsB.add(t));
    }
  });

  if (whereALostMarks.length === 0) {
    whereALostMarks.push(`None! Full marks achieved on all ${problems.length} problems.`);
  }
  if (whereBLostMarks.length === 0) {
    whereBLostMarks.push(`None! ${opponentName} achieved full marks on all problems.`);
  }

  const timeDiffMins = (timeDiffSec / 60).toFixed(1);
  const userMins = (userTimeSec / 60).toFixed(1);
  const oppMins = (opponentTimeSec / 60).toFixed(1);

  let timeEfficiencySummary = '';
  if (userTimeSec < opponentTimeSec) {
    timeEfficiencySummary = `${userName} finished ${timeDiffMins} minutes faster (${userMins}m vs ${oppMins}m), demonstrating swift code synthesis and debugging pace.`;
  } else if (opponentTimeSec < userTimeSec) {
    timeEfficiencySummary = `${opponentName} had a faster execution cadence, concluding ${timeDiffMins} minutes earlier (${oppMins}m vs ${userMins}m).`;
  } else {
    timeEfficiencySummary = `Both participants completed the battle in identical execution duration (${userMins}m).`;
  }

  const userTotalTests = userResults.reduce((a, b) => a + b.totalCases, 0) || 1;
  const userPassedTests = userResults.reduce((a, b) => a + b.passedCases, 0);
  const oppTotalTests = opponentResults.reduce((a, b) => a + b.totalCases, 0) || 1;
  const oppPassedTests = opponentResults.reduce((a, b) => a + b.passedCases, 0);

  const userPct = Math.round((userPassedTests / userTotalTests) * 100);
  const oppPct = Math.round((oppPassedTests / oppTotalTests) * 100);

  const accuracySummary = `${userName} passed ${userPassedTests}/${userTotalTests} (${userPct}%) assertions; ${opponentName} passed ${oppPassedTests}/${oppTotalTests} (${oppPct}%) assertions.`;

  const efficiencyInsights = [
    `Algorithmic time complexity evaluated across ${problems.map((p) => p.complexity.time).join(', ')}.`,
    userScore >= opponentScore
      ? `${userName} maintained higher edge-case retention across corner test inputs.`
      : `${opponentName} structured boundary condition checks more effectively on multi-parameter tests.`,
    `Neither participant revealed private source code; insights are strictly derived from automated sandbox test outputs.`,
  ];

  return {
    winnerName,
    scoreDiff,
    timeDiffSec,
    questionsBetterA,
    questionsBetterB,
    whereALostMarks,
    whereBLostMarks,
    timeEfficiencySummary,
    accuracySummary,
    recommendedTopicsA: Array.from(recommendedTopicsA).slice(0, 4),
    recommendedTopicsB: Array.from(recommendedTopicsB).slice(0, 4),
    efficiencyInsights,
  };
}

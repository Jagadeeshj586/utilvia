/** Standard US 4.0 letter-grade to grade-point mapping. */
export const US_GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
} as const;

export type LetterGrade = keyof typeof US_GRADE_POINTS;

export const LETTER_GRADES = Object.keys(US_GRADE_POINTS) as LetterGrade[];

export type GpaCourseInput = {
  credits: number;
  grade: LetterGrade;
};

export type WeightedGpaResult = {
  weightedGpa: number;
  totalCredits: number;
  totalGradePoints: number;
  courseCount: number;
};

export const GPA_FAQS = [
  {
    question: "How is GPA calculated?",
    answer:
      "Weighted GPA = total grade points ÷ total credit hours. Each course contributes grade points × credit hours, where grade points come from the standard 4.0 letter-grade scale.",
  },
  {
    question: "What's the difference between weighted and unweighted GPA?",
    answer:
      "This calculator computes weighted GPA: courses with more credit hours influence the average more. Unweighted GPA treats every course equally regardless of credits.",
  },
  {
    question: "Does a B+ always equal 3.3 grade points?",
    answer:
      "On the standard US 4.0 scale used here, B+ maps to 3.3 grade points. Some schools use slightly different plus/minus mappings — confirm with your institution if needed.",
  },
  {
    question: "Can I calculate GPA across multiple semesters?",
    answer:
      "Yes. Add every course from all semesters into the list. The calculator returns one cumulative weighted GPA across all rows.",
  },
  {
    question: "Is GPA calculator free?",
    answer: "Yes. The Utilvia GPA Calculator is free with no signup required. All calculations run in your browser.",
  },
] as const;

export function gradePointFor(grade: LetterGrade): number {
  return US_GRADE_POINTS[grade];
}

export function parseCreditHours(value: string | number): number | null {
  const credits = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(credits) || credits <= 0) return null;
  return credits;
}

export function calculateWeightedGpa(courses: GpaCourseInput[]): WeightedGpaResult {
  let totalCredits = 0;
  let totalGradePoints = 0;
  let courseCount = 0;

  for (const course of courses) {
    const credits = parseCreditHours(course.credits);
    if (credits == null) continue;

    const points = gradePointFor(course.grade) * credits;
    totalCredits += credits;
    totalGradePoints += points;
    courseCount += 1;
  }

  return {
    weightedGpa: totalCredits > 0 ? totalGradePoints / totalCredits : 0,
    totalCredits,
    totalGradePoints,
    courseCount,
  };
}

export function createDefaultCourses(count = 3): Array<{ id: string; name: string; credits: string; grade: LetterGrade }> {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: "",
    credits: "3",
    grade: "B" as LetterGrade,
  }));
}

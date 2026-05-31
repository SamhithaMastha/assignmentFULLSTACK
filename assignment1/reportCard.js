class Student {
    constructor(name, scores) {
        this.name = name;
        this.scores = scores;
    }

    getAverage() {
        let sum = 0;

        for (let i = 0; i < this.scores.length; i++) {
            sum += this.scores[i];
        }

        return sum / this.scores.length;
    }

    getLetterGrade() {
        let average = this.getAverage();

        // Grade Scale:
        // A = 90+
        // B = 80+
        // C = 70+
        // D = 60+
        // F = below 60

        if (average >= 90) {
            return "A";
        } else if (average >= 80) {
            return "B";
        } else if (average >= 70) {
            return "C";
        } else if (average >= 60) {
            return "D";
        } else {
            return "F";
        }
    }

    summary() {
        let highest = this.scores[0];
        let lowest = this.scores[0];

        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i] > highest) {
                highest = this.scores[i];
            }

            if (this.scores[i] < lowest) {
                lowest = this.scores[i];
            }
        }

        return {
            highest,
            lowest
        };
    }
}

// CLI Input
const name = process.argv[2];

const scores = process.argv
    .slice(3)
    .map(score => Number(score));

// Validation
if (scores.length < 3) {
    console.log("Error: Please provide at least 3 scores");
    process.exit(1);
}

const student = new Student(name, scores);

const average = student.getAverage();
const grade = student.getLetterGrade();
const summary = student.summary();

// PASS / FAIL using ternary
const status = average >= 60 ? "PASS" : "FAIL";

// Switch based remark
function getRemark(grade) {
    switch (grade) {
        case "A":
            return "Excellent";

        case "B":
            return "Very Good";

        case "C":
            return "Good";

        case "D":
            return "Needs Improvement";

        case "F":
            return "Poor";

        default:
            return "No Remark";
    }
}

// Destructuring
const [score1, score2, ...remaining] = scores;

// Formatted output
console.log(`
========== REPORT CARD ==========
Student Name: ${student.name}

Scores: ${scores.join(", ")}

Score Breakdown:
Score 1: ${score1}
Score 2: ${score2}
Remaining Scores: ${remaining.join(", ")}

Average: ${average.toFixed(1)}
Grade: ${grade}
Status: ${status}
Remark: ${getRemark(grade)}

Highest Score: ${summary.highest}
Lowest Score: ${summary.lowest}
=================================
`);
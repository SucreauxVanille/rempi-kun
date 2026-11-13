
/* =========================
   連比くん
   問題生成・正誤判定
========================= */


/* =========================
   状態管理
========================= */

let currentQuestion = null;
let previousQuestionKey = null;

let stats = {
    total: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0
};

let answered = false;


/* =========================
   最大公約数
========================= */

function gcd(a, b) {

    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }

    return Math.abs(a);
}


/* =========================
   比の約分
========================= */

function reduceRatio(a, b) {

    const divisor = gcd(a, b);

    return [
        a / divisor,
        b / divisor
    ];
}


/* 3数の最大公約数 */
function gcd3(a, b, c) {

    return gcd(gcd(a, b), c);
}


/* 3数の比を約分 */
function reduceRatio3(a, b, c) {

    const divisor = gcd3(a, b, c);

    return [
        a / divisor,
        b / divisor,
        c / divisor
    ];
}


/* =========================
   問題生成
========================= */

function generateQuestion() {

    let p, q, r, s;
    let answer;

   let attempts = 0;
   const MAX_ATTEMPTS = 1000;

   while (true) {

       attempts++;

       if (attempts > MAX_ATTEMPTS) {
           throw new Error(
               "問題を生成できませんでした。ページを再読み込みしてください。"
           );
       }

        // 1～9の整数を生成
        p = Math.floor(Math.random() * 9) + 1;
        q = Math.floor(Math.random() * 9) + 1;
        r = Math.floor(Math.random() * 9) + 1;
        s = Math.floor(Math.random() * 9) + 1;

        // それぞれの比が既約であること
        if (gcd(p, q) !== 1) continue;
        if (gcd(r, s) !== 1) continue;

        // 全体の分割数が異なること
        if (p + q === r + s) continue;

        // 分割数同士が互いに素であること
        if (gcd(p + q, r + s) !== 1) continue;

        // BCが正になること
        if (q * r <= p * s) continue;
       
        // 分割数が17になる問題は除外
        if (p + q === 17) continue;
        if (r + s === 17) continue;
       
        // 答えを計算
        const x = p * (r + s);
        const y = q * r - p * s;
        const z = s * (p + q);

        answer = reduceRatio3(x, y, z);

        // 直前と同じ問題を避ける
        const key = `${p}:${q}:${r}:${s}`;

        if (key === previousQuestionKey) continue;

        previousQuestionKey = key;

        break;
    }

    return {
        p,
        q,
        r,
        s,
        answer
    };
}


/* =========================
   問題表示
========================= */

function displayQuestion() {

    const { p, q, r, s } = currentQuestion;

    // 問題文
    document.getElementById("question").innerHTML = `
        AB : BD = ${p} : ${q}<br>
        AC : CD = ${r} : ${s}
    `;

    // 点A,B,C,Dの図
    document.getElementById("point-diagram").innerHTML = `
        <svg viewBox="0 0 320 100"
             xmlns="http://www.w3.org/2000/svg">

            <line x1="20" y1="45"
                  x2="300" y2="45"
                  stroke="#64748B"
                  stroke-width="2.5"/>

            <g fill="#347BB8">
                <circle cx="20" cy="45" r="5"/>
                <circle cx="100" cy="45" r="5"/>
                <circle cx="210" cy="45" r="5"/>
                <circle cx="300" cy="45" r="5"/>
            </g>

            <g fill="#263B50"
               font-size="14"
               text-anchor="middle"
               font-weight="600">

                <text x="20" y="25">A</text>
                <text x="100" y="25">B</text>
                <text x="210" y="25">C</text>
                <text x="300" y="25">D</text>

            </g>

            <g fill="#718399"
               font-size="12"
               text-anchor="middle">

                <text x="60" y="70">AB</text>
                <text x="155" y="70">BC</text>
                <text x="255" y="70">CD</text>

            </g>

        </svg>
    `;
}


/* =========================
   解答欄の初期化
========================= */

function resetAnswer() {

    ["answer-a", "answer-b", "answer-c"].forEach(id => {

        const input = document.getElementById(id);

        input.value = "";
        input.disabled = false;

    });

    const result = document.getElementById("result");

    result.textContent = "";
    result.className = "";

    document.getElementById("check-button").disabled = false;
    document.getElementById("next-button").hidden = true;

    answered = false;
}


/* =========================
   解答判定
========================= */

function checkAnswer() {

    // 二重採点防止
    if (answered) return;

    const a = Number(document.getElementById("answer-a").value);
    const b = Number(document.getElementById("answer-b").value);
    const c = Number(document.getElementById("answer-c").value);

    // 入力チェック
    if (
        !Number.isSafeInteger(a) ||
        !Number.isSafeInteger(b) ||
        !Number.isSafeInteger(c) ||
        a <= 0 || b <= 0 || c <= 0
    ) {

        document.getElementById("result").textContent =
            "正の整数を3つ入力してください。";

        document.getElementById("result").className = "incorrect";

        return;
    }

    answered = true;

    const correctAnswer = currentQuestion.answer;

    // 既約比であること
    const isReduced = gcd3(a, b, c) === 1;

    // 正解判定
    const isCorrect =
        isReduced &&
        a === correctAnswer[0] &&
        b === correctAnswer[1] &&
        c === correctAnswer[2];

    const result = document.getElementById("result");

    stats.total++;

    if (isCorrect) {

        stats.correct++;
        stats.streak++;

        stats.bestStreak = Math.max(
            stats.bestStreak,
            stats.streak
        );

        result.textContent = "正解！よくできました！";
        result.className = "correct";

    } else {

        stats.streak = 0;

        result.textContent =
            `不正解。正解は ${correctAnswer.join(" : ")} です。`;

        result.className = "incorrect";

    }

    // 回答後は入力をロック
    ["answer-a", "answer-b", "answer-c"].forEach(id => {
        document.getElementById(id).disabled = true;
    });

    document.getElementById("check-button").disabled = true;
    document.getElementById("next-button").hidden = false;

}


/* =========================
   次の問題
========================= */

function nextQuestion() {

    currentQuestion = generateQuestion();

    resetAnswer();
    displayQuestion();

}


/* =========================
   イベント登録・初期化
========================= */

document.getElementById("check-button")
    .addEventListener("click", checkAnswer);

document.getElementById("next-button")
    .addEventListener("click", nextQuestion);

// Enterキーで答え合わせ
document.querySelectorAll(".answer-inputs input")
    .forEach(input => {

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                checkAnswer();
            }

        });

    });

// 初回問題
nextQuestion();

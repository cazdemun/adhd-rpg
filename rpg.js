const cliProgress = require('cli-progress');
const _colors = require('colors');
// http://howtomakeanrpg.com/a/how-to-make-an-rpg-levels.html
const nextLevel = (level) => 300 + Math.round(0.04 * (level ^ 3) + 0.8 * (level ^ 2) + 2 * level)

const calculateProgress = totalExperience => {
  // console.log(totalExperience);
  // console.table([...Array(20).keys()]
  //   .map(x => nextLevel(x)))

  let exp = totalExperience;
  let remainingExp = 0;
  let initialLevel = 0;
  while (exp > 0) {
    const expToNextLevel = nextLevel(initialLevel);
    // console.log(initialLevel, expToNextLevel);
    if (exp > expToNextLevel) {
      exp = exp - expToNextLevel;
      initialLevel = initialLevel + 1;
    } else if (exp < expToNextLevel) {
      remainingExp = exp;
      exp = -1;
    }
  }
  // console.log(exp, remainingExp, initialLevel);

  // create new progress bar
  const b1 = new cliProgress.SingleBar({
    format: 'Progress Lvl. {level} |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Exp || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  // initialize the bar - defining payload token "speed" with the default value "N/A"
  b1.start(nextLevel(initialLevel), 0, {
    speed: "god",
    level: initialLevel
  });

  // update values
  // b1.increment();
  b1.update(Number(remainingExp.toFixed(2)));

  // stop the bar
  b1.stop();
}

if (require.main === module) {
  [150,
    301.5,
    454.5,
    609,
    765,].map(x => calculateProgress(x))

}

module.exports = {
  nextLevel,
  calculateProgress
}
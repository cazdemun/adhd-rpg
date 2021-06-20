const sound = require("sound-play");
const path = require("path");
const miniDB = require("./miniDb");
const rpg = require("./rpg");
const { RSA_NO_PADDING } = require("constants");

const timer = (secs, cb) => new Promise((resolve, reject) => {
  let seconds = secs;
  console.log('Seconds left:', seconds);
  const interval = setInterval(() => {
    seconds = seconds - 1;
    console.log('Seconds left:', seconds);
    if (seconds <= 0) {
      resolve();
      clearInterval(interval);
    }
  }, 1000)
})

const generateSession = (periods, initialSeconds) => [...Array(periods - 1).keys()]
  .reduce((acc, _) => {
    const [last] = [...acc].reverse();
    if (last !== undefined) {
      const incrementedValue = Math.round(last * 1.01 * 100) / 100;
      return acc.concat([incrementedValue]);
    } else return [x];
  }, [initialSeconds]);

// Global variables

const techAlertSoundPath = path.join(__dirname, "hi-tech-alert.mp3");
const notificationSoundPath = path.join(__dirname, "playful-notification.mp3");

const initialWorkTime = 15; // seconds


const startSession = async (realmName, tasks, restTime, extraTime) => {

  const realm = await miniDB.getRealm(realmName);
  miniDB.printRealmAsTable(realm);
  if (realm.sessionsInitialTime.length - 1 === realm.current_session) {
    console.log('Session already completed!')
    return;
  }
  rpg.calculateProgress(realm.totalExperience);
  const initialWorkTime = realm.sessionsInitialTime[realm.current_session];
  const schedule = generateSession(tasks, initialWorkTime); // generateSessionsInitialTime

  const sessionDurationSeconds = schedule
    .map(x => Math.ceil(x) + extraTime)
    .reduce((acc, x) => acc + x, 0); // seconds
  const sessionDurationMinutes = Math.round((sessionDurationSeconds / 60) * 100) / 100;

  console.log('\nWelcome, sir, the current schedule for session', realm.current_session, 'with', schedule.length, 'tasks is:')
  console.log(JSON.stringify(schedule));
  console.log('Aprox. session duration (minutes):', sessionDurationMinutes);

  console.log('\nStarting in')
  await timer(5);
  console.log('\nGo!')

  for await (const [i, taskTime] of schedule.entries()) {
    console.log('\n*', i + 1, '/', schedule.length, 'period duration:', taskTime, 'seconds');
    await sound.play(techAlertSoundPath, 1)
      .then(_ => timer(taskTime))
      .then(() => {
        console.log('work done!');
        return sound.play(notificationSoundPath, 1);
      })
      .then(_ => timer(restTime))
      .then(() => console.log('rest done!'))
      .then(() => rpg.calculateProgress(realm.totalExperience))
  }
  console.log('congratz on finishing the session!')
  await miniDB.registerSession(realmName, tasks)
    .then(_ => miniDB.getRealm(realmName))
    .then(realm => rpg.calculateProgress(realm.totalExperience));
}

// const sessionSchedule = generateSession(tasks, initialWorkTime);

const myArgs = process.argv.slice(2);
const mode = myArgs[0];

if (mode === 'work') {
  const tasks = 10;
  const restTime = 10; // 10 seconds
  const soundTime = 4; // aprox
  const extraTime = restTime + soundTime;
  startSession('work', tasks, restTime, extraTime);
} else if (mode === 'procrastination') {
  const tasks = 5;
  const restTime = 10; // 10 seconds
  const soundTime = 4; // aprox
  const extraTime = restTime + soundTime;
  startSession('procrastination', tasks, restTime, extraTime);
} else {
  console.warn('[WARNING] No realm found (yet)!')
}

// getRealm('work')
// getCurrentInitialTime(realm)
// startSession
// updateNextSession('work')

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Realm
 * //
 * @property {string} name - Indicates whether the Courage component is present.
 * @property {Date} creation - Indicates when realm has been created or recreated.
 * @property {Date} modification - *Indicates when certain properties of realm have been modified (name)
 * @property {number[]} sessionsInitialTime -
 * @property {SessionRecord[]} sessionsHistory -
 * @property {number} firstInitialTime -
 * @property {number} nextSessionInitialTime -
 * @property {number} totalExperience -
 * @property {string} cueURI - *
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} SessionRecord
 * @property {number} index -
 * @property {number} initialTime -
 * @property {number} tasks -
 * @property {Date} finish -
 */

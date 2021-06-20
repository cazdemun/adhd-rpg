const Datastore = require('nedb');
const path = require("path");

const dataStorePath = path.join(__dirname, "data/datafile.db");
const sessionsStorePath = path.join(__dirname, "data/sessions.db");
const db = {
  general: new Datastore({ filename: dataStorePath, autoload: true }),
  sessions: new Datastore({ filename: sessionsStorePath, autoload: true }),
}

// cli --realm 'work' --tasks 10
// cli --realm '' --tasks 10

const generateSession = (tasks, initialTime) => [...Array(tasks - 1).keys()]
  .reduce((acc, _) => {
    const [last] = [...acc].reverse();
    if (last !== undefined) {
      const incrementedValue = Math.round(last * 1.01 * 100) / 100;
      return acc.concat([incrementedValue]);
    } else return [x];
  }, [initialTime]);

// Realm Utilities

const getRealm_ = (db) => name => new Promise((resolve, reject) => {
  db.findOne({ name }, (err, doc) => {
    if (err)
      reject(err);
    else
      resolve(doc);
  })
})

const getRealm = getRealm_(db.sessions);

const createRealm_ = (db) => (name, numberOfSessions = 10, initialTime = 10) => new Promise((resolve, reject) => {
  const realmDoc = {
    name: name,
    current_session: 0,
    modification: new Date(),
    sessionsInitialTime: generateSession(numberOfSessions, initialTime),
    sessionsHistory: [],
    totalExperience: 0
  }

  db.update({ name: name }, realmDoc, { upsert: true }, (err, doc) => {
    if (err)
      reject(err);
    else
      resolve(doc);
  })
})

const createRealm = createRealm_(db.sessions);

const updateRealm_ = (db) => (name, toUpdate) => new Promise((resolve, reject) => {
  db.update({ name: name }, toUpdate, (err, doc) => {
    if (err)
      reject(err);
    else
      resolve(doc);
  })
})

const updateRealm = updateRealm_(db.sessions);

const calculateTotalExperienceFromHistory = sessionsHistory => sessionsHistory
  .reduce((acc, x) => acc + x.initialTime * x.tasks, 0)

const registerSession = (name, taskInSession) => new Promise((resolve, reject) => {
  getRealm(name)
    .then(doc => {
      if (doc.sessionsInitialTime.length - 1 === doc.current_session)
        reject(new Error('All sessions are completed!'))
      else
        return [doc.current_session,
        doc.sessionsInitialTime[doc.current_session],
        calculateTotalExperienceFromHistory(doc.sessionsHistory)
        ]
    })
    .then(([current_session, initialTime, totalExperience]) => updateRealm(name, {
      $set: {
        current_session: current_session + 1,
        totalExperience: totalExperience + initialTime * taskInSession
      },
      $push: {
        sessionsHistory: {
          index: current_session,
          initialTime: initialTime,
          tasks: taskInSession,
          finish: new Date(),
        }
      }
    }))
    .then(_ => getRealm(name))
    .then(res => resolve(res))
    .catch(err => reject(err))

})

const printRealmAsTable = (realm) => {
  console.table({
    ...realm,
    modification: realm.modification
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, ''),
    sessionsInitialTime: realm.sessionsInitialTime.length.toString() + ' elements',
    sessionsHistory: realm.sessionsHistory.length.toString() + ' elements',
    firstSessionInitialTime: realm.sessionsInitialTime[0],
    nextSessionInitialTime: realm.sessionsInitialTime[realm.current_session],
  })
  return realm;
}

if (require.main === module) {
  const numberOfSessions = 100; // 10
  const initialTime = 15; //
  // createRealm('work', numberOfSessions, initialTime)
  Promise.resolve()
    .then(_ => getRealm('work'))
    .then(res => printRealmAsTable(res))
    .catch(err => console.log(err));
  Promise.resolve()
    .then(_ => getRealm('procrastination'))
    .then(res => printRealmAsTable(res))
    .catch(err => console.log(err));

  createRealm('test', 100, 15)
    .then(_ => getRealm('test'))
    .then(res => printRealmAsTable(res))
    .then(_ => registerSession('test', 10))
    .then(res => console.log(res.totalExperience))
    .then(_ => registerSession('test', 10))
    .then(res => console.log(res.totalExperience))
    .then(_ => registerSession('test', 10))
    .then(res => console.log(res.totalExperience))
    .then(_ => registerSession('test', 10))
    .then(res => console.log(res.totalExperience))
    .then(_ => registerSession('test', 10))
    .then(res => console.log(res.totalExperience))
    .catch(err => console.log(err));

  // console.log(generateSession(100, 20));
  // createRealm(db.sessions)('work', 100, 20)
  // const numberOfSessions = 3; // 10
  // const initialTime = 5; //
  // createRealm('work', numberOfSessions, initialTime)
  //   .then(_ => getRealm('work'))
  //   // .then(res => console.log(res))
  //   // .then(_ => registerSession('work', 10))
  //   // .then(_ => registerSession('work', 10))
  //   // .then(_ => registerSession('work', 10))
  //   // .then(_ => registerSession('work', 10))
  //   .then(res => console.table(res))
  //   .catch(err => console.log(err));

  // console.table([
  //   { index: 3, text: 'I would like some gelb bananen bitte', value: 100 },
  //   { index: 4, text: 'I hope batch update is working', value: 300 },
  // ]);

  // const open = require('open');

  // // opens the url in the default browser
  // open('http://www.youtube.com/watch?v=G9RA5v9Hy44');
  // open('https://www.youtube.com/watch?v=2OqigCz2S1w');
}

module.exports = {
  getRealm: getRealm,
  registerSession: registerSession,
  createRealm: createRealm,
  updateRealm: updateRealm,
  printRealmAsTable: printRealmAsTable
}
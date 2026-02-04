const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetMatches() {
  try {
    // Query only rows where deleted === false
    console.log("Starting reset...");
    const snapshot = await db.collection("matches_prod").where("deleted", "==", false).get();
    console.log("Found", snapshot.size, "matches");
    
    if (snapshot.empty) {
      console.log("No matches to reset.");
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { deleted: true }); // set deleted = true
    });

    await batch.commit();
    console.log(`${snapshot.size} matches marked as deleted.`);
  } catch (err) {
    console.error("Error resetting matches:", err);
  }
}

resetMatches();

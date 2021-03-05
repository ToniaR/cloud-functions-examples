const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Storage} = require("@google-cloud/storage");
const gsc = new Storage();
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs-extra");

admin.initializeApp();

// simple "Hello world" start function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase Folks 👋");
});

// add "timepstamp" record to firestore
// when user was authenticated by the first time
exports.addUser = functions.auth.user().onCreate((user) => {
  admin.firestore().collection("users").add({
    email: user.email,
    displayName: user.displayName,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("The user was created");
});

// change word to specific symbol when document was created
exports.onQuoteCreate = functions.firestore
    .document("quotes/{quoteId}")
    .onCreate((snap, context) => {
      const quoteData = snap.data();
      const text = addDonuts(quoteData.text);
      return snap.ref.update({
        text: text,
      });
    });
/**
 *
 * @param {string} text
 * @return {string}
 */
function addDonuts(text) {
  return text.replace(/\bdonut\b/g, " 🍩 ");
}

// counting average rate for each item in "quotes" firestore collection
exports.updateQuoteRating = functions.firestore
    .document("quotes/{quoteId}/ratings/{id}")
    .onWrite(async (change) => {
      const a = await updateRating(change);
      return a;
    });

/**
 *
 * @param {string} change
 * @return {*}
 */
async function updateRating(change) {
  const quoteRatingRef = change.after.ref.parent;
  let numRatings = 0;
  let total = 0;
  const docRefs = await quoteRatingRef.listDocuments();
  for (const docRef of docRefs) {
    const snapshot = await docRef.get();
    const data = snapshot.data();
    if (data !== undefined) {
      total += data.rating;
      numRatings++;
    }
  }

  const averageRating = total /numRatings;

  const quoteRef = quoteRatingRef.parent;

  console.log(`${quoteRef.path} now ha 
  ${numRatings} ratings with a ${averageRating} average`);

  await quoteRef.update({
    averageRate: averageRating,
    rates: numRatings,
  });
}

// generate thumbnail when upload image to firebase storage
exports.generateThumbnail = functions.storage
    .object()
    .onFinalize(async (object) => {
      // tell cloudStorage client which bucket to use to upload file
      const bucket = gsc.bucket(object.bucket);
      const filePath = object.name;
      const fileName = filePath.split("/").pop();
      const bucketDir = path.dirname(filePath);

      const workingDir = path.join(os.tmpdir(), "thumbs");
      const tmpFilePath = path.join(workingDir, "source.png");

      if (fileName.includes("thumb@") ||

      !object.contentType.includes("image")) {
        console.log("exiting function");
        return false;
      }

      // 1. Make sure thumbnail dir exists
      await fs.ensureDir(workingDir);

      // 2. Download Source File
      await bucket.file(filePath).download({
        destination: tmpFilePath,
      });

      // 3. Resize the images and define array of upload promises
      const sizes = [64, 128, 256];

      const uploadPromises = sizes.map(async (size) => {
        const thumbName = `thumb@${size}_${fileName}`;
        const thumbPath = path.join(workingDir, thumbName);

        // Resize source image
        await sharp(tmpFilePath)
            .resize(size, size)
            .toFile(thumbPath);

        // Upload to Google Cloud Storage
        return bucket.upload(thumbPath, {
          destination: path.join(bucketDir, thumbName),
        });
      });

      // 4. Run the upload operations
      await Promise.all(uploadPromises);
      // 5. Delete files from the file system
      return fs.remove();
    });

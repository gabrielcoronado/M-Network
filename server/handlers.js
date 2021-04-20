const admin = require("firebase-admin");
const fetch = require("node-fetch");
require("dotenv").config();
const key = process.env.REACT_APP_TMDB_KEY;
const { MongoClient, ObjectID } = require("mongodb");
const { MONGO_URI } = process.env;
const assert = require("assert");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

/////////////////////    FIREBASE    //////////////////////

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT
  }),
  databaseURL: process.env.FB_DATABASE_URL
});
const db = admin.database();

const queryDatabase = async key => {
  const ref = db.ref(key);
  let data;
  await ref.once(
    "value",
    snapshot => {
      data = snapshot.val();
    },
    err => {
      console.log(err);
    }
  );

  return data;
};

const getUser = async email => {
  const data = (await queryDatabase(`appUsers`)) || {};
  const dataValue = Object.keys(data)
    .map(item => data[item])
    .find(obj => obj.email === email);

  return dataValue || false;
};

const createUser = async (req, res) => {
  const returningUser = await getUser(req.body.email);
  console.log(returningUser);

  if (returningUser) {
    const user = await getUserFromDB({ email: req.body.email });
    res
      .status(200)
      .json({ status: 200, data: user, message: "returning user" });
    return;
  } else {
    const appUsersRef = db.ref("appUsers");

    appUsersRef.push(req.body).then(async () => {
      const user = await createNewUser(req.body);

      res.status(200).json({
        status: 200,
        data: user,
        message: "new user"
      });
    });
  }
};
////////////////////////////////////////////////////////////

//////////////   CONNECTING TO MONGO DB    /////////////////
const dbConnect = async () => {
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  console.log("Connected!");
  const db = client.db("c-network");

  return { client, db };
};

/// MOVIE RESPONSES TO SHORTEN REPETIVIVE LINES OF CODE ///

const handleResult = (client, result, data, res) => {
  if (result) {
    res.status(201).json({ status: 201, data: result });
  } else {
    res.status(500).json({ status: 500, data: data, message: err.message });
  }
  client.close();
  console.log("Disconnected!");
};

const handleMovieDbResponse = (data, res) => {
  // console.log("data", data);
  data
    ? res.status(200).json({ status: 200, data: data })
    : res.status(400).json({ status: 400, message: "no data" });
};
//////////////////////////////////////////////////////////

const getUserFromDB = async ({ email, userId }) => {
  if (!email && !userId) {
    return null;
  }
  try {
    const { client, db } = await dbConnect();

    const match = email ? { email } : { _id: ObjectID(userId) };

    console.log("email", email);
    //aggregate lets us use the lookup which allows us to match/import data from other collections
    const result = await db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "followingObject"
          }
        },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewsObject"
          }
        },
        { $match: match }
      ])
      .toArray();
    console.log("result", result);

    client.close();
    console.log("Disconnected!");

    if (result) {
      console.log("result", result);
      return result[0];
    } else {
      return null;
    }
  } catch (err) {
    console.log(err.stack);
  }
};

/// GET DAILY TRENDS ///

const dailyTrend = async (req, res) => {
  const api_url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`;
  const fetch_response = await fetch(api_url);
  const data = await fetch_response.json();

  handleMovieDbResponse(data, res);
};

/// GET WEEKLY TRENDS ///

const weeklyTrend = async (req, res) => {
  const api_url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`;
  const fetch_response = await fetch(api_url);
  const data = await fetch_response.json();

  handleMovieDbResponse(data, res);
};

/// GET ALL GENRES ///

const getAllGenres = async (req, res) => {
  const api_url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${key}&language=en-US`;
  const fetch_response = await fetch(api_url);
  const data = await fetch_response.json();

  handleMovieDbResponse(data, res);
};

//GET INFORMATION OF A SINGLE MOVIE ///

const getSingleMoviebyId = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  const api_url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&language=en-US`;
  const fetch_response = await fetch(api_url);
  const data = await fetch_response.json();

  handleMovieDbResponse(data, res);
};

//To Do

const getMovieByQuery = async (req, res) => {
  try {
    const { query } = req.params;
    console.log("query", query);

    const api_url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${query}`;

    const fetch_response = await fetch(api_url);
    const data = await fetch_response.json();

    handleMovieDbResponse(data, res);
  } catch (err) {
    console.log("error", err);
  }
};

//GET ALL REVIEWS BY USER ///

const getReviewsByUser = async (req, res) => {
  try {
    const { client, db } = await dbConnect();
    const { reviewersId } = req.query;
    console.log("query", req.query);
    //aggregate lets us use the lookup which allows us to match/import data from other collections
    const result = await db
      .collection("reviews")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "reviewerId",
            foreignField: "_id",
            as: "reviewer"
          }
        },
        {
          $match: {
            reviewerId: {
              $in: reviewersId.split(",").map(reviewer => ObjectID(reviewer))
            }
          }
        }
      ])
      .sort({ createdAt: -1 })
      .toArray();

    handleResult(client, result, req.body, res);
  } catch (err) {
    console.log(err.stack);
  }
};

/// CREATE A NEW POST ///

const newReview = async (req, res) => {
  try {
    const { client, db } = await dbConnect();

    const { currentUser, comment, rating, id } = req.body;

    const result = await db.collection("reviews").insertOne({
      movie_id: id,
      reviewerId: ObjectID(currentUser._id),
      comment,
      rating,
      createdAt: new Date()
    });
    assert.equal(1, result.insertedCount);

    const reviewId = result.ops[0]._id;

    const result2 = await db
      .collection("users")
      .updateOne(
        { _id: ObjectID(currentUser._id) },
        { $addToSet: { reviews: ObjectID(reviewId) } }
      );

    handleResult(client, result, req.body, res);
  } catch (err) {
    console.log(err.stack);
  }
};

/// CREATE A USER DB ///

const createNewUser = async ({ email, displayName, photoURL }) => {
  const { client, db } = await dbConnect();

  const result = await db.collection("users").insertOne({
    name: displayName,
    email,
    photoURL,
    following: [],
    seen: [],
    blacklist: []
  });

  client.close();
  console.log("Disconnected!");

  if (result) {
    return result;
  } else {
    console.log("error in createNewUser", result);
    return null;
  }
};

/// FOLLOW USER ///

const followUser = async (req, res) => {
  const { client, db } = await dbConnect();

  const userToFollowId = req.params.id;

  const { currentUser } = req.body;

  const result = await db
    .collection("users")
    .updateOne(
      { _id: ObjectID(currentUser._id) },
      { $addToSet: { following: ObjectID(userToFollowId) } }
    );

  handleResult(client, result, req.body, res);
};

/// UNFOLLOW USER ///

const unfollowUser = async (req, res) => {
  const { client, db } = await dbConnect();

  const userToUnfollowId = req.params.id;

  const { currentUser } = req.body;

  const result = await db
    .collection("users")
    .updateOne(
      { _id: ObjectID(currentUser._id) },
      { $pullAll: { following: [ObjectID(userToUnfollowId)] } }
    );

  handleResult(client, result, req.body, res);
};

/// BLACKLIST A MOVIE ///

const blacklistMovie = async (req, res) => {
  const { client, db } = await dbConnect();

  const movieToBlacklist = req.params.id;

  const { currentUser } = req.body;
  console.log("currentUser", currentUser);

  const result = await db
    .collection("users")
    .updateOne(
      { _id: ObjectID(currentUser._id) },
      { $addToSet: { blacklist: movieToBlacklist } }
    );

  handleResult(client, result, req.body, res);
};

/// MARK A MOVIE AS SEEN ///

const markMovieAsSeen = async (req, res) => {
  const { client, db } = await dbConnect();

  const seenMovie = req.params.id;

  const { currentUser } = req.body;

  const result = await db
    .collection("users")
    .updateOne(
      { _id: ObjectID(currentUser._id) },
      { $addToSet: { seen: seenMovie } }
    );

  handleResult(client, result, req.body, res);
};

/// GET USER DATA ///

const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await getUserFromDB({ userId });
    console.log("user", user);

    if (user) {
      res.status(201).json({ status: 201, data: user });
    } else {
      res.status(500).json({
        status: 500,
        data: { userId },
        message: "Error while getting user data"
      });
    }
  } catch (err) {
    console.log(err.stack);
  }
};

const searchUsers = async (req, res) => {
  try {
    const { client, db } = await dbConnect();

    const { name } = req.query;

    const regex = new RegExp(name, "i");
    const result = await db
      .collection("users")
      .find({ name: { $regex: regex } })
      .toArray();

    const users = result.map(user => {
      return {
        name: user.name,
        photoURL: user.photoURL,
        reviewsCount: user.reviews && user.reviews.length
      };
    });

    handleResult(client, users, req.query, res);

    console.log("search result", result);
  } catch (err) {
    console.log(err.stack);
  }
};

const getUserRanking = async (req, res) => {
  try {
    const { client, db } = await dbConnect();

    const result = await db
      .collection("users")
      .find()
      .toArray();

    const users = result.map(user => {
      return {
        name: user.name,
        photoURL: user.photoURL,
        reviewsCount: user.reviews && user.reviews.length
      };
    });

    const userRanking = users.sort((user1, user2) => {
      if (user1.reviewsCount < user2.reviewsCount) {
        return 1;
      } else if (user1.reviewsCount > user2.reviewsCount) {
        return -1;
      } else {
        return 0;
      }
    });
    console.log("userRanking", userRanking);

    handleResult(client, userRanking, req.query, res);
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = {
  dailyTrend,
  getSingleMoviebyId,
  weeklyTrend,
  getReviewsByUser,
  newReview,
  createNewUser,
  followUser,
  unfollowUser,
  getUserData,
  blacklistMovie,
  markMovieAsSeen,
  getAllGenres,
  getMovieByQuery,
  createUser,
  searchUsers,
  getUserRanking
};

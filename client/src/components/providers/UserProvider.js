import React, { createContext, useEffect, useState } from "react";
import withFirebaseAuth from "react-with-firebase-auth";
import firebase from "firebase/app";
import "firebase/auth";

export const UserContext = createContext(null);

var firebaseConfig = {
  apiKey: "AIzaSyAopvg1mEkhrSBFul49i8xiEyVgDpMuE60",
  authDomain: "c-network-e52f3.firebaseapp.com",
  projectId: "c-network-e52f3",
  storageBucket: "c-network-e52f3.appspot.com",
  messagingSenderId: "491793447664",
  appId: "1:491793447664:web:2b1c12ccecfeb647c6e035"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAppAuth = firebaseApp.auth();
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider()
};

const UserProvider = ({ children, signInWithGoogle, signOut, user }) => {
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [moviePath, setMoviePath] = useState("");
  const [userPath, setUserPath] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [appUser, setAppUser] = useState({});
  const [message, setMessage] = useState("");
  const [ranking, setRanking] = useState();
  const [feed, setFeed] = useState();

  const handleSignOut = () => {
    signOut();
    setAppUser({});
  };

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:4000/login`, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        })
      })
        .then(res => {
          // console.log("RES", res);
          return res.json();
        })
        .then(json => {
          setAppUser(json.data);
          setCurrentUser(json.data);
          console.log("JSON", json.data);
          setMessage(json.message);
        });
    }
  }, [user]);

  const handleBlacklist = async () => {
    const res = await fetch(
      `http://localhost:4000/movies/${moviePath}/blacklist`,
      {
        method: "PUT",
        body: JSON.stringify({
          currentUser
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );
    const data = await res.json();
    console.log("blacklisted", data);
  };

  const handleSeen = async () => {
    const res = await fetch(`http://localhost:4000/movies/${moviePath}/seen`, {
      method: "PUT",
      body: JSON.stringify({
        currentUser
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    const data = await res.json();
    console.log("seen", data);
  };

  const handleFollow = async () => {
    const res = await fetch(`/users/${userPath}/follow`, {
      method: "PUT",
      body: JSON.stringify({
        currentUser
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    const data = await res.json();
    console.log("seen", data);
  };

  const handleUnfollow = async () => {
    const res = await fetch(`/users/${userPath}/unfollow`, {
      method: "PUT",
      body: JSON.stringify({
        currentUser
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    const data = await res.json();
    console.log("seen", data);
  };

  ////// SET RANKING //////
  useEffect(() => {
    fetch(`http://localhost:4000/users/ranking`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }).then(res =>
      res.json().then(data => {
        // console.log("raking", data.data);
        setRanking(data.data);
      })
    );
  }, []);

  //////////////// GET ALL REVIEWS //////////////////

  // useEffect(() => {
  //   fetch(`http://localhost:4000/feed`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json"
  //     }
  //   }).then(res =>
  //     res.json().then(data => {
  //       console.log("feed", data.data);
  //       setFeed(data.data);
  //     })
  //   );
  // }, []);

  return (
    <UserContext.Provider
      value={{
        searchSubmitted,
        searchInput,
        setSearchInput,
        setSearchSubmitted,
        handleSeen,
        handleBlacklist,
        setMoviePath,
        signInWithGoogle,
        appUser,
        handleSignOut,
        message,
        currentUser,
        ranking,
        setUserPath,
        handleUnfollow,
        handleFollow,
        feed
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default withFirebaseAuth({
  providers,
  firebaseAppAuth
})(UserProvider);

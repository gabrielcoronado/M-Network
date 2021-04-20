import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserInfo from "./UserInfo";
import Reviews from "./Reviews";
import MovieCard from "./MovieCard";
import { UserContext } from "./providers/UserProvider";
import {
  ProfileWrapper,
  FeedWrapper,
  Filters,
  Button
} from "./styling/ProfileStyles";
import { CardWrapper } from "./styling/MovieResultsStyles";

const Profile = () => {
  const { setUserPath } = useContext(UserContext);
  const [user, setUser] = useState();
  const [selectedTab, setSelectedTab] = useState("feed");
  const { id } = useParams();
  setUserPath(id);

  useEffect(() => {
    fetch(`http://localhost:4000/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }).then(res =>
      res.json().then(data => {
        console.log("user", data.data);
        setUser(data.data);
      })
    );
  }, []);

  return user ? (
    <ProfileWrapper>
      <FeedWrapper>
        <UserInfo user={user} />
        <Filters>
          <Button
            style={
              selectedTab === "feed"
                ? { borderBottom: "1px solid rgb(255, 128, 55)" }
                : null
            }
            onClick={() => setSelectedTab("feed")}
          >
            Feed
          </Button>
          <Button
            style={
              selectedTab === "blacklist"
                ? { borderBottom: "1px solid rgb(255, 128, 55)" }
                : null
            }
            onClick={() => setSelectedTab("blacklist")}
          >
            Blacklist
          </Button>
          <Button
            style={
              selectedTab === "seen"
                ? { borderBottom: "1px solid rgb(255, 128, 55)" }
                : null
            }
            onClick={() => setSelectedTab("seen")}
          >
            Seen
          </Button>
        </Filters>
        {selectedTab === "feed" ? (
          <Reviews reviews={user.reviewsObject} user={user} />
        ) : selectedTab === "seen" ? (
          <CardWrapper>
            {user.seen.map(movieid => {
              return <MovieCard movieid={movieid} key={movieid} />;
            })}
          </CardWrapper>
        ) : selectedTab === "blacklist" ? (
          <CardWrapper>
            {user.blacklist.map(movieid => {
              return <MovieCard movieid={movieid} key={movieid} />;
            })}
          </CardWrapper>
        ) : null}
      </FeedWrapper>
    </ProfileWrapper>
  ) : null;
};

export default Profile;

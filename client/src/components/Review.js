import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import profile from "./assets/PaiMei.jpeg";
import Rating from "./post/Rating";
import moment from "moment";
import {
  Wrapper,
  Img,
  Poster,
  User,
  Title,
  Tag,
  RatingWrapper,
  Comment,
  PostData,
  Date
} from "./styling/ReviewStyles";

const Review = ({ review }) => {
  const history = useHistory();
  const [movie, setMovie] = useState();
  const base_url = `https://image.tmdb.org`;
  const posterSize = `/t/p/w500`;
  const date = moment(review.createdAt).format("DD-MM-YYYY HH:mm a");

  const handleProfile = id => {
    history.push(`/users/${id}`);
  };

  useEffect(() => {
    fetch(`/movies/${review.movie_id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }).then(res =>
      res.json().then(data => {
        // console.log("data", data);
        setMovie(data.data);
      })
    );
  }, []);

  return movie ? (
    <Wrapper key={review._id}>
      <div>
        <Poster src={base_url + posterSize + movie.poster_path} />
      </div>
      <PostData>
        <Title>{movie.title}</Title>
        <Date>{date}</Date>
        <RatingWrapper>
          <Rating rating={review.rating} size={"small"} />
        </RatingWrapper>
        <Comment>{review.comment}</Comment>
        <User onClick={() => handleProfile(review.reviewerId)}>
          <Img src={profile} />
          <Tag>{review.reviewer && review.reviewer[0].name}</Tag>
        </User>
      </PostData>
    </Wrapper>
  ) : (
    <Wrapper></Wrapper>
  );
};

export default Review;

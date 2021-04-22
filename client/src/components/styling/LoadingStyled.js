import styled from "styled-components";

export const LoadingPoster = styled.div`
  height: 180px;
  width: 120px;
  border-radius: 10px;
  background-image: linear-gradient(
      120deg,
      rgba(62, 63, 66, 0),
      rgba(62, 63, 66, 0.5) 50%,
      rgba(62, 63, 66, 0) 80%
    ),
    linear-gradient(#4d525a 50px, transparent 0);
  background-size: 75px 40px, 100% 40px;
  background-position: -200px 0, 0px 0px;
  animation: titleShine 1.2s infinite;

  @keyframes titleShine {
    to {
      background-position: 120% 0, 0px 0px;
    }
  }
`;

export const LoadingTitle = styled.div`
  height: 25px;
  width: 195px;
  border-radius: 10px;
  background-image: linear-gradient(
      120deg,
      rgba(62, 63, 66, 0),
      rgba(62, 63, 66, 0.5) 50%,
      rgba(62, 63, 66, 0) 80%
    ),
    linear-gradient(#4d525a 35px, transparent 0);
  background-repeat: no-repeat;
  background-size: 75px 40px, 100% 40px;
  background-position: -200px 0, 0px 0px;
  animation: titleShine 1.2s infinite;

  animation-duration: 1.2s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-fill-mode: none;
  animation-play-state: running;
  animation-name: titleShine;

  @keyframes titleShine {
    to {
      background-position: 120% 0, 0px 0px;
    }
  }
`;

export const LoadingDate = styled.div`
  margin-top: 8px;
  margin-bottom: 24px;
  border-radius: 10px;
  height: 17px;
  width: 80px;
  background-image: linear-gradient(
      120deg,
      rgba(62, 63, 66, 0),
      rgba(62, 63, 66, 0.5) 50%,
      rgba(62, 63, 66, 0) 80%
    ),
    linear-gradient(#4d525a 16px, transparent 0);
  background-repeat: no-repeat;
  background-size: 75px 40px, 100% 40px;
  background-position: -200px 0, 0px 0px;
  animation: titleShine 1.2s infinite;

  animation-duration: 1.2s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-fill-mode: none;
  animation-play-state: running;
  animation-name: titleShine;

  @keyframes titleShine {
    to {
      background-position: 120% 0, 0px 0px;
    }
  }
`;

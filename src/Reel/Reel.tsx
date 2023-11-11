import React, { useEffect, useRef, useState } from "react";
import "./Reel.css";
import { DancePost, getPosts, likePost } from "../dances-service";
import moment from "moment";

function Reel() {
  const videoRefs = useRef({}) as any;
  const [posts, setPosts] = useState<Array<DancePost & { fromNow: string }>>(
    []
  );
  const [playingVideo, setPlayingVideo] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const unsubscribe = getPosts(posts => {
      setPosts(
        posts.map((post) => ({
          ...post,
          fromNow: moment(post.createdAt.toDate()).fromNow(),
        }))
      )
    });

    return () => {
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Adjust as needed, this represents the percentage of the video that needs to be visible
    };

    const handleIntersection = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("intersect", entry.target.getAttribute("data-id"));
        }
        if (entry.isIntersecting && hasInteracted) {
          entry.target.play();
          startPlayingVideo(entry.target.getAttribute("data-id"));
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    Object.values(videoRefs.current).forEach((videoRef: any) => {
      observer.observe(videoRef);
    });

    return () => {
      observer.disconnect();
    };
  }, [posts, hasInteracted]);

  const startPlayingVideo = (id: string) => {
    setPlayingVideo(id);
    videoRefs.current[id].play();
  };

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    <div className="reels-wrapper" onClick={handleInteraction}>
      <div className="reels-content-wrapper">
        <h1 className="title">Your friends are moving! 🕺</h1>
        {posts.map((post, idx) => (
          <div className="section" key={post.id}>
            <div className="section-content">
              <div className="video-wrap">
                {playingVideo !== post.id && (
                  <button
                    className="play-button"
                    onClick={() => startPlayingVideo(post.id)}
                  >
                    <span className="material-symbols-outlined">
                      play_arrow
                    </span>
                  </button>
                )}
                <video
                  ref={(ref) => (videoRefs.current[post.id] = ref)}
                  src={post.videoPublicUrl}
                  data-id={post.id}
                  loop
                ></video>
              </div>
              <div className="meta">
                <h3 className="userName">
                  Amazing Hacker #{posts.length - idx}
                </h3>
                <div className="likes-container">
                  <button
                    className="like-button"
                    onClick={() => likePost(post.id)}
                  >
                    <span className="material-symbols-outlined meta-icon">
                      favorite
                    </span>
                  </button>
                  <span>{post.likes ?? 0}</span>
                </div>
                <h5 className="fitnessScore">
                  <span className="material-symbols-outlined meta-icon">
                    sports_score
                  </span>
                  {post.fitnessStats.score} points
                </h5>
                <h5 className="fitnessScore">
                  <span className="material-symbols-outlined meta-icon">
                    volume_up
                  </span>
                  Rick & Roll
                </h5>
                <h5 className="fitnessScore">
                  <span className="material-symbols-outlined meta-icon">
                    ecg_heart
                  </span>
                  110 BPM
                </h5>
                <h5 className="fitnessScore">
                  <span className="material-symbols-outlined meta-icon">
                    schedule
                  </span>
                  {post.fromNow}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reel;

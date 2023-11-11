import React, { useEffect, useRef, useState } from "react";
import "./Reel.css";
import { DancePost, getPosts } from "../dances-service";
import moment from "moment";

function Reel() {
  const videoRefs = useRef({}) as any;
  const [posts, setPosts] = useState<Array<DancePost & { fromNow: string }>>(
    []
  );
  const [playingVideo, setPlayingVideo] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    getPosts().then((posts) =>
      setPosts(
        posts.map((post) => ({
          ...post,
          fromNow: moment(post.createdAt.toDate()).fromNow(),
        }))
      )
    );
  }, []);

  useEffect(() => {
    const options = {
      root: document.querySelector(".reels-content-wrapper"),
      rootMargin: "0px",
      threshold: 0.5, // Adjust as needed, this represents the percentage of the video that needs to be visible
    };

    const handleIntersection = (entries: any[]) => {
      entries.forEach((entry) => {
        console.log(entry, hasInteracted);
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
                ></video>
              </div>
              <div className="meta">
                <h3 className="userName">Amazing Hacker #{idx} 👩‍💻</h3>
                <h5 className="fitnessScore">
                  {post.fitnessStats.score} points
                </h5>
                <small>{post.fromNow}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reel;

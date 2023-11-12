import React, { useEffect, useRef, useState } from "react";
import "./Reel.css";
import { DancePost, getPosts, likePost } from "../dances-service";
import moment from "moment";
import { useGameState } from "../components/GameProvider";
import { getLevelById } from "../levels";

function Reel() {
  const videoRefs = useRef({}) as any;
  const observerRef = useRef<IntersectionObserver>();

  const { appState, updateAppState } = useGameState();

  const [posts, setPosts] = useState<Array<DancePost & { fromNow: string }>>(
    []
  );
  const [playingVideo, setPlayingVideo] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const unsubscribe = getPosts((posts) => {
      setPosts(
        posts.map((post) => ({
          ...post,
          fromNow: moment(post.createdAt.toDate()).fromNow(),
        }))
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Adjust as needed, this represents the percentage of the video that needs to be visible
    };

    const handleIntersection = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasInteracted) {
          startPlayingVideo(entry.target.getAttribute("data-id"));
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    Object.values(videoRefs.current).forEach((videoRef: any) => {
      if (videoRef) {
        observer.observe(videoRef);
      }
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
        {!appState.hasPosted && (
          <div className="no-post">
            <h3 className="subtitle">You haven't posted yet</h3>
            <p>
              Get up and move - finish your daily dance to view your friends'
              moves. 🕺
            </p>

            <button
              className="sneak-peek"
              onClick={() => updateAppState?.({ hasPosted: true })}
            >
              Sneak peek
            </button>
          </div>
        )}
        {appState.hasPosted && (
          <>
            {posts.slice(0, pageSize).map((post, idx) => (
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
                      <span>{post.likes ?? 1} liked these moves</span>
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
                      {post.levelId
                        ? getLevelById(post.levelId)?.name
                        : "Rick & Roll"}
                    </h5>
                    <h5 className="fitnessScore">
                      <span className="material-symbols-outlined meta-icon">
                        ecg_heart
                      </span>
                      {post.fitnessStats.acceleration > 300
                        ? "Dynamic"
                        : "Relaxed"}{" "}
                      movements,{" "}
                      {post.fitnessStats.velocity > 200 ? "long" : "short"}{" "}
                      distance traveled
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

            {pageSize < posts.length && (
              <button
                className="sneak-peek view-more"
                onClick={() => setPageSize(pageSize + 20)}
              >
                View more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reel;

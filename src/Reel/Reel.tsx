import React, { useEffect, useRef, useState } from "react";
import "./Reel.css";
import { DancePost, getPosts } from "../dances-service";

function Reel() {
  const videoRefs = useRef({}) as any;
  const [posts, setPosts] = useState<DancePost[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string>("");

  useEffect(() => {
    getPosts().then((posts) => setPosts(posts));
  }, []);

  const startPlayingVideo = (id: string) => {
    setPlayingVideo(id);
    videoRefs.current[id].play();
  };

  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <h1>Dances</h1>
        {posts.map((post) => (
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
                ></video>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reel;

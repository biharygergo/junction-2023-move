import React, { useState, useEffect } from "react";
import './styles.css';

const funnyTexts = [
    { text: "😬 This might take for a while", id: -1 },
  { text: "⏰ Wait a second...", id: 0 },
  { text: "💻 We are working on this...", id: 1 },
  { text: "🔥 Our servers are burning...", id: 2 },
  { text: "😱 We haven't expected such nice moves...", id: 3 },
  { text: "😵‍💫 You really aced that spin...", id: 4 },
];

const UploadModal = () => {
  const [currentText, setCurrentText] = useState(funnyTexts[0].text);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % funnyTexts.length;
        setCurrentText(funnyTexts[nextIndex].text);
        return nextIndex;
      });
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="upload-modal">
      <div className="modal-content">
        <h3>Uploading your video</h3>
        <p>{currentText}</p>
      </div>
    </div>
  );
};

export default UploadModal;

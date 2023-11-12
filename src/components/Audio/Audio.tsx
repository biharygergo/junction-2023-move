import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioSrc, shouldPlay }: any) => {
    const audioRef = useRef<any>(null);

    useEffect(() => {
        if (shouldPlay && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
        else {
            audioRef.current.pause();
        }
    }, [shouldPlay]);

    return (
        <audio ref={audioRef} src={audioSrc} />
    );
};

export default AudioPlayer;

import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioSrc, shouldPlay }: any) => {
    const audioRef = useRef<any>(null);

    useEffect(() => {
        if (shouldPlay && audioRef.current) {
            audioRef.current.play();
        }
    }, [shouldPlay]);

    return (
        <audio ref={audioRef} src={audioSrc} />
    );
};

export default AudioPlayer;

import React, { useState, useEffect } from 'react'; 

const AnimatedText = ({ text, speed = 50 }) => { 
    const [displayedText, setDisplayedText] = useState(''); 
    const [index, setIndex] = useState(0); 
    
    useEffect(() => { 

        const timeoutId = setTimeout(() => 1000); // Wait for 3 seconds (3000 milliseconds)
        
        if (index < text.length) { 
            const timeoutId = setTimeout(() => { 
                setDisplayedText(displayedText + text[index]); setIndex(index + 1); 
            }, speed); 
            return () => clearTimeout(timeoutId); 
        } 
    }, [index, displayedText, text, speed]); return <div>{displayedText}</div>; };

export default AnimatedText;
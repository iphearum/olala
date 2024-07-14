import React, { useRef, useEffect, memo } from 'react';
import anime from 'animejs/lib/anime.es.js';

export const Eyes = memo(() => {
  useEffect(() => {
    // const openEyePath = 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z';
    // const closedEyePath = 'M2 12.5C2 9.46 5.46 7 10 7h4c4.54 0 8 2.46 8 5.5S18.54 17 14 17h-4c-4.54 0-8-2.46-8-4.5z';
    // anime({
    //     targets: '.ceyes svg path',
    //     d: [openEyePath, closedEyePath],
    //     direction: 'alternate',
    //     loop: true,
    //     duration: 700,
    //     easing: 'easeInOutSine',
    //   });
    anime({
      targets: '.ceyes svg circle',
      translateX: ['-5px', '5px'],
      direction: 'alternate',
      loop: true,
      duration: 700,
      easing: 'easeInOutSine',
    });
  }, []);

  return (
    <div className="ceyes">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-eye"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
  );
});

export default Eyes;

import React, { useEffect, useState } from 'react';
import './Preloader.css';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    let start = null;
    const duration = 2500; // 2.5 seconds rolling

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progressTime = timestamp - start;
      const percentage = Math.min((progressTime / duration) * 100, 100);
      
      // Easing: cubic-bezier-like curve
      const easeOutExpo = percentage === 100 ? 1 : 1 - Math.pow(2, -10 * (percentage / 100));
      setProgress(easeOutExpo * 100);

      if (progressTime < duration) {
        window.requestAnimationFrame(step);
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsHiding(true);
          setTimeout(onComplete, 800); // Wait for hide animation to finish
        }, 400);
      }
    };

    window.requestAnimationFrame(step);
  }, [onComplete]);

  // Calculate digits (0-100)
  const currentVal = Math.floor(progress);
  const hundreds = Math.floor(currentVal / 100);
  const tens = Math.floor((currentVal % 100) / 10);
  const ones = currentVal % 10;

  return (
    <div className={`premium-preloader ${isHiding ? 'hide' : ''}`}>
      <div className="preloader-content">
        <div className="preloader-text">Loading Gateway...</div>
        <div className="preloader-counter-container">
          <div className="preloader-digit-window">
            <div className="preloader-digit-column" style={{ transform: `translateY(-${hundreds * 10}%)` }}>
              {[0, 1].map((n) => <div key={n} className="digit">{n}</div>)}
              {/* Fill remaining space to keep column height consistent */}
              {[...Array(8)].map((_, i) => <div key={`empty-${i}`} className="digit empty"></div>)}
            </div>
          </div>
          <div className="preloader-digit-window">
            <div className="preloader-digit-column" style={{ transform: `translateY(-${tens * 10}%)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <div key={n} className="digit">{n}</div>)}
            </div>
          </div>
          <div className="preloader-digit-window">
            <div className="preloader-digit-column" style={{ transform: `translateY(-${ones * 10}%)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <div key={n} className="digit">{n}</div>)}
            </div>
          </div>
          <div className="preloader-percent">%</div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    // Scroll to top on location change
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

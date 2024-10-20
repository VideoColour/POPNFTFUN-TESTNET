import React, { useEffect, useRef } from 'react';
import Slider, { Settings } from 'react-slick';
import { Global } from '@emotion/react';
import { css } from '@emotion/react';

interface AccessibleSliderProps extends Settings {
  children: React.ReactNode;
}

const AccessibleSlider: React.ForwardRefRenderFunction<Slider, AccessibleSliderProps> = (props, ref) => {
  const internalRef = useRef<Slider>(null);
  const sliderRef = (ref as React.RefObject<Slider>) || internalRef;

  useEffect(() => {
    const removeAriaHidden = () => {
      if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.list) {
        const sliderElement = sliderRef.current.innerSlider.list;
        const ariaHiddenElements = sliderElement.querySelectorAll('[aria-hidden]');
        ariaHiddenElements.forEach((el) => {
          el.removeAttribute('aria-hidden');
        });
      }
    };

    // Run immediately
    removeAriaHidden();

    // Set up a MutationObserver to watch for changes
    const observer = new MutationObserver(removeAriaHidden);
    if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.list) {
      observer.observe(sliderRef.current.innerSlider.list, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-hidden']
      });
    }

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [sliderRef]);

  return <Slider ref={sliderRef} {...props} />;
};

const sliderSettings = {
  // ... other settings
  centerMode: true,
  centerPadding: '20%', // Reduce from 35% to 20%
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        centerPadding: '15%',
      }
    },
    {
      breakpoint: 768,
      settings: {
        centerPadding: '10%',
      }
    }
  ]
};

const GlobalStyles = () => {
  return (
    <Global
      styles={css`
        // ... other styles
        .slick-slide > div {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 20px; // Reduced padding
        }
        .custom-slider {
          overflow: visible !important;
          margin: 0 -20px; // Adjusted to match new padding
        }
        .slick-slide {
          transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
          opacity: 0.3;
          filter: blur(5px);
          transform: scale(0.8);
        }
        .slick-slide.slick-active {
          opacity: 0.7;
          filter: blur(2px);
          transform: scale(0.9);
        }
        .slick-slide.slick-current {
          opacity: 1;
          filter: blur(0);
          transform: scale(1);
        }
      `}
    />
  );
};

export default React.forwardRef(AccessibleSlider);

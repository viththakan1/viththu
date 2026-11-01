import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSlider = () => {
  const { banners = [], sliderSettings = { interval: 5, transitionDuration: 2 } } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Dynamic timing values from admin settings
  const intervalSeconds = Math.max(1, Number(sliderSettings?.interval) || 5);
  const transitionDurationSeconds = Math.max(0.2, Number(sliderSettings?.transitionDuration) || 2);

  // Fallback plain images if banners array is empty
  const slides = banners && banners.length > 0 ? banners : [
    {
      id: 'default-1',
      link: '/shop',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&h=1080&fit=crop'
    },
    {
      id: 'default-2',
      link: '/shop?category=Men\'s Wear',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1920&h=1080&fit=crop'
    },
    {
      id: 'default-3',
      link: '/shop?category=Sarees',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&h=1080&fit=crop'
    }
  ];

  // Dynamic Auto-scroll interval from admin settings
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [slides.length, isHovered, currentIndex, intervalSeconds]);

  // Keep index within bounds if banners change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile phones
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[83vh] min-h-[360px] overflow-hidden bg-slate-900 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Plain Slides (Pure Images, No Text Overlays) */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const SlideWrapper = slide.link ? Link : 'div';
        const wrapperProps = slide.link ? { to: slide.link } : {};

        return (
          <SlideWrapper
            key={slide.id || index}
            {...wrapperProps}
            style={{
              transition: `opacity ${transitionDurationSeconds}s ease-in-out`
            }}
            className={`absolute inset-0 block w-full h-full ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* 100% Plain Image without text or dark dimming overlay */}
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&h=1080&fit=crop';
              }}
            />
          </SlideWrapper>
        );
      })}

      {/* Navigation Arrows (Prev / Next) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Small 3-4 Pagination Dots at the bottom */}
      {slides.length > 1 && (
        <div className="absolute bottom-3.5 sm:bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-md">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white shadow-md'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Dynamic Countdown Progress Line at top */}
      {slides.length > 1 && !isHovered && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-20">
          <div
            key={`${currentIndex}-${intervalSeconds}`}
            className="h-full bg-white/70"
            style={{
              animation: `progressTimer ${intervalSeconds}s linear forwards`
            }}
          />
        </div>
      )}

      {/* Dynamic Animation Keyframe */}
      <style>{`
        @keyframes progressTimer {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

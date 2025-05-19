import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import PropTypes from 'prop-types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaExpand, FaTimes, FaChevronLeft, FaChevronRight, FaSearch, FaImages } from 'react-icons/fa';
import ImageMetadata from './ImageMetadata';

const SwiperImageCarousel = ({ images = [] }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenMetadata, setShowFullscreenMetadata] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  const openFullscreen = (idx) => {
    setFullscreenIndex(idx);
    setIsFullscreen(true);
  };

  const closeFullscreen = (e) => {
    e.stopPropagation();
    setIsFullscreen(false);
  };

  const navigateFullscreen = (direction) => {
    if (direction === 'next') {
      setFullscreenIndex((prev) => (prev + 1) % images.length);
    } else {
      setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleView = () => {
    setShowMetadata(!showMetadata);
    setTimeout(() => {
      if (showMetadata) {
        const leftButton = document.querySelector('.swiper-button-prev');
        if (leftButton) {
          leftButton.focus();
        }
      } else {
        const metadataContainer = document.querySelector('[data-metadata-container]');
        if (metadataContainer) {
          metadataContainer.focus();
        }
      }
    }, 100);
  };

  const handleSlideChange = (swiper) => {
    setCurrentImageIndex(swiper.activeIndex);
  };

  const toggleFullscreenView = (e) => {
    e.stopPropagation();
    setShowFullscreenMetadata(!showFullscreenMetadata);
  };

  if (showMetadata) {
    return (
      <div 
        data-metadata-container
        tabIndex={-1}
        style={{ width: '100%', maxWidth: 800, margin: '0 auto', position: 'relative' }}
      >
        <div style={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          display: 'flex', 
          gap: '8px',
          zIndex: 10 
        }}>
          <button
            onClick={() => {
              setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
              setTimeout(() => {
                const metadataContainer = document.querySelector('[data-metadata-container]');
                if (metadataContainer) {
                  metadataContainer.focus();
                }
              }, 100);
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: 10,
              cursor: 'pointer',
            }}
            aria-label="Previous image"
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              setCurrentImageIndex((prev) => (prev + 1) % images.length);
              setTimeout(() => {
                const metadataContainer = document.querySelector('[data-metadata-container]');
                if (metadataContainer) {
                  metadataContainer.focus();
                }
              }, 100);
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: 10,
              cursor: 'pointer',
            }}
            aria-label="Next image"
          >
            <FaChevronRight size={18} />
          </button>
          <button
            onClick={toggleView}
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: 10,
              cursor: 'pointer',
            }}
            aria-label="Switch to carousel view"
          >
            <FaImages size={18} />
          </button>
        </div>
        <div style={{ marginTop: '60px' }}>
          <ImageMetadata 
            key={currentImageIndex}
            imageUrl={images[currentImageIndex].src} 
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        onSlideChange={handleSlideChange}
        initialSlide={currentImageIndex}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={img.src} style={{ position: 'relative', background: '#000' }}>
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: 400, objectFit: 'contain', background: '#000' }}
            />
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: '8px' }}>
              <button
                onClick={() => openFullscreen(idx)}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  padding: 10,
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                aria-label="Full screen"
              >
                <FaExpand size={18} />
              </button>
              <button
                onClick={toggleView}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  padding: 10,
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                aria-label="View image metadata"
              >
                <FaSearch size={18} />
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.97)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeFullscreen}
        >
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {showFullscreenMetadata ? (
              <div style={{ 
                width: '100%',
                height: '100%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                overflow: 'auto',
                background: '#000',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
                color: 'white'
              }}>
                <ImageMetadata imageUrl={images[fullscreenIndex].src} />
              </div>
            ) : (
              <img
                src={images[fullscreenIndex].src}
                alt={images[fullscreenIndex].alt}
                style={{
                  maxWidth: '95vw',
                  maxHeight: '95vh',
                  objectFit: 'contain',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
                  background: '#000',
                }}
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFullscreen('prev');
              }}
              style={{
                position: 'absolute',
                left: 20,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: 14,
                cursor: 'pointer',
                zIndex: 10000,
              }}
              aria-label="Previous image"
            >
              <FaChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFullscreen('next');
              }}
              style={{
                position: 'absolute',
                right: 20,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: 14,
                cursor: 'pointer',
                zIndex: 10000,
              }}
              aria-label="Next image"
            >
              <FaChevronRight size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreen(e);
              }}
              style={{
                position: 'fixed',
                top: 32,
                right: 32,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: 14,
                cursor: 'pointer',
                zIndex: 10000,
              }}
              aria-label="Close full screen"
            >
              <FaTimes size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreenView(e);
              }}
              style={{
                position: 'fixed',
                top: 32,
                right: 100,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: 14,
                cursor: 'pointer',
                zIndex: 10000,
              }}
              aria-label={showFullscreenMetadata ? "Switch to image view" : "View image metadata"}
            >
              {showFullscreenMetadata ? <FaImages size={22} /> : <FaSearch size={22} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

SwiperImageCarousel.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    })
  ),
};

export default SwiperImageCarousel; 
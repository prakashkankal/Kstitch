import React, { useRef, useState, useEffect } from 'react';

/**
 * SwipeableOrderCard - A reusable component for swipeable items with remove action
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onRemove - Callback when item is removed
 * @param {string} props.itemId - Unique identifier for the item
 * @param {number} props.threshold - Swipe threshold (0-1, default 0.4 = 40%)
 */
const SwipeableOrderCard = ({ children, onRemove, itemId, threshold = 0.4 }) => {
    const cardRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [isRemoving, setIsRemoving] = useState(false);
    const startTimeRef = useRef(0);
    const animationFrameRef = useRef(null);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        // Cleanup animation frame on unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const getClientX = (e) => {
        if (e.touches) {
            return e.touches[0].clientX;
        }
        return e.clientX;
    };

    const handleStart = (e) => {
        // Only allow right swipe (horizontal)
        // Don't interfere with vertical scrolling
        const clientX = getClientX(e);
        setStartX(clientX);
        setIsDragging(true);
        startTimeRef.current = Date.now();

        // Prevent default on touch to avoid scroll conflicts
        if (e.type === 'touchstart') {
            // Don't prevent default - let browser decide based on gesture
        }
    };

    const handleMove = (e) => {
        if (!isDragging) return;

        const clientX = getClientX(e);
        const diff = clientX - startX;

        // Only allow right swipe (positive diff)
        if (diff > 0) {
            // Use RAF for smooth animation
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(() => {
                setTranslateX(diff);
            });

            // Prevent scroll when swiping horizontally
            if (Math.abs(diff) > 10) {
                e.preventDefault();
            }
        }
    };

    const handleEnd = (e) => {
        if (!isDragging) return;

        setIsDragging(false);

        const cardWidth = cardRef.current?.offsetWidth || 0;
        const swipeDistance = translateX;
        const swipeThreshold = cardWidth * threshold;

        // Calculate velocity
        const timeDiff = Date.now() - startTimeRef.current;
        const velocity = swipeDistance / timeDiff; // px/ms

        // Trigger remove if:
        // 1. Distance exceeds threshold OR
        // 2. Velocity is high enough (fast swipe)
        const shouldRemove = swipeDistance > swipeThreshold || velocity > 0.5;

        if (shouldRemove) {
            // Animate out
            setIsRemoving(true);
            setTranslateX(cardWidth + 50); // Swipe completely off screen

            // Wait for animation, then call onRemove
            setTimeout(() => {
                onRemove(itemId);
            }, prefersReducedMotion ? 0 : 300);
        } else {
            // Snap back
            setTranslateX(0);
        }
    };

    const handleKeyDown = (e) => {
        // Keyboard accessibility: Delete or Backspace to remove
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            setIsRemoving(true);
            setTranslateX(cardRef.current?.offsetWidth + 50 || 500);

            setTimeout(() => {
                onRemove(itemId);
            }, prefersReducedMotion ? 0 : 300);
        }
    };

    // Calculate background visibility percentage
    const cardWidth = cardRef.current?.offsetWidth || 0;
    const visibilityPercent = cardWidth > 0 ? Math.min(translateX / cardWidth, 1) : 0;

    return (
        <div
            className="relative overflow-hidden"
            role="listitem"
            aria-label="Swipeable order card"
        >
            {/* Background Action Layer - Trash Icon */}
            <div
                className="absolute inset-0 bg-linear-to-r from-red-500 to-red-600 flex items-center justify-start px-6"
                style={{
                    opacity: visibilityPercent * 0.9,
                    pointerEvents: 'none'
                }}
            >
                <svg
                    className="w-6 h-6 text-white transition-transform"
                    style={{
                        transform: `scale(${0.5 + visibilityPercent * 0.5}) translateX(${translateX * 0.3}px)`
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
                <span className="ml-3 text-white font-bold text-sm">Remove from Recent</span>
            </div>

            {/* Swipeable Card Content */}
            <div
                ref={cardRef}
                className={`relative bg-white ${isRemoving ? 'opacity-0' : ''}`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging
                        ? 'none'
                        : prefersReducedMotion
                            ? 'none'
                            : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out',
                    touchAction: 'pan-y', // Allow vertical scroll, block horizontal
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart}
                onMouseMove={isDragging ? handleMove : undefined}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Swipe right to remove from Recent, or press Delete key"
            >
                {children}
            </div>
        </div>
    );
};

export default SwipeableOrderCard;

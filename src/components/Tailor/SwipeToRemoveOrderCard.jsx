import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

/**
 * SwipeToRemoveOrderCard - Enhanced swipeable component using Framer Motion
 * 
 * @param {Object} props
 * @param {Object} props.order - Order data
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onRemove - Callback when item is removed (receives orderId)
 * @param {Function} props.onUndo - Optional callback for undo action
 * @param {boolean} props.disabled - Disable swipe functionality
 */
const SwipeToRemoveOrderCard = ({ order, children, onRemove, onUndo, disabled = false }) => {
    const cardRef = useRef(null);
    const x = useMotionValue(0);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Calculate swipe progress (0 to 1)
    const swipeProgress = useTransform(x, [0, 150], [0, 1]);

    // Background opacity based on swipe progress
    const backgroundOpacity = useTransform(swipeProgress, [0, 1], [0, 0.9]);

    // Icon scale based on swipe progress
    const iconScale = useTransform(swipeProgress, [0, 1], [0.5, 1]);

    const handleDragEnd = (event, info) => {
        if (disabled) return;

        const cardWidth = cardRef.current?.offsetWidth || 0;
        const threshold = cardWidth * 0.4; // 40% threshold
        const dragDistance = info.offset.x;
        const velocity = info.velocity.x;

        // Determine if should remove based on distance or velocity
        const shouldRemove = dragDistance > threshold || velocity > 500;

        if (shouldRemove) {
            // Animate out to the right
            x.set(cardWidth + 50);

            // Call onRemove after animation
            setTimeout(() => {
                onRemove(order._id);
            }, prefersReducedMotion ? 0 : 250);
        } else {
            // Snap back to original position
            x.set(0);
        }
    };

    const handleDrag = (event, info) => {
        if (disabled) return;

        // Only allow right swipe (positive x)
        if (info.offset.x < 0) {
            x.set(0);
        }
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        // Keyboard accessibility: Delete or Backspace to remove
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            e.stopPropagation();

            const cardWidth = cardRef.current?.offsetWidth || 0;
            x.set(cardWidth + 50);

            setTimeout(() => {
                onRemove(order._id);
            }, prefersReducedMotion ? 0 : 250);
        }
    };

    if (disabled) {
        return <div ref={cardRef}>{children}</div>;
    }

    return (
        <div
            ref={cardRef}
            className="relative overflow-visible"
            role="listitem"
            aria-label={`Swipeable order card for ${order.customerName}. Press Delete or Backspace to remove from Recent, or swipe right.`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Background Action Layer - Trash Icon */}
            <motion.div
                className="absolute inset-0 bg-linear-to-r from-red-500 to-red-600 flex items-center justify-start px-6"
                style={{
                    opacity: backgroundOpacity,
                    pointerEvents: 'none'
                }}
            >
                <motion.svg
                    className="w-6 h-6 text-white"
                    style={{
                        scale: iconScale,
                        x: useTransform(x, [0, 150], [0, 45]) // Move icon slightly with swipe
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </motion.svg>
                <motion.span
                    className="ml-3 text-white font-bold text-sm"
                    style={{
                        opacity: swipeProgress,
                        x: useTransform(x, [0, 150], [-20, 0])
                    }}
                >
                    Remove from Recent
                </motion.span>
            </motion.div>

            {/* Swipeable Card Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="relative bg-white cursor-grab active:cursor-grabbing touch-pan-y"
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 500 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SwipeToRemoveOrderCard;

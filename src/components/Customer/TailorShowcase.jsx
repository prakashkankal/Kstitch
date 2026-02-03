import React from 'react';
import TailorCard from './TailorCard';

const TailorShowcase = ({ tailors, loading, hasMore }) => {
    // Display all tailors (no limit for infinite scroll)
    const displayTailors = tailors && tailors.length > 0 ? tailors : [];

    return (
        <section className="w-full bg-[#faf8f5] py-6 md:py-8">
            <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-20">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Tailors near you
                    </h2>
                </div>

                {/* Tailor Cards Grid - Airbnb Style */}
                {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
                    {displayTailors.map((tailor) => (
                        <TailorCard key={tailor._id} tailor={tailor} />
                    ))}
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black"></div>
                    </div>
                )}

                {/* No More Tailors Message */}
                {!loading && !hasMore && tailors.length > 0 && (
                    <div className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-lg font-medium text-gray-900">
                                You've seen all tailors
                            </span>
                            <span className="text-sm text-gray-500">
                                Check back later for more!
                            </span>
                        </div>
                    </div>
                )}

                {/* No Tailors Available */}
                {!loading && tailors.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <p className="text-lg font-medium text-gray-900">
                            No tailors found
                        </p>
                        <p className="text-gray-500">
                            Try adjusting your search filters
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TailorShowcase;

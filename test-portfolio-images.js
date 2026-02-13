// Test script to check portfolio image data structure
// Run this in the browser console when viewing a tailor profile

console.log('=== Testing Portfolio Image Data ===');

// Function to test portfolio images
async function testPortfolioImages(tailorId) {
    try {
        const API_URL = 'http://localhost:5000';
        console.log(`Fetching tailor data for ID: ${tailorId}`);

        const response = await fetch(`${API_URL}/api/tailors/${tailorId}`);
        const data = await response.json();

        console.log('Full tailor data:', data);
        console.log('\n=== Portfolio Data ===');
        console.log('Portfolio array:', data.portfolio);
        console.log('Portfolio length:', data.portfolio?.length || 0);

        if (data.portfolio && data.portfolio.length > 0) {
            console.log('\n=== First Portfolio Item ===');
            const firstItem = data.portfolio[0];
            console.log('Full item:', firstItem);
            console.log('Title:', firstItem.title);
            console.log('Images array:', firstItem.images);
            console.log('First image:', firstItem.images?.[0]);
            console.log('Image field:', firstItem.image);

            // Check if image URL is valid
            if (firstItem.images?.[0]) {
                console.log('\n=== Testing Image URL ===');
                console.log('Image URL:', firstItem.images[0]);

                // Try to load the image
                const img = new Image();
                img.onload = () => console.log('✓ Image loaded successfully!');
                img.onerror = () => console.error('✗ Image failed to load!');
                img.src = firstItem.images[0];
            } else {
                console.error('✗ No image URL found in first portfolio item!');
            }
        } else {
            console.log('No portfolio items found');
        }

        return data;
    } catch (error) {
        console.error('Error fetching tailor data:', error);
    }
}

// Usage: testPortfolioImages('YOUR_TAILOR_ID_HERE')
console.log('Usage: testPortfolioImages("tailorId")');
console.log('Example: testPortfolioImages("' + window.location.pathname.split('/').pop() + '")');

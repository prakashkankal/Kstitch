import { createCanvas } from 'canvas';

export const generateInvoiceImage = async (order, tailor) => {
    const width = 800;
    const padding = 40;

    // Calculate height dynamically
    // Header (150) + Card (60) + BillTo (100) + Items (N * 100) + Totals (200) + Footer (100)
    const items = order.orderItems && order.orderItems.length > 0
        ? order.orderItems
        : [{ garmentType: order.orderType || 'Custom Order', quantity: 1, totalPrice: order.price }];

    const itemsHeight = items.length * 110;
    const height = 650 + itemsHeight;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Background ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // --- Header ---
    // Tailor Info
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(tailor?.shopName || 'Tailor Shop', padding, 50);

    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText(tailor?.phone || '', padding, 75);
    const address = `${tailor?.address?.street || ''} ${tailor?.address?.city || ''}`;
    // Wrap address if too long
    if (address.length > 40) {
        ctx.fillText(address.substring(0, 40), padding, 95);
        ctx.fillText(address.substring(40), padding, 115);
    } else {
        ctx.fillText(address, padding, 95);
    }


    // Load and draw KStitch logo image
    try {
        const { loadImage } = await import('canvas');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        // Get the directory of the current file
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Build path to logo in public folder
        const logoPath = path.join(__dirname, '..', '..', 'public', 'kstitch-logo.png');
        const logo = await loadImage(logoPath);

        // Calculate logo dimensions (maintain aspect ratio)
        const logoMaxWidth = 180;
        const logoMaxHeight = 70;
        const logoAspect = logo.width / logo.height;

        let logoWidth = logoMaxWidth;
        let logoHeight = logoMaxWidth / logoAspect;

        if (logoHeight > logoMaxHeight) {
            logoHeight = logoMaxHeight;
            logoWidth = logoMaxHeight * logoAspect;
        }

        // Draw logo at top right
        const logoX = width - padding - logoWidth;
        const logoY = 45;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        // Fallback: Draw text if image loading fails
        console.error('Logo loading failed:', error);
        ctx.textAlign = 'right';
        ctx.font = 'italic 14px Arial';
        ctx.fillStyle = '#B8936F';
        ctx.fillText('powered by', width - padding, 60);
        ctx.font = 'bold 24px Georgia, serif';
        ctx.fillStyle = '#3D3D3D';
        ctx.fillText('KStitch', width - padding, 85);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText('Tax Invoice', width / 2, 160);

    // --- Bill To Selection ---
    const billY = 200;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.fillText('Bill To:', padding, billY);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(order.customerName, padding, billY + 25);
    // Optional Phone
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(order.customerPhone || '', padding, billY + 45);

    // Invoice No / Date
    ctx.textAlign = 'right';
    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.fillText('Invoice No.', width - padding, billY);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(order._id.toString().slice(-6).toUpperCase(), width - padding, billY + 25);

    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.fillText('Date: ' + new Date().toLocaleDateString('en-IN'), width - padding, billY + 55);

    // --- Items Loop ---
    let currentY = 280;

    items.forEach(item => {
        // Card Background/Border
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, currentY, width - 2 * padding, 90);
        // Rounded fix: just define a path and stroke

        // Item Name
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0066CC'; // Blue
        ctx.font = 'bold 16px Arial';
        ctx.fillText(item.garmentType || 'Item', padding + 20, currentY + 30);

        // Grid Headers (Implicit in cards) - Logic from image
        // Qty
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.fillText('Quantity', padding + 20, currentY + 60);
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${item.quantity || 1} Unit`, padding + 20, currentY + 75);

        // Price
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.fillText('Price/Unit', padding + 200, currentY + 60);
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px Arial';
        const uPrice = (item.totalPrice / (item.quantity || 1));
        ctx.fillText(`₹ ${uPrice.toFixed(2)}`, padding + 200, currentY + 75);

        // GST (Skip or empty)
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.fillText('GST', padding + 400, currentY + 60);
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`--`, padding + 400, currentY + 75);

        // Amount
        ctx.textAlign = 'right';
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.fillText('Amount', width - padding - 20, currentY + 60);
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`₹ ${item.totalPrice.toFixed(2)}`, width - padding - 20, currentY + 75);

        currentY += 100; // Spacing
    });

    // --- Pricing Breakup ---
    currentY += 20;

    // Calculate comprehensive pricing details
    const totalAmount = Number(order.price || 0);
    const advancePaid = Number(order.advancePayment || 0);
    const discountAmount = Number(order.discountAmount ?? order.discount ?? 0);
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const currentPayment = Number(order.currentPaymentAmount || 0);
    const remainingAmount = Number(order.remainingAmount ?? Math.max(0, finalAmount - advancePaid - currentPayment));
    const paidSoFar = Math.max(0, finalAmount - remainingAmount);

    // Determine payment status
    let paymentStatusText = 'Unpaid';
    if (order.paymentStatus === 'paid' || remainingAmount === 0) {
        paymentStatusText = 'Paid in Full';
    } else if (order.paymentStatus === 'partial') {
        paymentStatusText = 'Partial Payment';
    } else if (order.paymentStatus === 'scheduled') {
        paymentStatusText = 'Payment Scheduled';
    } else if (paidSoFar > 0) {
        paymentStatusText = 'Partial Payment';
    }

    // Dynamic height based on rows needed
    // Rows: Total Amount, Discount, Advance Paid, Total Amount Paid, Remaining Amount, Payment Status
    // Plus 1 if currentPayment > 0
    const rowCount = 6 + (currentPayment > 0 ? 1 : 0);
    const breakupHeight = 60 + (rowCount * 25);

    ctx.strokeStyle = '#dddddd';
    ctx.strokeRect(padding, currentY, width - 2 * padding, breakupHeight);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Invoice Pricing Breakup', padding + 20, currentY + 30);

    // Rows
    const drawRow = (label, value, y, bold = false, color = null, highlight = false) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = color || (bold ? '#333333' : '#666666');
        ctx.font = bold ? 'bold 14px Arial' : '14px Arial';
        ctx.fillText(label, padding + 20, y);

        ctx.textAlign = 'right';
        if (highlight && remainingAmount > 0) {
            ctx.fillStyle = '#DC2626'; // Red for pending
        } else if (highlight && remainingAmount === 0) {
            ctx.fillStyle = '#16A34A'; // Green for paid
        }
        ctx.fillText(value, width - padding - 20, y);
    };

    let rowY = currentY + 60;

    // Total Amount (bold and blue)
    drawRow('Total Amount', `₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, true, '#0066CC');
    rowY += 25;

    // Discount (always show, even if 0)
    drawRow('Discount', `- ₹ ${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, false);
    rowY += 25;

    // Draw separator line
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + 20, rowY - 5);
    ctx.lineTo(width - padding - 20, rowY - 5);
    ctx.stroke();
    rowY += 5;



    // Advance Paid
    drawRow('Advance Paid', `₹ ${advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, false);
    rowY += 25;

    // Current Payment (only if present)
    if (currentPayment > 0) {
        drawRow('Current Payment', `₹ ${currentPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, false);
        rowY += 25;
    }

    // Total Amount Paid
    drawRow('Total Amount Paid', `₹ ${paidSoFar.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, false, '#16A34A');
    rowY += 25;

    // Draw separator line
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + 20, rowY - 5);
    ctx.lineTo(width - padding - 20, rowY - 5);
    ctx.stroke();
    rowY += 5;

    // Remaining Amount (highlighted)
    drawRow('Remaining Amount', `₹ ${remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rowY, true, null, true);
    rowY += 30;

    // Payment Status
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.fillText('Payment Status:', padding + 20, rowY);

    ctx.textAlign = 'right';
    ctx.fillStyle = remainingAmount === 0 ? '#16A34A' : (paymentStatusText === 'Payment Scheduled' ? '#F59E0B' : '#DC2626');
    ctx.font = 'bold 12px Arial';
    ctx.fillText(paymentStatusText, width - padding - 20, rowY);

    currentY += breakupHeight;

    // --- Footer ---
    currentY += 30;

    // Terms
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Terms & Conditions :', padding, currentY);
    ctx.font = '12px Arial';
    ctx.fillText('Thank you for doing business with us.', padding + 130, currentY);

    // Signature Area
    const sigX = width - padding - 200;
    const sigY = currentY - 30;
    ctx.strokeStyle = '#eeeeee';
    ctx.strokeRect(sigX, sigY, 200, 80);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#dddddd'; // Placeholder sig
    ctx.font = 'italic 20px Arial';
    ctx.fillText('Signature', sigX + 100, sigY + 40);

    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial';
    ctx.fillText(tailor?.shopName || 'Authorized', sigX + 100, sigY + 70);

    return canvas.toBuffer('image/png');
};

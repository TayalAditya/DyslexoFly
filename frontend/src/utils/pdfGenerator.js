import jsPDF from 'jspdf';

// Function to convert image to base64 synchronously
const getImageAsBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    return null;
  }
};

export const generateDyslexoFlyPDF = async (fileId, textContent, summaries, audioUrl) => {
  console.log('Generating DyslexoFly PDF - 2 Column Layout');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const columnWidth = (contentWidth - 10) / 2; // 10px gap between columns
  const leftColumn = margin;
  const rightColumn = margin + columnWidth + 10;
  let leftY = margin;
  let rightY = margin;

  // Load the actual logo image
  const logoBase64 = await getImageAsBase64('/images/logo.jpg');

  // Clean colors
  const colors = {
    primary: [37, 99, 235],
    dark: [17, 24, 39],
    medium: [75, 85, 99],
    light: [156, 163, 175]
  };

  // Helper functions
  const addText = (text, x, y, maxWidth, fontSize = 9, color = colors.dark, style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', style);
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = y;
    lines.forEach(line => {
      doc.text(line, x, currentY);
      currentY += fontSize * 0.45;
    });
    return currentY + 3;
  };

  const addClickableLink = (text, url, x, y, maxWidth, fontSize = 9) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach(line => {
      doc.text(line, x, currentY);
      // Add clickable link for each line
      const textWidth = doc.getTextWidth(line);
      const lineHeight = fontSize * 0.45;
      doc.link(x, currentY - fontSize * 0.8, textWidth, lineHeight + 2, { url: url });
      currentY += lineHeight;
    });
    
    return currentY + 3;
  };

  const addHeader = (text, x, y, maxWidth, color = colors.primary) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y - 8, maxWidth, 12, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x + 5, y);
    return y + 8;
  };

  const addLine = (x1, y, x2) => {
    doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.setLineWidth(0.5);
    doc.line(x1, y, x2, y);
    return y + 5;
  };

  // HEADER SECTION (Full Width)
  // Logo and title
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin, leftY, 25, 25, undefined, 'FAST');
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }
  
  doc.setFontSize(18);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DyslexoFly', margin + 30, leftY + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
  doc.text('Accessible Learning Platform', margin + 30, leftY + 20);
  
  leftY += 35;
  rightY = leftY;

  // Divider line
  leftY = addLine(margin, leftY, pageWidth - margin);
  rightY = leftY;

  // LEFT COLUMN
  // Document Information
  leftY = addHeader('Document Information', leftColumn, leftY, columnWidth);
  leftY = addText(`Document: ${fileId}`, leftColumn + 5, leftY, columnWidth - 10, 9, colors.dark, 'bold');
  leftY = addText(`Generated: ${new Date().toLocaleString()}`, leftColumn + 5, leftY, columnWidth - 10, 8, colors.medium);
  leftY = addClickableLink(`Platform: https://dyslexofly.vercel.app`, 'https://dyslexofly.vercel.app', leftColumn + 5, leftY, columnWidth - 10, 8);
  leftY += 8;

  // Audio Downloads - Use actual audioUrl if available
  leftY = addHeader('Audio Downloads', leftColumn, leftY, columnWidth);
  
  if (audioUrl) {
    // If we have an actual audio URL, use it
    const baseUrl = 'https://dyslexofly.onrender.com';
    // Ensure audioUrl starts with / or is a complete URL
    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${baseUrl}${audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl}`;
    leftY = addText('Generated Audio File:', leftColumn + 5, leftY, columnWidth - 10, 9, colors.dark, 'bold');
    leftY = addClickableLink(fullAudioUrl, fullAudioUrl, leftColumn + 5, leftY, columnWidth - 10, 7);
    leftY = addText('Full text content in audio format', leftColumn + 5, leftY, columnWidth - 10, 7, colors.medium, 'italic');
  } else {
    // Fallback to pattern-based URLs
    leftY = addText('Audio files available at:', leftColumn + 5, leftY, columnWidth - 10, 9, colors.dark, 'bold');
    const baseUrl = 'http://127.0.0.1:10000/api/audio/';
    const filePattern = fileId.replace('.', '_');
    
    const audioLinks = [
      { text: `EN Female: ${baseUrl}${filePattern}_en-us_female_[timestamp].mp3`, url: `${baseUrl}${filePattern}_en-us_female_1750982208.mp3` },
      { text: `EN Male: ${baseUrl}${filePattern}_en-us_male_[timestamp].mp3`, url: `${baseUrl}${filePattern}_en-us_male_1750982208.mp3` },
      { text: `HI Female: ${baseUrl}${filePattern}_hi-in_female_[timestamp].mp3`, url: `${baseUrl}${filePattern}_hi-in_female_1750982208.mp3` },
      { text: `HI Male: ${baseUrl}${filePattern}_hi-in_male_[timestamp].mp3`, url: `${baseUrl}${filePattern}_hi-in_male_1750982208.mp3` }
    ];
    
    audioLinks.forEach(link => {
      leftY = addClickableLink(`• ${link.text}`, link.url, leftColumn + 5, leftY, columnWidth - 10, 6);
    });
    
    leftY = addText('Note: [timestamp] is generated when audio is created', leftColumn + 5, leftY, columnWidth - 10, 6, colors.medium, 'italic');
  }
  leftY += 8;

  // Team Information
  leftY = addHeader('Development Team', leftColumn, leftY, columnWidth);
  leftY = addText('Aditya Tayal', leftColumn + 5, leftY, columnWidth - 10, 9, colors.dark, 'bold');
  leftY = addText('Full-Stack Developer & AI Integration', leftColumn + 5, leftY, columnWidth - 10, 8, colors.medium);
  leftY = addText('IIT Mandi, CSE (3rd Year)', leftColumn + 5, leftY, columnWidth - 10, 8, colors.medium);
  leftY += 3;
  
  leftY = addText('Siddhi Pogakwar', leftColumn + 5, leftY, columnWidth - 10, 9, colors.dark, 'bold');
  leftY = addText('TTS Training & Text Analysis', leftColumn + 5, leftY, columnWidth - 10, 8, colors.medium);
  leftY = addText('IIT Mandi, M&C (3rd Year)', leftColumn + 5, leftY, columnWidth - 10, 8, colors.medium);
  leftY += 8;

  // Links with clickable URLs
  leftY = addHeader('Links & Resources', leftColumn, leftY, columnWidth);
  const links = [
    { text: 'Live: https://dyslexofly.vercel.app', url: 'https://dyslexofly.vercel.app' },
    { text: 'GitHub: github.com/TayalAditya/DyslexoFly', url: 'https://github.com/TayalAditya/DyslexoFly' },
    { text: 'License: MIT (Free & Open Source)', url: 'https://opensource.org/licenses/MIT' }
  ];
  links.forEach(link => {
    leftY = addClickableLink(`• ${link.text}`, link.url, leftColumn + 5, leftY, columnWidth - 10, 8);
  });

  // RIGHT COLUMN
  // Original Text Content
  if (textContent) {
    rightY = addHeader('Original Text Content', rightColumn, rightY, columnWidth);
    const maxChars = 600;
    let displayText = textContent.substring(0, maxChars);
    if (textContent.length > maxChars) {
      const lastSentence = displayText.lastIndexOf('.');
      if (lastSentence > maxChars - 100) {
        displayText = displayText.substring(0, lastSentence + 1);
      }
      displayText += '\n\n[Content truncated - full text available in audio files]';
    }
    rightY = addText(displayText, rightColumn + 5, rightY, columnWidth - 10, 8, colors.dark);
    rightY += 8;
  }

  // AI Summaries
  if (summaries) {
    if (summaries.tldr) {
      rightY = addHeader('TL;DR Summary', rightColumn, rightY, columnWidth, [16, 185, 129]);
      rightY = addText(summaries.tldr, rightColumn + 5, rightY, columnWidth - 10, 8, colors.dark);
      rightY += 5;
    }

    if (summaries.standard) {
      rightY = addHeader('Standard Summary', rightColumn, rightY, columnWidth, [99, 102, 241]);
      rightY = addText(summaries.standard, rightColumn + 5, rightY, columnWidth - 10, 8, colors.dark);
      rightY += 5;
    }

    if (summaries.detailed) {
      rightY = addHeader('Detailed Summary', rightColumn, rightY, columnWidth, [37, 99, 235]);
      rightY = addText(summaries.detailed, rightColumn + 5, rightY, columnWidth - 10, 8, colors.dark);
      rightY += 5;
    }
  }

  // Key Features (if space available)
  if (rightY < pageHeight - 80) {
    rightY = addHeader('Key Features', rightColumn, rightY, columnWidth);
    const features = [
      '• AI-powered text summarization',
      '• Multi-language TTS (EN/HI)',
      '• WCAG AAA accessibility',
      '• Real-time processing'
    ];
    features.forEach(feature => {
      rightY = addText(feature, rightColumn + 5, rightY, columnWidth - 10, 8, colors.dark);
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
  doc.text('Generated by DyslexoFly | © 2025 The Kamand Krew | MIT License', margin, pageHeight - 10);

  return doc;
};

export const downloadDyslexoFlyPDF = async (fileId, textContent, summaries, audioUrl) => {
  try {
    const doc = await generateDyslexoFlyPDF(fileId, textContent, summaries, audioUrl);
    doc.save(`${fileId}_DyslexoFly.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
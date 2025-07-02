// PDF Generation utility for DyslexoFly - Enhanced Version
import jsPDF from 'jspdf';

export const generateDyslexoFlyPDF = (fileId, textContent, summaries, audioUrl) => {
  const doc = new jsPDF();
  
  // Remove the problematic font loading - use built-in fonts instead
  console.log('Generating PDF with built-in fonts for better compatibility');
  
  // Enhanced color scheme
  const primaryColor = [79, 70, 229]; // Indigo-600
  const secondaryColor = [147, 51, 234]; // Purple-600
  const accentColor = [59, 130, 246]; // Blue-500
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [156, 163, 175]; // Gray-400
  const success = [34, 197, 94]; // Green-500
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);
  
  // Helper function to add new page with header
  const addNewPage = () => {
    doc.addPage();
    yPosition = 30;
    addPageHeader();
    return yPosition + 15;
  };
  
  // Add page header for all pages except first
  const addPageHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('DyslexoFly - Accessible Learning Platform', margin, 15);
    doc.text(`Document: ${fileId}`, pageWidth - margin - 60, 15);
    
    // Header line
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, 18, pageWidth - margin, 18);
  };
  
  // Enhanced text wrapping with better formatting and Hindi detection
  const addWrappedText = (text, x, y, maxWidth, fontSize = 12, color = textColor, style = 'normal', lineHeight = 1.5) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    // Detect Hindi content for font selection
    const hasHindi = /[\u0900-\u097F]/.test(text);
    if (hasHindi) {
      // Use system fonts that support Devanagari
      try {
        doc.setFont('helvetica', style); // Fallback to helvetica
        // Add a note about Hindi content
        if (fontSize > 11) {
          const hindiNote = '(Hindi content - May display with system fonts)';
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(hindiNote, x, y - 5);
          doc.setFontSize(fontSize);
          doc.setTextColor(color[0], color[1], color[2]);
        }
      } catch {
        doc.setFont('helvetica', style);
      }
    } else {
      doc.setFont('helvetica', style);
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * lineHeight * 0.4); // Increased spacing to prevent overlap
  };
  
  // Enhanced section header with better styling
  const addSectionHeader = (title, icon = '', bgColor = primaryColor) => {
    // Check for page break
    if (yPosition > pageHeight - 40) {
      yPosition = addNewPage();
    }
    
    yPosition += 15;
    
    // Background rectangle for header
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin - 5, yPosition - 8, contentWidth + 10, 16, 3, 3, 'F');
    
    // Header text
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${icon} ${title}`, margin, yPosition + 3);
    
    yPosition += 20;
    return yPosition;
  };
  
  // Add impressive logo and header
  const addEnhancedLogo = () => {
    // Simple but professional logo design without emojis
    // Main logo circle
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(margin + 20, 25, 15, 'F');
    
    // Inner circle for depth
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 20, 25, 12, 'F');
    
    // Logo text
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DF', margin + 15, 29);
    
    // Decorative elements
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(2);
    doc.circle(margin + 20, 25, 15, 'S');
    
    // Main title
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('DyslexoFly', margin + 45, 28);
    
    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Accessible Learning Platform', margin + 45, 38);
    
    // Clean tagline without emojis
    doc.setFontSize(12);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'italic');
    doc.text('Making Education Accessible for Everyone', margin + 45, 48);
    
    // Decorative line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(3);
    doc.line(margin, 55, pageWidth - margin, 55);
    
    return 70;
  };
  
  // Start with enhanced logo
  yPosition = addEnhancedLogo();
  
  // Document information box - Clean and professional
  yPosition = addSectionHeader('Document Information', '', success);
  
  // Info box background
  doc.setFillColor(248, 250, 252); // Gray-50
  doc.setDrawColor(203, 213, 225); // Gray-300
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition - 5, contentWidth, 45, 5, 5, 'FD');
  
  yPosition = addWrappedText(`Document: ${fileId}`, margin + 10, yPosition + 5, contentWidth - 20, 14, textColor, 'bold');
  yPosition = addWrappedText(`Generated: ${new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin + 10, yPosition, contentWidth - 20, 12, lightGray);
  yPosition = addWrappedText(`Platform: DyslexoFly - Accessible Learning Platform`, margin + 10, yPosition, contentWidth - 20, 12, accentColor);
  
  yPosition += 15;
  
  // Original text content - smart pagination and formatting
  if (textContent) {
    addSectionHeader('Document Content', '');
    
    // Smart content handling with better formatting
    const maxFirstPageChars = 600; // Reduced for better formatting
    const charsPerLine = 75; // Average characters per line
    
    // Calculate how much content we can show on first page
    const remainingSpace = pageHeight - yPosition - 80; // Leave space for footer
    const availableLines = Math.floor(remainingSpace / 15); // 15px per line
    const firstPageChars = Math.min(maxFirstPageChars, availableLines * charsPerLine);
    
    // Get first page content
    let firstPageContent = textContent.substring(0, firstPageChars);
    
    // Don't cut words in half - find last complete sentence or word
    if (textContent.length > firstPageChars) {
      const lastSentence = firstPageContent.lastIndexOf('.');
      const lastSpace = firstPageContent.lastIndexOf(' ');
      
      if (lastSentence > firstPageChars - 100) {
        firstPageContent = firstPageContent.substring(0, lastSentence + 1);
      } else if (lastSpace > firstPageChars - 50) {
        firstPageContent = firstPageContent.substring(0, lastSpace);
      }
    }
    
    yPosition = addWrappedText(firstPageContent, margin, yPosition, contentWidth, 11);
    
    // Add continuation notice if needed
    if (textContent.length > firstPageContent.length) {
      yPosition += 15;
      
      // Check if we have space for the notice
      if (yPosition > pageHeight - 40) {
        yPosition = addNewPage();
      }
      
      // Professional continuation notice
      doc.setFillColor(59, 130, 246, 0.1); // Light blue background
      doc.roundedRect(margin - 5, yPosition - 8, contentWidth + 10, 25, 3, 3, 'F');
      
      yPosition = addWrappedText(
        'Document Preview - Complete content available in download package and original file upload',
        margin, 
        yPosition, 
        contentWidth, 
        10, 
        [59, 130, 246], 
        'italic'
      );
      
      const remainingChars = textContent.length - firstPageContent.length;
      const remainingWords = Math.ceil(remainingChars / 5);
      yPosition = addWrappedText(
        `Additional content: ~${remainingWords} words remaining`,
        margin, 
        yPosition + 5, 
        contentWidth, 
        9, 
        [107, 114, 128], 
        'normal'
      );
    }
  }
  
  // Check if we need a new page for summaries
  if (yPosition > pageHeight - 120) {
    yPosition = addNewPage();
  }
  
  // AI-Generated Summaries - Focus on these as main content
  if (summaries) {
    addSectionHeader('AI-Generated Summaries', '');
    
    if (summaries.tldr) {
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text('Quick Summary (TL;DR)', margin, yPosition);
      yPosition += 8;
      yPosition = addWrappedText(summaries.tldr, margin, yPosition, contentWidth, 11);
      yPosition += 5;
    }
    
    if (summaries.standard) {
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text('Standard Summary', margin, yPosition);
      yPosition += 8;
      yPosition = addWrappedText(summaries.standard, margin, yPosition, contentWidth, 11);
      yPosition += 5;
    }
    
    if (summaries.detailed) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Summary', margin, yPosition);
      yPosition += 8;
      yPosition = addWrappedText(summaries.detailed, margin, yPosition, contentWidth, 11);
      yPosition += 5;
    }
  }
  
  // Package Information
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  addSectionHeader('Package Information', '📦');
  yPosition = addWrappedText(`• Text Content: ${textContent ? 'Included' : 'Not available'}`, margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText(`• AI Summaries: ${summaries ? 'Included' : 'Not available'}`, margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText(`• Audio File: ${audioUrl ? 'Available separately' : 'Not available'}`, margin, yPosition, contentWidth, 11);
  if (audioUrl) {
    yPosition = addWrappedText(`• Audio URL: ${audioUrl}`, margin, yPosition, contentWidth, 10);
  }
  
  // How to Use This Package
  addSectionHeader('How to Use This Package', '💡');
  yPosition = addWrappedText('1. Save this PDF for future reference', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('2. Upload the original document to DyslexoFly to restore full functionality', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('3. The audio file can be downloaded separately if available', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('4. Visit https://dyslexofly.netlify.app for the latest features', margin, yPosition, contentWidth, 11);
  
  // Technical Features
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  addSectionHeader('DyslexoFly Features', '🚀');
  const features = [
    'AI-powered text summarization with multiple complexity levels',
    'High-quality text-to-speech in multiple languages and voices',
    'OpenDyslexic font support for improved readability',
    'WCAG AAA accessibility compliance',
    'Real-time document processing and conversion',
    'Multi-format support (PDF, DOCX, TXT, Images)',
    'Advanced search and highlighting capabilities',
    'Responsive design for all devices'
  ];
  
  features.forEach(feature => {
    yPosition = addWrappedText(`• ${feature}`, margin, yPosition, contentWidth, 10);
  });
  
  // Team Information
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  addSectionHeader('Development Team', '👥');
  yPosition = addWrappedText('Team: The Kamand Krew', margin, yPosition, contentWidth, 12, primaryColor);
  yPosition = addWrappedText('• Aditya Tayal - Full-Stack Developer & AI Integration (IIT Mandi, CSE)', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('• Siddhi Pogakwar - TTS Training & Text Analysis (IIT Mandi, MnC)', margin, yPosition, contentWidth, 11);
  
  // GitHub Links
  addSectionHeader('Source Code & Links', '🔗');
  yPosition = addWrappedText('GitHub Repository: https://github.com/TayalAditya/DyslexoFly', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('Live Platform: https://dyslexofly.netlify.app', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('Aditya GitHub: https://github.com/TayalAditya', margin, yPosition, contentWidth, 11);
  yPosition = addWrappedText('Siddhi GitHub: https://github.com/SiddhiPogakwar123', margin, yPosition, contentWidth, 11);
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated by DyslexoFly - Accessible Learning Platform | Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.height - 10);
    doc.text(`© ${new Date().getFullYear()} The Kamand Krew | Making education accessible for everyone`, pageWidth - margin - 120, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};

export const downloadDyslexoFlyPDF = (fileId, textContent, summaries, audioUrl) => {
  const doc = generateDyslexoFlyPDF(fileId, textContent, summaries, audioUrl);
  doc.save(`${fileId}_DyslexoFly.pdf`);
};
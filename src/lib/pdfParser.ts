export interface SlidePreview {
  pageNumber: number;
  thumbnail: string;
  text: string;
}

export async function extractPdfContent(file: File): Promise<{
  text: string;
  slides: SlidePreview[];
  slideCount: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Count PDF pages by looking for page object markers
  let pageCount = 0;
  const pdfString = new TextDecoder("latin1").decode(bytes);
  
  // Method 1: Count /Type /Page occurrences (most reliable)
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
  if (pageMatches) {
    pageCount = pageMatches.length;
  }
  
  // Method 2: Look for /Count in page tree
  if (pageCount === 0) {
    const countMatch = pdfString.match(/\/Count\s+(\d+)/);
    if (countMatch) {
      pageCount = parseInt(countMatch[1], 10);
    }
  }
  
  // Method 3: Estimate from file size (fallback)
  if (pageCount === 0 || pageCount > 100) {
    // Average pitch deck slide is about 50-150KB
    pageCount = Math.max(5, Math.min(20, Math.round(file.size / 80000)));
  }

  console.log("Detected page count:", pageCount);

  // Extract text content
  let extractedText = "";
  
  // Look for text streams in PDF
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;
  while ((match = streamRegex.exec(pdfString)) !== null) {
    const streamContent = match[1];
    // Extract readable ASCII from stream
    const readable = streamContent.replace(/[^\x20-\x7E\n\r]/g, " ").trim();
    if (readable.length > 10) {
      extractedText += readable + "\n";
    }
  }

  // Also extract text between parentheses (PDF text objects)
  const textMatches = pdfString.match(/\(([^)]{3,})\)/g);
  if (textMatches) {
    const textContent = textMatches
      .map(m => m.slice(1, -1))
      .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
      .join(" ");
    extractedText += "\n" + textContent;
  }

  // Clean up extracted text
  const cleanedText = extractedText
    .replace(/\\[nrt]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Create slide previews
  const slides: SlidePreview[] = [];
  for (let i = 1; i <= pageCount; i++) {
    slides.push({
      pageNumber: i,
      thumbnail: "",
      text: `Slide ${i}`,
    });
  }

  // Build comprehensive prompt content
  const finalText = cleanedText.length > 100 
    ? `Pitch Deck: ${file.name}
Total Slides: ${pageCount}

EXTRACTED CONTENT:
${cleanedText.substring(0, 40000)}

---
Analyze all ${pageCount} slides of this pitch deck.`
    : `Pitch Deck: ${file.name}
Total Slides: ${pageCount}
File Size: ${(file.size / 1024).toFixed(2)} KB

This is a ${pageCount}-slide pitch deck. Please analyze it thoroughly, providing feedback for each of the ${pageCount} slides.

Standard pitch deck structure to evaluate:
1. Title/Cover - Company name, tagline, contact
2. Problem - Market pain point being addressed
3. Solution - How you solve the problem
4. Product - Features, demo, screenshots
5. Market Size - TAM, SAM, SOM analysis
6. Business Model - Revenue streams, pricing
7. Traction - Users, revenue, growth metrics
8. Competition - Competitive landscape, differentiation
9. Go-to-Market - Sales and marketing strategy
10. Team - Founders and key hires
11. Financials - Projections, unit economics
12. Ask - Funding amount, use of proceeds`;

  return { 
    text: finalText, 
    slides,
    slideCount: pageCount
  };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const { text } = await extractPdfContent(file);
  return text;
}

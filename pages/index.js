import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Download, Edit3, Save, X, CheckCircle } from 'lucide-react';
import Head from 'next/head';

const CVOptimizer = () => {
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedCV, setOptimizedCV] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCV, setEditableCV] = useState('');
  const fileInputRef = useRef(null);

  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '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';

  // PDF text extraction using PDF.js
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Check if PDF.js is already loaded
          if (typeof window !== 'undefined' && window.pdfjsLib) {
            await processPDF(arrayBuffer, resolve, reject);
          } else {
            // Load PDF.js library
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = async () => {
              try {
                // Configure PDF.js worker
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                await processPDF(arrayBuffer, resolve, reject);
              } catch (pdfError) {
                console.error('PDF processing error:', pdfError);
                reject(pdfError);
              }
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js'));
            document.head.appendChild(script);
          }
        } catch (error) {
          console.error('Error extracting text from PDF:', error);
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const processPDF = async (arrayBuffer, resolve, reject) => {
    try {
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      resolve(fullText.trim());
    } catch (error) {
      reject(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
      try {
        const extractedText = await extractTextFromPDF(file);
        if (extractedText.trim()) {
          setCvText(extractedText);
          setStep(2);
        } else {
          alert('Could not extract text from PDF. Please ensure your PDF contains readable text.');
        }
      } catch (error) {
        alert('Error reading PDF file. Please try a different file.');
        console.error('PDF extraction error:', error);
      }
    } else {
      alert('Please upload a PDF file');
    }
  };

  const cleanOptimizedContent = (content) => {
    // Split content into lines for processing
    const lines = content.split('\n');
    let cleanedLines = [];
    let skipSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line starts an explanatory section
      if (
        line.match(/^I optimized the CV by:?/i) ||
        line.match(/^I've optimized the CV by:?/i) ||
        line.match(/^I have optimized the CV by:?/i) ||
        line.match(/^Here's how I optimized/i) ||
        line.match(/^The following optimizations were made:?/i) ||
        line.match(/^Key optimizations:?/i) ||
        line.match(/^Changes made:?/i) ||
        line.match(/^Optimizations:?/i) ||
        line.match(/^Here's the optimized CV:?/i) ||
        line.match(/^Here is the optimized CV:?/i) ||
        line.match(/^Below is the optimized CV:?/i) ||
        line.match(/^The optimized CV is as follows:?/i) ||
        line.match(/^Optimized CV:?/i) ||
        line.match(/^Here's your optimized resume:?/i) ||
        line.match(/^Here is your optimized resume:?/i) ||
        line.match(/^I've tailored your CV/i) ||
        line.match(/^I have tailored your CV/i) ||
        line.match(/^Based on the job description/i)
      ) {
        skipSection = true;
        continue;
      }
      
      // Check if this line is a bullet point about optimizations
      if (
        line.match(/^[-*•]\s*(Enhanced|Improved|Added|Highlighted|Emphasized|Repositioned|Reframed|Quantified|Aligned|Tailored|Optimized|Modified|Updated|Strengthened)/i) ||
        line.match(/^[-*•]\s*[A-Z][a-z]+ (keywords|skills|experience|achievements|accomplishments)/i) ||
        line.match(/^[-*•]\s*(Keywords|Skills|Experience|Achievements|Accomplishments)/i) ||
        line.match(/^\d+\.\s*(Enhanced|Improved|Added|Highlighted|Emphasized|Repositioned|Reframed|Quantified|Aligned|Tailored|Optimized|Modified|Updated|Strengthened)/i)
      ) {
        continue;
      }
      
      // Check if we've reached the actual CV content (usually starts with a name or professional title)
      if (skipSection) {
        // Look for typical CV starting patterns
        if (
          line.match(/^[A-Z][a-z]+ [A-Z][a-z]+\s*$/) || // Full name
          line.match(/^[A-Z][A-Z\s]+$/) || // ALL CAPS name
          line.match(/^PROFESSIONAL SUMMARY/i) ||
          line.match(/^SUMMARY/i) ||
          line.match(/^PROFILE/i) ||
          line.match(/^EXPERIENCE/i) ||
          line.match(/^WORK EXPERIENCE/i) ||
          line.match(/^EDUCATION/i) ||
          line.match(/^SKILLS/i) ||
          line.match(/^CONTACT/i) ||
          line.match(/^EMAIL:/i) ||
          line.match(/^PHONE:/i) ||
          line.match(/^[A-Za-z\s]+\s+\|\s+[A-Za-z\s]+/) || // Name | Title format
          line.match(/^\w+@\w+\.\w+/) || // Email address
          line.match(/^\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}/) // Phone number
        ) {
          skipSection = false;
          cleanedLines.push(lines[i]); // Keep original formatting
        }
      } else {
        cleanedLines.push(lines[i]); // Keep original formatting
      }
    }
    
    // Join back and clean up extra whitespace
    let cleanedContent = cleanedLines.join('\n');
    
    // Remove any remaining explanatory phrases at the beginning
    const phrasesToRemove = [
      /^Here's the optimized CV:?\s*/i,
      /^Here is the optimized CV:?\s*/i,
      /^Below is the optimized CV:?\s*/i,
      /^The optimized CV is as follows:?\s*/i,
      /^Optimized CV:?\s*/i,
      /^Here's your optimized resume:?\s*/i,
      /^Here is your optimized resume:?\s*/i,
    ];

    phrasesToRemove.forEach(phrase => {
      cleanedContent = cleanedContent.replace(phrase, '');
    });

    // Clean up excessive whitespace
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').trim();

    return cleanedContent;
  };

  const optimizeCV = async () => {
    if (!cvText || !jobDescription) {
      alert('Please ensure both CV and Job Description are provided');
      return;
    }

    setIsOptimizing(true);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional CV optimizer. Your task is to strategically optimize the given CV to better match the job description requirements. Focus on: 1) Realigning existing experience to highlight relevant skills, 2) Rephrasing accomplishments to match JD keywords, 3) Quantifying achievements where possible, 4) Maintaining authenticity while maximizing relevance. Do not fabricate experience, but creatively present existing experience in the most favorable light for the target role. IMPORTANT: Return ONLY the optimized CV content without any explanatory text, preamble, or phrases like "Here is the optimized CV" or similar. Start directly with the CV content.'
            },
            {
              role: 'user',
              content: `Please optimize this CV to better match the job description requirements. Make it compelling but authentic. Return only the optimized CV content without any explanatory text.

JOB DESCRIPTION:
${jobDescription}

CURRENT CV:
${cvText}

Provide the optimized CV that maintains the same structure but better aligns with the job requirements. Focus on relevant skills, use similar terminology from the JD, and highlight the most pertinent experiences. Do not include any explanatory text - return only the CV content.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      const rawContent = data.choices[0].message.content;
      const optimizedContent = cleanOptimizedContent(rawContent);
      setOptimizedCV(optimizedContent);
      setEditableCV(optimizedContent);
      setStep(3);
    } catch (error) {
      console.error('Error optimizing CV:', error);
      alert('Error optimizing CV. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const downloadPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([editableCV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'optimized_cv.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const saveEdit = () => {
    setOptimizedCV(editableCV);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditableCV(optimizedCV);
    setIsEditing(false);
  };

  return (
    <>
      <Head>
        <title>CV Optimizer - AI-Powered Resume Enhancement</title>
        <meta name="description" content="Optimize your CV to match job requirements using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">CV Optimizer</h1>
            </div>
            <p className="text-gray-600">Transform your CV to match job requirements with AI-powered optimization</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 ${step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Upload CV */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Upload className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your CV</h2>
              <p className="text-gray-600 mb-6">Upload your current CV in PDF format to get started</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <FileText className="w-5 h-5" />
                Choose PDF File
              </button>
              
              {cvFile && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {cvFile.name}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Job Description */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Description</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Current CV</h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{cvText}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Target Job Description</h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={optimizeCV}
                  disabled={isOptimizing || !jobDescription}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Optimize CV
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview and Edit */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Optimized CV Preview</h2>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={downloadPDF}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 min-h-96">
                {isEditing ? (
                  <textarea
                    value={editableCV}
                    onChange={(e) => setEditableCV(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                  />
                ) : (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{optimizedCV}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CVOptimizer;

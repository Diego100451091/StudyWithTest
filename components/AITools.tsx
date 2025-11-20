import React, { useState } from 'react';
import { Copy, Check, FileJson, ArrowRight, AlertCircle } from 'lucide-react';
import { UserData, Subject, Test, Question } from '../types';

interface AIToolsProps {
  subjects: Subject[];
  onImportTest: (test: Test) => void;
}

const AITools: React.FC<AIToolsProps> = ({ subjects, onImportTest }) => {
  const [step, setStep] = useState<'prompt' | 'import'>('prompt');
  const [copied, setCopied] = useState(false);
  
  // Form State
  const [config, setConfig] = useState({
    numQuestions: 10,
    difficulty: 'Intermediate',
    numOptions: 4,
    focusTopic: '',
    language: 'English'
  });
  
  // Import State
  const [jsonInput, setJsonInput] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = () => {
    return `Act as a professor. I need you to generate a multiple-choice test for me to study. 
Create a JSON object representing a test IN ${config.language.toUpperCase()}.
Topic: ${config.focusTopic || 'General knowledge of the text provided'}
Number of questions: ${config.numQuestions}
Difficulty: ${config.difficulty}
Number of options per question: ${config.numOptions}
Language: ${config.language}

IMPORTANT: Generate ALL content (title, description, questions, options, and explanations) in ${config.language}.

Strictly follow this JSON structure (do not add markdown code blocks, just the raw JSON or JSON inside a code block):

{
  "title": "Descriptive Title of the Test",
  "description": "Brief summary of content covered",
  "questions": [
    {
      "text": "Question text here...",
      "options": ["Option A", "Option B", ...],
      "correctOptionIndex": 0, // Integer (0-based index of correct option)
      "explanation": "Detailed explanation why the answer is correct."
    }
  ]
}

Ensure the content is accurate and educational.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setError(null);
    if (!targetSubjectId) {
      setError("Please select a subject first.");
      return;
    }
    try {
      // Clean up markdown code blocks if user pastes them
      let cleanJson = jsonInput.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
      }

      const parsed = JSON.parse(cleanJson);
      
      // Validate structure
      if (!parsed.title || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid JSON structure. Missing title or questions array.");
      }

      // Transform to internal model
      const newTest: Test = {
        id: crypto.randomUUID(),
        subjectId: targetSubjectId,
        title: parsed.title,
        description: parsed.description || 'Imported via AI',
        createdAt: Date.now(),
        questions: parsed.questions.map((q: any) => {
            const options = q.options.map((optText: string) => ({
                id: crypto.randomUUID(),
                text: optText
            }));
            
            return {
                id: crypto.randomUUID(),
                text: q.text,
                options: options,
                correctOptionId: options[q.correctOptionIndex]?.id || options[0].id, // Fallback safety
                explanation: q.explanation || 'No explanation provided.'
            };
        })
      };

      onImportTest(newTest);
      alert('Test imported successfully!');
      setJsonInput('');
      // Optional: navigate away
    } catch (err: any) {
      setError(err.message || "Failed to parse JSON");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-2 border-b border-slate-200">
          <button 
            onClick={() => setStep('prompt')}
            className={`p-4 text-center font-medium transition-colors ${step === 'prompt' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Step 1: Generate Prompt
          </button>
          <button 
            onClick={() => setStep('import')}
            className={`p-4 text-center font-medium transition-colors ${step === 'import' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Step 2: Import JSON
          </button>
        </div>

        <div className="p-6 md:p-8">
          {step === 'prompt' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Configure your Prompt</h2>
                <p className="text-slate-500">Adjust these settings, copy the prompt, and paste it into ChatGPT, Claude, or Gemini along with your study notes or PDF content.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Context</label>
                   <input 
                      type="text"
                      value={config.focusTopic}
                      onChange={e => setConfig({...config, focusTopic: e.target.value})}
                      placeholder="e.g. Chapter 3 of History Book"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Test Language</label>
                   <select 
                      value={config.language}
                      onChange={e => setConfig({...config, language: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                   >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Italian</option>
                      <option>Portuguese</option>
                      <option>Chinese</option>
                      <option>Japanese</option>
                      <option>Korean</option>
                      <option>Russian</option>
                      <option>Arabic</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                   <select 
                      value={config.difficulty}
                      onChange={e => setConfig({...config, difficulty: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                   >
                      <option>Easy</option>
                      <option>Intermediate</option>
                      <option>Hard</option>
                      <option>Expert</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Number of Questions</label>
                   <input 
                      type="number"
                      min="1" max="50"
                      value={config.numQuestions}
                      onChange={e => setConfig({...config, numQuestions: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Options per Question</label>
                   <select 
                      value={config.numOptions}
                      onChange={e => setConfig({...config, numOptions: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                   >
                      <option value={2}>2 (True/False style)</option>
                      <option value={3}>3</option>
                      <option value={4}>4 (Standard)</option>
                      <option value={5}>5</option>
                   </select>
                </div>
              </div>

              <div className="relative mt-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Generated Prompt</label>
                <textarea 
                  readOnly
                  value={generatePrompt()}
                  className="w-full h-48 p-4 bg-slate-800 text-slate-100 rounded-xl font-mono text-sm resize-none outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute top-9 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
              
              <div className="flex justify-end">
                 <button 
                   onClick={() => setStep('import')}
                   className="flex items-center space-x-2 text-primary font-medium hover:underline"
                 >
                   <span>I have the JSON, go to Import</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}

          {step === 'import' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Import AI Response</h2>
                <p className="text-slate-500">Paste the JSON code block provided by the LLM below.</p>
              </div>

              {subjects.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No Subjects Found</p>
                    <p className="text-sm">Please create a subject in the Dashboard before importing a test.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Import into Subject</label>
                     <select
                       value={targetSubjectId}
                       onChange={e => setTargetSubjectId(e.target.value)}
                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                     >
                       {subjects.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">JSON Output</label>
                     <textarea 
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                        placeholder='Paste JSON here... { "title": "...", "questions": [...] }'
                        className="w-full h-64 p-4 border border-slate-300 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                     />
                   </div>
                   
                   {error && (
                     <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                       <AlertCircle className="w-4 h-4 mr-2" />
                       {error}
                     </div>
                   )}

                   <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleImport}
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <FileJson className="w-5 h-5" />
                        <span>Parse & Save Test</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;
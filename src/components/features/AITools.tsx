import React, { useState } from 'react';
import { Copy, Check, FileJson, ArrowRight, AlertCircle, ChevronDown } from 'lucide-react';
import { UserData, Subject, Test, Question } from '../../types';
import { Language, getTranslation } from '../../services/translations';
import { Modal, ToggleSwitch, InfoButton } from '../common';
import { useModal } from '../../hooks';

interface AIToolsProps {
  subjects: Subject[];
  language: Language;
  onImportTest: (test: Test) => void;
}

const AITools: React.FC<AIToolsProps> = ({ subjects, language, onImportTest }) => {
  const [step, setStep] = useState<'prompt' | 'import'>('prompt');
  const [copied, setCopied] = useState(false);
  const t = getTranslation(language);
  const { modalState, showSuccess, closeModal } = useModal();
  
  // Form State
  const [config, setConfig] = useState({
    testMode: 'generate' as 'generate' | 'extract',
    numQuestions: 10,
    allQuestions: false,
    difficulty: language === 'es' ? 'Intermedio' : 'Intermediate',
    numOptions: 4,
    focusTopic: '',
    language: language === 'es' ? 'Spanish' : 'English'
  });
  
  // Import State
  const [jsonInput, setJsonInput] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = () => {
    if (config.testMode === 'generate') {
      return `Act as an expert Psychometrician and Professor. I need you to generate a high-quality multiple-choice test for me to study based on the provided text.

Create a JSON object representing a test IN ${config.language.toUpperCase()}.

Configuration:
- Topic: ${config.focusTopic || 'General knowledge of the text provided'}
- Number of questions: ${config.allQuestions ? 'as many as appropriate to cover the content comprehensively' : config.numQuestions}
- Difficulty: ${config.difficulty}
- Number of options per question: ${config.numOptions}
- Language: ${config.language}

CRITICAL QUALITY RULES (Follow these strictly):
1. **Avoid Length Bias**: The correct answer must NOT be consistently longer or more detailed than the incorrect options (distractors). All options must be of similar length and complexity.
2. **Plausible Distractors**: Incorrect options must be realistic and based on common misconceptions. Do not use obviously wrong or silly answers.
3. **Avoid "Odd One Out"**: Do not make the correct answer obvious by being the only one with a different tone, category, or grammatical structure (e.g., do not have 3 positive options and 1 negative option if the question asks for the negative one, unless it requires knowledge to identify).
4. **Deep Understanding**: Focus on testing comprehension and application of concepts rather than simple keyword matching.
5. **Randomized Position**: Ensure the correct answer is not always in the same position.

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
      "explanation": "Detailed explanation why the answer is correct and why others are incorrect."
    }
  ]
}

Ensure the content is accurate, educational, and challenging.`;
    } else {
      // Extract mode
      const topicFilter = config.focusTopic 
        ? `Focus only on questions related to: ${config.focusTopic}` 
        : 'Extract all questions found in the text';
      
      const questionCount = config.allQuestions 
        ? 'Extract ALL questions found in the document' 
        : `Extract up to ${config.numQuestions} questions`;

      return `Act as an expert in extracting structured information from documents. I need you to extract existing multiple-choice test questions from the provided text/PDF.

Your task: Extract test questions that are already present in the document and convert them to JSON format IN ${config.language.toUpperCase()}.

Instructions:
- ${questionCount}
- ${topicFilter}
- Maintain the original question text, options, and correct answers as they appear in the document
- If explanations are provided in the text, include them; otherwise, provide a brief explanation based on context
- Language: ${config.language}

IMPORTANT: Extract ALL content (questions, options, answers, and explanations) exactly as they appear in ${config.language}.

Strictly follow this JSON structure (do not add markdown code blocks, just the raw JSON or JSON inside a code block):

{
  "title": "Extracted Test Questions",
  "description": "Questions extracted from the provided document",
  "questions": [
    {
      "text": "Question text exactly as it appears...",
      "options": ["Option A", "Option B", ...],
      "correctOptionIndex": 0, // Integer (0-based index of correct option)
      "explanation": "Explanation from the document or brief context."
    }
  ]
}

Be accurate and preserve the original content as much as possible.`;
    }
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
      showSuccess(t.success, t.importSuccess);
      setJsonInput('');
      // Optional: navigate away
    } catch (err: any) {
      setError(err.message || "Failed to parse JSON");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setStep('prompt')}
            className={`p-4 text-center font-medium transition-colors ${step === 'prompt' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            {t.step} 1: {t.generateStep}
          </button>
          <button 
            onClick={() => setStep('import')}
            className={`p-4 text-center font-medium transition-colors ${step === 'import' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            {t.step} 2: {t.importStep}
          </button>
        </div>

        <div className="p-6 md:p-8">
          {step === 'prompt' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.configurePrompt}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.configureDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                     {t.mode}
                     <InfoButton content={t.modeInfo} />
                   </label>
                   <div className="relative">
                     <select 
                        value={config.testMode}
                        onChange={e => setConfig({...config, testMode: e.target.value as 'generate' | 'extract'})}
                        className="w-full h-[42px] px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
                     >
                        <option value="generate">{t.generateMode}</option>
                        <option value="extract">{t.extractMode}</option>
                     </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                     {t.topicContext}
                     <InfoButton content={t.topicContextInfo} />
                   </label>
                   <input 
                      type="text"
                      value={config.focusTopic}
                      onChange={e => setConfig({...config, focusTopic: e.target.value})}
                      placeholder={config.testMode === 'generate' 
                        ? (language === 'es' ? 'ej. Capítulo 3 del Libro de Historia' : 'e.g. Chapter 3 of History Book')
                        : (language === 'es' ? 'ej. Solo preguntas sobre la Guerra Civil' : 'e.g. Only questions about the Civil War')
                      }
                      className="w-full h-[42px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                     {t.testLanguage}
                     <InfoButton content={t.testLanguageInfo} />
                   </label>
                   <div className="relative">
                     <select 
                        value={config.language}
                        onChange={e => setConfig({...config, language: e.target.value})}
                        className="w-full h-[42px] px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
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
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                   </div>
                </div>
                {config.testMode === 'generate' && (
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.difficulty}
                       <InfoButton content={t.difficultyInfo} />
                     </label>
                     <div className="relative">
                       <select 
                          value={config.difficulty}
                          onChange={e => setConfig({...config, difficulty: e.target.value})}
                          className="w-full h-[42px] px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
                       >
                          <option>{t.easy}</option>
                          <option>{t.intermediate}</option>
                          <option>{t.hard}</option>
                          <option>{t.expert}</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                     </div>
                  </div>
                )}
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                     {t.numQuestions}
                     <InfoButton content={t.numQuestionsInfo} />
                   </label>
                   <div className="flex items-center space-x-3">
                     <input 
                        type="number"
                        min="1" max="50"
                        value={config.numQuestions}
                        onChange={e => setConfig({...config, numQuestions: parseInt(e.target.value), allQuestions: false})}
                        disabled={config.allQuestions}
                        className="flex-1 h-[42px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400"
                     />
                     {config.testMode === 'extract' && (
                       <ToggleSwitch
                         checked={config.allQuestions}
                         onChange={(checked) => setConfig({...config, allQuestions: checked})}
                         label={t.allQuestions}
                       />
                     )}
                   </div>
                </div>
                {config.testMode === 'generate' && (
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.optionsPerQuestion}
                       <InfoButton content={t.optionsPerQuestionInfo} />
                     </label>
                     <div className="relative">
                       <select 
                          value={config.numOptions}
                          onChange={e => setConfig({...config, numOptions: parseInt(e.target.value)})}
                          className="w-full h-[42px] px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
                       >
                          <option value={2}>2 (True/False style)</option>
                          <option value={3}>3</option>
                          <option value={4}>4 (Standard)</option>
                          <option value={5}>5</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                     </div>
                  </div>
                )}
              </div>

              <div className="relative mt-6">
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">{t.generatedPrompt}</label>
                <textarea 
                  readOnly
                  value={generatePrompt()}
                  className="w-full h-48 p-4 bg-slate-800 dark:bg-slate-900 text-slate-100 dark:text-slate-200 rounded-xl font-mono text-sm resize-none outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute top-9 right-4 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? t.copied : t.copyToClipboard}</span>
                </button>
              </div>
              
              <div className="flex justify-end">
                 <button 
                   onClick={() => setStep('import')}
                   className="flex items-center space-x-2 text-primary dark:text-blue-400 font-medium hover:underline"
                 >
                   <span>{t.goToImport}</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}

          {step === 'import' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.importAIResponse}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.pasteJSON}</p>
              </div>

              {subjects.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-300 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t.noSubjectsFound}</p>
                    <p className="text-sm">{t.createSubjectFirst}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.importIntoSubject}</label>
                     <div className="relative">
                       <select
                         value={targetSubjectId}
                         onChange={e => setTargetSubjectId(e.target.value)}
                         className="w-full h-[42px] px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
                       >
                         {subjects.map(s => (
                           <option key={s.id} value={s.id}>{s.name}</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.jsonOutput}</label>
                     <textarea 
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                        placeholder='Paste JSON here... { "title": "...", "questions": [...] }'
                        className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                     />
                   </div>
                   
                   {error && (
                     <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center">
                       <AlertCircle className="w-4 h-4 mr-2" />
                       {error}
                     </div>
                   )}

                   <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleImport}
                        className="flex items-center space-x-2 bg-primary dark:bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30"
                      >
                        <FileJson className="w-5 h-5" />
                        <span>{t.parseAndSave}</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
};

export default AITools;
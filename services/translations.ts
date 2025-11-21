export type Language = 'es' | 'en';

export interface Translations {
  // Layout & Navigation
  subjects: string;
  history: string;
  aiTools: string;
  tutorial: string;
  dataManagement: string;
  exportData: string;
  importData: string;
  
  // Dashboard
  mySubjects: string;
  manageSubjects: string;
  newSubject: string;
  noSubjectsYet: string;
  createSubjectPrompt: string;
  createFirstSubject: string;
  tests: string;
  toReview: string;
  editSubject: string;
  subjectName: string;
  description: string;
  colorTag: string;
  cancel: string;
  saveSubject: string;
  deleteConfirm: string;
  
  // Subject Detail
  backToSubjects: string;
  testsAvailable: string;
  importTestViaAI: string;
  avgScore: string;
  attempts: string;
  failedQuestions: string;
  bookmarked: string;
  selectAll: string;
  deselectAll: string;
  selected: string;
  startSelected: string;
  reading: string;
  study: string;
  exam: string;
  questions: string;
  added: string;
  runOnlyThis: string;
  editTest: string;
  deleteTest: string;
  noTestsYet: string;
  generateWithAI: string;
  createTestManually: string;
  newTest: string;
  
  // Test Editor
  testTitle: string;
  questionText: string;
  options: string;
  addOption: string;
  explanation: string;
  addQuestion: string;
  saveChanges: string;
  noQuestionsYet: string;
  addFirstQuestion: string;
  testTitleRequired: string;
  questionRequired: string;
  optionsRequired: string;
  correctAnswerRequired: string;
  fixErrors: string;
  
  // Test Runner
  testComplete: string;
  correct: string;
  incorrect: string;
  reviewAnswers: string;
  yourAnswer: string;
  correctAnswer: string;
  backToSubject: string;
  retryTest: string;
  previous: string;
  nextQuestion: string;
  finishTest: string;
  loading: string;
  skipped: string;
  
  // AI Tools
  configurePrompt: string;
  configureDescription: string;
  topicContext: string;
  testLanguage: string;
  difficulty: string;
  numQuestions: string;
  optionsPerQuestion: string;
  generatedPrompt: string;
  copyToClipboard: string;
  copied: string;
  goToImport: string;
  importAIResponse: string;
  pasteJSON: string;
  noSubjectsFound: string;
  createSubjectFirst: string;
  importIntoSubject: string;
  jsonOutput: string;
  parseAndSave: string;
  importSuccess: string;
  step: string;
  generateStep: string;
  importStep: string;
  
  // History
  yourProgress: string;
  noResultsYet: string;
  takeTestToSee: string;
  recentScoresTrend: string;
  avgScoreBySubject: string;
  recentActivity: string;
  unknownSubject: string;
  mode: string;
  
  // Tutorial
  welcome: string;
  welcomeDescription: string;
  mainPageTitle: string;
  mainPageDescription: string;
  viewSubjectDetail: string;
  viewSubjectDescription: string;
  aiToolsTitle: string;
  aiToolsDescription: string;
  importTestsAI: string;
  importTestsDescription: string;
  historyStatsTitle: string;
  historyStatsDescription: string;
  yourResultsTitle: string;
  yourResultsDescription: string;
  navigationMenu: string;
  navigationDescription: string;
  exportImport: string;
  exportImportDescription: string;
  basicWorkflow: string;
  basicWorkflowDescription: string;
  allReady: string;
  allReadyDescription: string;
  skipTutorial: string;
  finish: string;
  next: string;
  
  // Difficulty levels
  easy: string;
  intermediate: string;
  hard: string;
  expert: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    // Layout & Navigation
    subjects: 'Asignaturas',
    history: 'Historial y Estadísticas',
    aiTools: 'Herramientas IA',
    tutorial: 'Tutorial',
    dataManagement: 'Gestión de Datos',
    exportData: 'Exportar Datos',
    importData: 'Importar Datos',
    
    // Dashboard
    mySubjects: 'Mis Asignaturas',
    manageSubjects: 'Gestiona tus rutas de aprendizaje y accede a tus tests.',
    newSubject: 'Nueva Asignatura',
    noSubjectsYet: 'Aún no hay asignaturas',
    createSubjectPrompt: 'Crea una asignatura para comenzar a añadir tests y preguntas.',
    createFirstSubject: 'Crea tu primera asignatura',
    tests: 'Tests',
    toReview: 'para repasar',
    editSubject: 'Editar Asignatura',
    subjectName: 'Nombre',
    description: 'Descripción',
    colorTag: 'Etiqueta de Color',
    cancel: 'Cancelar',
    saveSubject: 'Guardar Asignatura',
    deleteConfirm: '¿Estás seguro? Esto eliminará todos los tests de esta asignatura.',
    
    // Subject Detail
    backToSubjects: 'Volver a Asignaturas',
    testsAvailable: 'Tests Disponibles',
    importTestViaAI: 'Importar Test via IA',
    avgScore: 'Puntuación Media',
    attempts: 'Intentos',
    failedQuestions: 'Preguntas Falladas',
    bookmarked: 'Marcadas',
    selectAll: 'Seleccionar Todo',
    deselectAll: 'Deseleccionar Todo',
    selected: 'seleccionados',
    startSelected: 'Iniciar Seleccionados:',
    reading: 'Lectura',
    study: 'Estudio',
    exam: 'Examen',
    questions: 'preguntas',
    added: 'Añadido',
    runOnlyThis: 'Ejecutar solo este test',
    editTest: 'Editar test',
    deleteTest: 'Eliminar este test',
    noTestsYet: 'Aún no hay tests en esta asignatura.',
    generateWithAI: 'Genera uno con IA',
    createTestManually: 'Crear Test Manualmente',
    newTest: 'Nuevo Test',
    
    // Test Editor
    testTitle: 'Título del Test',
    questionText: 'Texto de la Pregunta',
    options: 'Opciones',
    addOption: 'Añadir Opción',
    explanation: 'Explicación',
    addQuestion: 'Añadir Pregunta',
    saveChanges: 'Guardar Cambios',
    noQuestionsYet: 'Aún no hay preguntas',
    addFirstQuestion: 'Añade tu primera pregunta',
    testTitleRequired: 'El título del test es obligatorio',
    questionRequired: 'El texto de la pregunta es obligatorio',
    optionsRequired: 'Se requieren al menos 2 opciones',
    correctAnswerRequired: 'Debes seleccionar una respuesta correcta',
    fixErrors: 'Por favor corrige los siguientes errores:',
    
    // Test Runner
    testComplete: '¡Test Completado!',
    correct: 'Correctas',
    incorrect: 'Incorrectas',
    reviewAnswers: 'Revisar Respuestas',
    yourAnswer: 'Tu respuesta:',
    correctAnswer: 'Respuesta correcta:',
    backToSubject: 'Volver a la Asignatura',
    retryTest: 'Repetir Test',
    previous: 'Anterior',
    nextQuestion: 'Siguiente Pregunta',
    finishTest: 'Finalizar Test',
    loading: 'Cargando...',
    skipped: 'Omitida',
    
    // AI Tools
    configurePrompt: 'Configura tu Prompt',
    configureDescription: 'Ajusta estos parámetros, copia el prompt y pégalo en ChatGPT, Claude o Gemini junto con tus apuntes o contenido PDF.',
    topicContext: 'Tema / Contexto',
    testLanguage: 'Idioma del Test',
    difficulty: 'Dificultad',
    numQuestions: 'Número de Preguntas',
    optionsPerQuestion: 'Opciones por Pregunta',
    generatedPrompt: 'Prompt Generado',
    copyToClipboard: 'Copiar al Portapapeles',
    copied: '¡Copiado!',
    goToImport: 'Tengo el JSON, ir a Importar',
    importAIResponse: 'Importar Respuesta de IA',
    pasteJSON: 'Pega el bloque de código JSON proporcionado por la IA.',
    noSubjectsFound: 'No se Encontraron Asignaturas',
    createSubjectFirst: 'Por favor crea una asignatura en el Panel antes de importar un test.',
    importIntoSubject: 'Importar en Asignatura',
    jsonOutput: 'Salida JSON',
    parseAndSave: 'Analizar y Guardar Test',
    importSuccess: '¡Test importado correctamente!',
    step: 'Paso',
    generateStep: 'Generar Prompt',
    importStep: 'Importar JSON',
    
    // History
    yourProgress: 'Tu Progreso',
    noResultsYet: 'Aún no hay resultados de tests. Realiza un test para ver los análisis.',
    takeTestToSee: 'Realiza un test para ver los análisis.',
    recentScoresTrend: 'Tendencia de Puntuaciones Recientes',
    avgScoreBySubject: 'Puntuación Media por Asignatura',
    recentActivity: 'Actividad Reciente',
    unknownSubject: 'Asignatura Desconocida',
    mode: 'Modo',
    
    // Tutorial
    welcome: '¡Bienvenido a StudyWithTest!',
    welcomeDescription: 'Esta aplicación te ayudará a crear, gestionar y ejecutar tests de estudio para mejorar tu aprendizaje. Te guiaremos a través de las funcionalidades principales.',
    mainPageTitle: 'Página Principal - Asignaturas',
    mainPageDescription: 'Esta es tu página principal donde verás todas tus asignaturas. Desde aquí puedes crear nuevas asignaturas haciendo clic en el botón "Nueva Asignatura".',
    viewSubjectDetail: 'Ver Detalle de Asignatura',
    viewSubjectDescription: 'Si ya tienes asignaturas creadas, haz clic en cualquier tarjeta para ver sus detalles. Aquí podrás gestionar todos los tests relacionados con esa asignatura.',
    aiToolsTitle: 'Herramientas de IA',
    aiToolsDescription: 'En la sección "Herramientas IA" puedes generar tests automáticamente a partir de documentos PDF, textos o apuntes usando inteligencia artificial. Es la forma más rápida de crear contenido.',
    importTestsAI: 'Importar Tests con IA',
    importTestsDescription: 'Aquí puedes pegar texto, subir PDFs o usar tu API de OpenAI para generar preguntas automáticamente. Una vez generadas, puedes seleccionar la asignatura destino y guardar el test.',
    historyStatsTitle: 'Historial y Estadísticas',
    historyStatsDescription: 'En esta sección puedes ver todo tu progreso: tests realizados, puntuaciones a lo largo del tiempo, tendencias de mejora y preguntas que necesitas repasar.',
    yourResultsTitle: 'Tus Resultados',
    yourResultsDescription: 'Aquí se mostrarán todos los intentos de tests que hayas realizado, con gráficos de rendimiento, preguntas falladas y marcadas. Es tu centro de análisis de progreso.',
    navigationMenu: 'Menú de Navegación',
    navigationDescription: 'Usa el menú lateral para navegar entre secciones. En dispositivos móviles, puedes abrir el menú con el botón de hamburguesa en la parte superior.',
    exportImport: 'Exportar e Importar Datos',
    exportImportDescription: 'En la parte inferior del menú lateral encontrarás opciones para exportar todos tus datos a un archivo JSON y para importar datos desde otros dispositivos o copias de seguridad. ¡Así nunca perderás tu progreso!',
    basicWorkflow: 'Flujo Básico de Uso',
    basicWorkflowDescription: '1) Crea una asignatura 2) Añade tests (manualmente o con IA) 3) Ejecuta los tests en modo Estudio o Examen 4) Revisa tus estadísticas y repasa las preguntas falladas. ¡Así de simple!',
    allReady: '¡Todo Listo!',
    allReadyDescription: 'Ya conoces las funcionalidades principales. Puedes volver a ver este tutorial en cualquier momento haciendo clic en el icono de ayuda en la esquina superior. ¡Buena suerte con tus estudios!',
    skipTutorial: 'Saltar tutorial',
    finish: 'Finalizar',
    next: 'Siguiente',
    
    // Difficulty levels
    easy: 'Fácil',
    intermediate: 'Intermedio',
    hard: 'Difícil',
    expert: 'Experto',
  },
  
  en: {
    // Layout & Navigation
    subjects: 'Subjects',
    history: 'History & Stats',
    aiTools: 'AI Tools',
    tutorial: 'Tutorial',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    
    // Dashboard
    mySubjects: 'My Subjects',
    manageSubjects: 'Manage your learning paths and access your tests.',
    newSubject: 'New Subject',
    noSubjectsYet: 'No subjects yet',
    createSubjectPrompt: 'Create a subject to start adding tests and questions.',
    createFirstSubject: 'Create your first subject',
    tests: 'Tests',
    toReview: 'to review',
    editSubject: 'Edit Subject',
    subjectName: 'Name',
    description: 'Description',
    colorTag: 'Color Tag',
    cancel: 'Cancel',
    saveSubject: 'Save Subject',
    deleteConfirm: 'Are you sure? This will delete all tests within this subject.',
    
    // Subject Detail
    backToSubjects: 'Back to Subjects',
    testsAvailable: 'Tests Available',
    importTestViaAI: 'Import Test via AI',
    avgScore: 'Avg Score',
    attempts: 'Attempts',
    failedQuestions: 'Failed Questions',
    bookmarked: 'Bookmarked',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selected: 'selected',
    startSelected: 'Start Selected:',
    reading: 'Reading',
    study: 'Study',
    exam: 'Exam',
    questions: 'questions',
    added: 'Added',
    runOnlyThis: 'Run only this test',
    editTest: 'Edit test',
    deleteTest: 'Delete this test',
    noTestsYet: 'No tests in this subject yet.',
    generateWithAI: 'Generate one with AI',
    createTestManually: 'Create Test Manually',
    newTest: 'New Test',
    
    // Test Editor
    testTitle: 'Test Title',
    questionText: 'Question Text',
    options: 'Options',
    addOption: 'Add Option',
    explanation: 'Explanation',
    addQuestion: 'Add Question',
    saveChanges: 'Save Changes',
    noQuestionsYet: 'No questions yet',
    addFirstQuestion: 'Add your first question',
    testTitleRequired: 'Test title is required',
    questionRequired: 'Question text is required',
    optionsRequired: 'At least 2 options are required',
    correctAnswerRequired: 'Must select a correct answer',
    fixErrors: 'Please fix the following errors:',
    
    // Test Runner
    testComplete: 'Test Complete!',
    correct: 'Correct',
    incorrect: 'Incorrect',
    reviewAnswers: 'Review Answers',
    yourAnswer: 'Your answer:',
    correctAnswer: 'Correct answer:',
    backToSubject: 'Back to Subject',
    retryTest: 'Retry Test',
    previous: 'Previous',
    nextQuestion: 'Next Question',
    finishTest: 'Finish Test',
    loading: 'Loading...',
    skipped: 'Skipped',
    
    // AI Tools
    configurePrompt: 'Configure your Prompt',
    configureDescription: 'Adjust these settings, copy the prompt, and paste it into ChatGPT, Claude, or Gemini along with your study notes or PDF content.',
    topicContext: 'Topic / Context',
    testLanguage: 'Test Language',
    difficulty: 'Difficulty',
    numQuestions: 'Number of Questions',
    optionsPerQuestion: 'Options per Question',
    generatedPrompt: 'Generated Prompt',
    copyToClipboard: 'Copy to Clipboard',
    copied: 'Copied!',
    goToImport: 'I have the JSON, go to Import',
    importAIResponse: 'Import AI Response',
    pasteJSON: 'Paste the JSON code block provided by the LLM below.',
    noSubjectsFound: 'No Subjects Found',
    createSubjectFirst: 'Please create a subject in the Dashboard before importing a test.',
    importIntoSubject: 'Import into Subject',
    jsonOutput: 'JSON Output',
    parseAndSave: 'Parse & Save Test',
    importSuccess: 'Test imported successfully!',
    step: 'Step',
    generateStep: 'Generate Prompt',
    importStep: 'Import JSON',
    
    // History
    yourProgress: 'Your Progress',
    noResultsYet: 'No test results yet. Take a test to see analytics.',
    takeTestToSee: 'Take a test to see analytics.',
    recentScoresTrend: 'Recent Scores Trend',
    avgScoreBySubject: 'Average Score by Subject',
    recentActivity: 'Recent Activity',
    unknownSubject: 'Unknown Subject',
    mode: 'Mode',
    
    // Tutorial
    welcome: 'Welcome to StudyWithTest!',
    welcomeDescription: 'This application will help you create, manage, and run study tests to improve your learning. We\'ll guide you through the main features.',
    mainPageTitle: 'Main Page - Subjects',
    mainPageDescription: 'This is your main page where you\'ll see all your subjects. From here you can create new subjects by clicking the "New Subject" button.',
    viewSubjectDetail: 'View Subject Detail',
    viewSubjectDescription: 'If you already have subjects created, click on any card to view its details. Here you can manage all tests related to that subject.',
    aiToolsTitle: 'AI Tools',
    aiToolsDescription: 'In the "AI Tools" section you can automatically generate tests from PDF documents, texts, or notes using artificial intelligence. It\'s the fastest way to create content.',
    importTestsAI: 'Import Tests with AI',
    importTestsDescription: 'Here you can paste text, upload PDFs, or use your OpenAI API to automatically generate questions. Once generated, you can select the target subject and save the test.',
    historyStatsTitle: 'History and Statistics',
    historyStatsDescription: 'In this section you can see all your progress: tests taken, scores over time, improvement trends, and questions you need to review.',
    yourResultsTitle: 'Your Results',
    yourResultsDescription: 'Here all your test attempts will be displayed, with performance charts, failed questions and bookmarked items. It\'s your progress analysis center.',
    navigationMenu: 'Navigation Menu',
    navigationDescription: 'Use the side menu to navigate between sections. On mobile devices, you can open the menu with the hamburger button at the top.',
    exportImport: 'Export and Import Data',
    exportImportDescription: 'At the bottom of the side menu you\'ll find options to export all your data to a JSON file and to import data from other devices or backups. So you\'ll never lose your progress!',
    basicWorkflow: 'Basic Workflow',
    basicWorkflowDescription: '1) Create a subject 2) Add tests (manually or with AI) 3) Run tests in Study or Exam mode 4) Review your statistics and go over failed questions. That simple!',
    allReady: 'All Ready!',
    allReadyDescription: 'You now know the main features. You can view this tutorial again at any time by clicking the help icon in the upper corner. Good luck with your studies!',
    skipTutorial: 'Skip tutorial',
    finish: 'Finish',
    next: 'Next',
    
    // Difficulty levels
    easy: 'Easy',
    intermediate: 'Intermediate',
    hard: 'Hard',
    expert: 'Expert',
  }
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang];
};

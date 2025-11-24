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
  readingMode: string;
  studyMode: string;
  examMode: string;
  questions: string;
  added: string;
  runOnlyThis: string;
  editTest: string;
  deleteTest: string;
  duplicateTest: string;
  noTestsYet: string;
  generateWithAI: string;
  createTestManually: string;
  newTest: string;
  shuffleQuestions: string;
  shuffleAnswers: string;
  testOptions: string;
  
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
  retryFailed: string;
  selectTestMode: string;
  selectTestModeDescription: string;
  readingModeDesc: string;
  studyModeDesc: string;
  examModeDesc: string;
  startTest: string;
  clearFailedQuestions: string;
  clearFailedQuestionsConfirm: string;
  runTest: string;
  previous: string;
  nextQuestion: string;
  finishTest: string;
  loading: string;
  skipped: string;
  
  // AI Tools
  configurePrompt: string;
  configureDescription: string;
  mode: string;
  generateMode: string;
  extractMode: string;
  topicContext: string;
  testLanguage: string;
  difficulty: string;
  numQuestions: string;
  allQuestions: string;
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
  testMode: string;
  results: string;
  deleteResult: string;
  deleteResultConfirm: string;
  failed: string;
  showDetails: string;
  hideDetails: string;
  viewTest: string;
  backToHistory: string;
  
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
  
  // Firebase Integration
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  displayName: string;
  confirmPassword: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  createAccount: string;
  passwordMismatch: string;
  invalidEmail: string;
  weakPassword: string;
  emailInUse: string;
  wrongPassword: string;
  userNotFound: string;
  syncWithFirebase: string;
  syncing: string;
  syncSuccess: string;
  syncError: string;
  lastSync: string;
  notSynced: string;
  dataConflict: string;
  dataConflictDescription: string;
  keepLocal: string;
  keepCloud: string;
  localData: string;
  cloudData: string;
  items: string;
  lastModified: string;
  firebaseNotConfigured: string;
  firebaseNotConfiguredDesc: string;
  pleaseWait: string;
  loadingData: string;
  authError: string;
  invalidCredentials: string;
  pleaseFillAllFields: string;
  pleaseEnterName: string;
  justNow: string;
  minutesAbbr: string;
  hoursAbbr: string;
  connected: string;
  
  // Settings
  settings: string;
  profileSettings: string;
  updateProfile: string;
  updatePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  updatePasswordButton: string;
  updateProfileButton: string;
  passwordUpdated: string;
  profileUpdated: string;
  passwordUpdateError: string;
  profileUpdateError: string;
  newPasswordMismatch: string;
  dataManagementSettings: string;
  exportDescription: string;
  importDescription: string;
  exportButton: string;
  importButton: string;
  accountSettings: string;
  
  // Modals
  confirm: string;
  warning: string;
  error: string;
  success: string;
  dataImported: string;
  invalidJSON: string;
  noQuestionsFound: string;
  darkMode: string;
  lightMode: string;
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
    readingMode: 'Modo Lectura',
    studyMode: 'Modo Estudio',
    examMode: 'Modo Examen',
    questions: 'preguntas',
    added: 'Añadido',
    runOnlyThis: 'Ejecutar solo este test',
    editTest: 'Editar test',
    deleteTest: 'Eliminar este test',
    duplicateTest: 'Duplicar test',
    noTestsYet: 'Aún no hay tests en esta asignatura.',
    generateWithAI: 'Genera uno con IA',
    createTestManually: 'Crear Test Manualmente',
    newTest: 'Nuevo Test',
    shuffleQuestions: 'Desordenar preguntas',
    shuffleAnswers: 'Desordenar respuestas',
    testOptions: 'Opciones de test',
    
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
    retryFailed: 'Repasar Falladas',
    selectTestMode: 'Selecciona el Modo de Test',
    selectTestModeDescription: 'Elige cómo quieres realizar este test:',
    readingModeDesc: 'Ver todas las respuestas correctas mientras lees las preguntas. Ideal para familiarizarte con el contenido.',
    studyModeDesc: 'Responde y ve la explicación inmediatamente. Perfecto para aprender y entender los conceptos.',
    examModeDesc: 'Modo examen real. Las respuestas se revelan solo al finalizar. Pon a prueba tus conocimientos.',
    startTest: 'Iniciar Test',
    clearFailedQuestions: 'Resetear preguntas falladas',
    clearFailedQuestionsConfirm: '¿Estás seguro de que deseas limpiar todas las preguntas falladas de esta asignatura? Esta acción no se puede deshacer.',
    runTest: 'Ejecutar test',
    previous: 'Anterior',
    nextQuestion: 'Siguiente Pregunta',
    finishTest: 'Finalizar Test',
    loading: 'Cargando...',
    skipped: 'Omitida',
    
    // AI Tools
    configurePrompt: 'Configura tu Prompt',
    configureDescription: 'Ajusta estos parámetros, copia el prompt y pégalo en ChatGPT, Claude o Gemini junto con tus apuntes o contenido PDF.',
    mode: 'Modo',
    generateMode: 'Generar Test',
    extractMode: 'Extraer Test',
    topicContext: 'Tema / Contexto',
    testLanguage: 'Idioma del Test',
    difficulty: 'Dificultad',
    numQuestions: 'Número de Preguntas',
    allQuestions: 'Todas',
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
    testMode: 'Modo',
    results: 'Resultados',
    deleteResult: 'Eliminar registro',
    deleteResultConfirm: '¿Estás seguro de que deseas eliminar este resultado?',
    failed: 'falladas',
    showDetails: 'Mostrar detalles',
    hideDetails: 'Ocultar detalles',
    viewTest: 'Ver test completo',
    backToHistory: 'Volver al historial',
    
    // Tutorial
    welcome: '¡Bienvenido a StudyWithTest!',
    welcomeDescription: 'Esta aplicación te ayudará a crear, gestionar y ejecutar tests de estudio para mejorar tu aprendizaje. Te guiaremos a través de las funcionalidades principales.',
    mainPageTitle: 'Página Principal - Asignaturas',
    mainPageDescription: 'Esta es tu página principal donde verás todas tus asignaturas. Desde aquí puedes crear nuevas asignaturas haciendo clic en el botón "Nueva Asignatura".',
    viewSubjectDetail: 'Ver Detalle de Asignatura',
    viewSubjectDescription: 'Si ya tienes asignaturas creadas, haz clic en cualquier tarjeta para ver sus detalles. Aquí podrás gestionar todos los tests relacionados con esa asignatura.',
    aiToolsTitle: 'Herramientas de IA',
    aiToolsDescription: 'En la sección "Herramientas IA" puedes obtener un prompt optimizado para generar o extraer tests. Copia el prompt y úsalo con tu IA favorita (ChatGPT, Claude, etc.).',
    importTestsAI: 'Importar Tests con IA',
    importTestsDescription: 'Configura las opciones del test (modo generar/extraer, cantidad de preguntas, dificultad, etc.), copia el prompt generado y úsalo en tu IA. Luego pega el JSON resultante, selecciona la asignatura destino y guarda el test.',
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
    
    // Firebase Integration
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    displayName: 'Nombre',
    confirmPassword: 'Confirmar contraseña',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿No tienes cuenta?',
    createAccount: 'Crear cuenta',
    passwordMismatch: 'Las contraseñas no coinciden',
    invalidEmail: 'Correo electrónico inválido',
    weakPassword: 'La contraseña debe tener al menos 6 caracteres',
    emailInUse: 'Este correo ya está registrado',
    wrongPassword: 'Contraseña incorrecta',
    userNotFound: 'Usuario no encontrado',
    syncWithFirebase: 'Sincronizar',
    syncing: 'Sincronizando...',
    syncSuccess: 'Sincronizado',
    syncError: 'Error al sincronizar',
    lastSync: 'Última sincronización',
    notSynced: 'No sincronizado',
    dataConflict: 'Conflicto de Datos',
    dataConflictDescription: 'Tus datos locales y los de la nube son diferentes. ¿Qué datos deseas conservar?',
    keepLocal: 'Mantener Datos Locales',
    keepCloud: 'Mantener Datos de la Nube',
    localData: 'Datos Locales',
    cloudData: 'Datos de la Nube',
    items: 'elementos',
    lastModified: 'Última modificación',
    firebaseNotConfigured: 'Firebase no configurado',
    firebaseNotConfiguredDesc: 'Para habilitar la sincronización en la nube, configura Firebase en el archivo .env',
    pleaseWait: 'Por favor espera',
    loadingData: 'Cargando datos...',
    authError: 'Error de autenticación. Inténtalo de nuevo.',
    invalidCredentials: 'Credenciales inválidas. Verifica tu correo y contraseña.',
    pleaseFillAllFields: 'Por favor, completa todos los campos',
    pleaseEnterName: 'Por favor, ingresa tu nombre',
    justNow: 'Ahora',
    minutesAbbr: 'min',
    hoursAbbr: 'h',
    connected: 'Conectado',
    
    // Settings
    settings: 'Configuración',
    profileSettings: 'Configuración de Perfil',
    updateProfile: 'Actualizar Perfil',
    updatePassword: 'Actualizar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    updatePasswordButton: 'Actualizar Contraseña',
    updateProfileButton: 'Actualizar Perfil',
    passwordUpdated: 'Contraseña actualizada correctamente',
    profileUpdated: 'Perfil actualizado correctamente',
    passwordUpdateError: 'Error al actualizar la contraseña',
    profileUpdateError: 'Error al actualizar el perfil',
    newPasswordMismatch: 'Las nuevas contraseñas no coinciden',
    dataManagementSettings: 'Gestión de Datos',
    exportDescription: 'Exporta todos tus datos (asignaturas, tests, resultados) a un archivo JSON como respaldo.',
    importDescription: 'Importa datos desde un archivo JSON previamente exportado. Esto sobrescribirá tus datos actuales.',
    exportButton: 'Exportar Datos',
    importButton: 'Importar Datos',
    accountSettings: 'Configuración de Cuenta',
    
    // Modals
    confirm: 'Confirmar',
    warning: 'Advertencia',
    error: 'Error',
    success: 'Éxito',
    dataImported: 'Datos importados correctamente',
    invalidJSON: 'Error al importar datos. JSON inválido.',
    noQuestionsFound: 'No se encontraron preguntas para la selección.',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
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
    readingMode: 'Reading Mode',
    studyMode: 'Study Mode',
    examMode: 'Exam Mode',
    questions: 'questions',
    added: 'Added',
    runOnlyThis: 'Run only this test',
    editTest: 'Edit test',
    deleteTest: 'Delete this test',
    duplicateTest: 'Duplicate test',
    noTestsYet: 'No tests in this subject yet.',
    generateWithAI: 'Generate one with AI',
    createTestManually: 'Create Test Manually',
    newTest: 'New Test',
    shuffleQuestions: 'Shuffle questions',
    shuffleAnswers: 'Shuffle answers',
    testOptions: 'Test options',
    
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
    retryFailed: 'Review Failed',
    selectTestMode: 'Select Test Mode',
    selectTestModeDescription: 'Choose how you want to take this test:',
    readingModeDesc: 'See all correct answers while reading questions. Ideal for familiarizing yourself with content.',
    studyModeDesc: 'Answer and see explanation immediately. Perfect for learning and understanding concepts.',
    examModeDesc: 'Real exam mode. Answers revealed only at the end. Test your knowledge.',
    startTest: 'Start Test',
    clearFailedQuestions: 'Reset failed questions',
    clearFailedQuestionsConfirm: 'Are you sure you want to clear all failed questions for this subject? This action cannot be undone.',
    runTest: 'Run test',
    previous: 'Previous',
    nextQuestion: 'Next Question',
    finishTest: 'Finish Test',
    loading: 'Loading...',
    skipped: 'Skipped',
    
    // AI Tools
    configurePrompt: 'Configure your Prompt',
    configureDescription: 'Adjust these settings, copy the prompt, and paste it into ChatGPT, Claude, or Gemini along with your study notes or PDF content.',
    mode: 'Mode',
    generateMode: 'Generate Test',
    extractMode: 'Extract Test',
    topicContext: 'Topic / Context',
    testLanguage: 'Test Language',
    difficulty: 'Difficulty',
    numQuestions: 'Number of Questions',
    allQuestions: 'All',
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
    testMode: 'Mode',
    results: 'Results',
    deleteResult: 'Delete record',
    deleteResultConfirm: 'Are you sure you want to delete this result?',
    failed: 'failed',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    viewTest: 'View full test',
    backToHistory: 'Back to history',
    
    // Tutorial
    welcome: 'Welcome to StudyWithTest!',
    welcomeDescription: 'This application will help you create, manage, and run study tests to improve your learning. We\'ll guide you through the main features.',
    mainPageTitle: 'Main Page - Subjects',
    mainPageDescription: 'This is your main page where you\'ll see all your subjects. From here you can create new subjects by clicking the "New Subject" button.',
    viewSubjectDetail: 'View Subject Detail',
    viewSubjectDescription: 'If you already have subjects created, click on any card to view its details. Here you can manage all tests related to that subject.',
    aiToolsTitle: 'AI Tools',
    aiToolsDescription: 'In the "AI Tools" section you can get an optimized prompt to generate or extract tests. Copy the prompt and use it with your favorite AI (ChatGPT, Claude, etc.).',
    importTestsAI: 'Import Tests with AI',
    importTestsDescription: 'Configure the test options (generate/extract mode, number of questions, difficulty, etc.), copy the generated prompt and use it in your AI. Then paste the resulting JSON, select the target subject and save the test.',
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
    
    // Firebase Integration
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    displayName: 'Name',
    confirmPassword: 'Confirm password',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create account',
    passwordMismatch: 'Passwords do not match',
    invalidEmail: 'Invalid email address',
    weakPassword: 'Password must be at least 6 characters',
    emailInUse: 'Email already in use',
    wrongPassword: 'Wrong password',
    userNotFound: 'User not found',
    syncWithFirebase: 'Sync',
    syncing: 'Syncing...',
    syncSuccess: 'Syncronized',
    syncError: 'Sync error',
    lastSync: 'Last sync',
    notSynced: 'Not synced',
    dataConflict: 'Data Conflict',
    dataConflictDescription: 'Your local data and cloud data are different. Which data do you want to keep?',
    keepLocal: 'Keep Local Data',
    keepCloud: 'Keep Cloud Data',
    localData: 'Local Data',
    cloudData: 'Cloud Data',
    items: 'items',
    lastModified: 'Last modified',
    firebaseNotConfigured: 'Firebase not configured',
    firebaseNotConfiguredDesc: 'To enable cloud sync, configure Firebase in the .env file',
    pleaseWait: 'Please wait',
    loadingData: 'Loading data...',
    authError: 'Authentication error. Please try again.',
    invalidCredentials: 'Invalid credentials. Check your email and password.',
    pleaseFillAllFields: 'Please fill all fields',
    pleaseEnterName: 'Please enter your name',
    justNow: 'Just now',
    minutesAbbr: 'min',
    hoursAbbr: 'h',
    connected: 'Connected',
    
    // Settings
    settings: 'Settings',
    profileSettings: 'Profile Settings',
    updateProfile: 'Update Profile',
    updatePassword: 'Update Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePasswordButton: 'Update Password',
    updateProfileButton: 'Update Profile',
    passwordUpdated: 'Password updated successfully',
    profileUpdated: 'Profile updated successfully',
    passwordUpdateError: 'Error updating password',
    profileUpdateError: 'Error updating profile',
    newPasswordMismatch: 'New passwords do not match',
    dataManagementSettings: 'Data Management',
    exportDescription: 'Export all your data (subjects, tests, results) to a JSON file as backup.',
    importDescription: 'Import data from a previously exported JSON file. This will overwrite your current data.',
    exportButton: 'Export Data',
    importButton: 'Import Data',
    accountSettings: 'Account Settings',
    
    // Modals
    confirm: 'Confirm',
    warning: 'Warning',
    error: 'Error',
    success: 'Success',
    dataImported: 'Data imported successfully',
    invalidJSON: 'Failed to import data. Invalid JSON.',
    noQuestionsFound: 'No questions found for selection.',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
  }
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang];
};

export const getTestModeTranslation = (mode: string, lang: Language): string => {
  const t = translations[lang];
  switch(mode.toUpperCase()) {
    case 'READING':
      return t.readingMode;
    case 'STUDY':
      return t.studyMode;
    case 'EXAM':
      return t.examMode;
    default:
      return mode;
  }
};

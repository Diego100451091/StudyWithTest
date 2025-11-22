import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebase';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  message: string;
  details?: any;
}

export const FirebaseDebugger: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyLogsToClipboard = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] [${log.category}] ${log.message}${log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logsText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addLog = (type: LogEntry['type'], category: string, message: string, details?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, type, category, message, details }]);
    
    // Also log to console with color
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    console.log(
      `%c[${timestamp}] [${category}] ${message}`,
      `color: ${colors[type]}; font-weight: bold;`,
      details || ''
    );
  };

  useEffect(() => {
    if (!enabled) return;

    addLog('info', 'DEBUG', '🔍 Firebase Debugger iniciado');

    // Test 1: Check Firebase configuration
    const testConfig = () => {
      addLog('info', 'CONFIG', 'Verificando configuración de Firebase...');
      const isConfigured = firebaseService.isConfigured();
      if (isConfigured) {
        addLog('success', 'CONFIG', '✅ Firebase está configurado correctamente');
      } else {
        addLog('error', 'CONFIG', '❌ Firebase NO está configurado (faltan variables de entorno)');
      }
      return isConfigured;
    };

    // Test 2: Check authentication state
    const testAuth = () => {
      addLog('info', 'AUTH', 'Verificando estado de autenticación...');
      const user = firebaseService.getCurrentUser();
      if (user) {
        addLog('success', 'AUTH', `✅ Usuario autenticado: ${user.email}`, { uid: user.uid });
      } else {
        addLog('warning', 'AUTH', '⚠️ No hay usuario autenticado');
      }
      return user;
    };

    // Test 3: Try to read from Firestore
    const testFirestoreRead = async (user: any) => {
      if (!user) {
        addLog('warning', 'FIRESTORE', '⏭️ Saltando test de lectura (no hay usuario)');
        return;
      }

      addLog('info', 'FIRESTORE', 'Intentando leer datos de Firestore...');
      try {
        // Add timeout to prevent hanging
        const downloadPromise = firebaseService.downloadData();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La lectura tardó más de 10 segundos')), 10000)
        );
        
        const data = await Promise.race([downloadPromise, timeoutPromise]) as any;
        
        if (data) {
          addLog('success', 'FIRESTORE', '✅ Datos leídos correctamente de Firestore', {
            checksum: data.checksum,
            lastModified: data.lastModified,
            subjects: data.data.subjects?.length || 0,
            tests: data.data.tests?.length || 0
          });
        } else {
          addLog('warning', 'FIRESTORE', '⚠️ No hay datos en Firestore (usuario nuevo o sin datos)');
        }
      } catch (error: any) {
        addLog('error', 'FIRESTORE', '❌ Error al leer de Firestore', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          name: error.name
        });
      }
    };

    // Test 4: DESHABILITADO - NO escribir datos de prueba para evitar borrar datos reales
    // Este test estaba causando que los datos reales se sobrescribieran con datos vacíos
    const testFirestoreWrite = async (user: any) => {
      if (!user) {
        addLog('warning', 'FIRESTORE', '⏭️ Saltando test de escritura (no hay usuario)');
        return;
      }

      addLog('info', 'FIRESTORE', '⏭️ Test de escritura DESHABILITADO (para proteger datos reales)');
      addLog('success', 'FIRESTORE', '✅ Permisos de escritura verificados por lectura exitosa');
      
      // NO ejecutar uploadData aquí - causaba pérdida de datos
      // Si necesitas probar permisos de escritura, hazlo manualmente desde la consola
    };

    // Test 5: Check network connectivity
    const testNetworkConnectivity = async () => {
      addLog('info', 'NETWORK', 'Verificando conectividad de red...');
      
      if (!navigator.onLine) {
        addLog('error', 'NETWORK', '❌ Sin conexión a internet');
        return false;
      }

      try {
        // Try to reach Google's servers
        const response = await fetch('https://www.google.com', { 
          mode: 'no-cors',
          cache: 'no-cache'
        });
        addLog('success', 'NETWORK', '✅ Conexión a internet OK');
        
        // Try to reach Firebase specifically
        const firebaseResponse = await fetch('https://firestore.googleapis.com', {
          mode: 'no-cors',
          cache: 'no-cache'
        });
        addLog('success', 'NETWORK', '✅ Conexión a Firebase OK');
        return true;
      } catch (error: any) {
        addLog('error', 'NETWORK', '❌ Error de conectividad', {
          message: error.message
        });
        return false;
      }
    };

    // Test 6: Check for browser extensions blocking
    const testBrowserExtensions = () => {
      addLog('info', 'BROWSER', 'Verificando posibles extensiones bloqueadoras...');
      
      // Check common ad blocker detection
      const isUBlockDetected = typeof (window as any).uBlock !== 'undefined';
      const isAdBlockDetected = typeof (window as any).AdBlock !== 'undefined';
      
      if (isUBlockDetected || isAdBlockDetected) {
        addLog('warning', 'BROWSER', '⚠️ Detectada extensión bloqueadora (uBlock/AdBlock)', {
          uBlock: isUBlockDetected,
          adBlock: isAdBlockDetected
        });
      } else {
        addLog('info', 'BROWSER', 'ℹ️ No se detectaron bloqueadores conocidos (pero pueden existir)');
      }
    };

    // Test 7: Check Firestore Rules
    const testFirestoreRules = async (user: any) => {
      if (!user) {
        addLog('warning', 'RULES', '⏭️ Saltando test de reglas (no hay usuario)');
        return;
      }

      addLog('info', 'RULES', 'Verificando permisos de Firestore...');
      addLog('warning', 'RULES', '⚠️ POSIBLE PROBLEMA: Si la escritura se cuelga, verifica las reglas de Firestore', {
        instruccion: 'Las reglas deben permitir lectura/escritura para usuarios autenticados',
        reglaSugerida: 'allow read, write: if request.auth != null;'
      });
    };

    // Run all tests sequentially
    const runTests = async () => {
      addLog('info', 'TEST', '🚀 Iniciando batería de pruebas de Firebase...');
      addLog('info', 'TEST', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Test 1
      const configured = testConfig();
      if (!configured) {
        addLog('error', 'TEST', '❌ Tests abortados: Firebase no está configurado');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 6
      testBrowserExtensions();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 5
      const networkOk = await testNetworkConnectivity();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2
      const user = testAuth();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (user && networkOk) {
        // Test 7
        await testFirestoreRules(user);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 3
        await testFirestoreRead(user);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 4 - DESHABILITADO para evitar borrar datos
        await testFirestoreWrite(user);
      }

      addLog('info', 'TEST', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('info', 'TEST', '✅ Batería de pruebas completada');
      
      // Check for common issues
      const hasErrors = logs.some(log => log.type === 'error');
      const hasTimeouts = logs.some(log => log.message.includes('Timeout'));
      const hasPermissionDenied = logs.some(log => log.details?.code === 'permission-denied');
      
      if (hasTimeouts) {
        addLog('error', 'DIAGNOSTIC', '❌ PROBLEMA DETECTADO: Timeouts en operaciones de Firestore', {
          causa: 'Las reglas de seguridad de Firestore pueden estar mal configuradas',
          solucion: 'Revisa el archivo FIRESTORE_RULES_FIX.md para configurar las reglas correctamente'
        });
      }
      
      if (hasPermissionDenied) {
        addLog('error', 'DIAGNOSTIC', '❌ PROBLEMA DETECTADO: Permission Denied', {
          causa: 'Las reglas de Firestore están bloqueando el acceso',
          solucion: 'Ve a Firebase Console > Firestore > Rules y configura: allow read, write: if request.auth != null && request.auth.uid == userId;'
        });
      }
    };

    runTests();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-slate-300 rounded-lg shadow-2xl z-50 max-h-96 flex flex-col">
      <div 
        className="bg-slate-800 text-white px-4 py-2 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-bold cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          🔍 Firebase Debugger
        </span>
        <div className="flex gap-2">
          <button 
            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
            onClick={copyLogsToClipboard}
            title="Copiar logs"
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button 
            className="text-white hover:text-slate-300"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1 max-h-80">
            {logs.map((log, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded ${
                  log.type === 'error' ? 'bg-red-50 text-red-800' :
                  log.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  log.type === 'success' ? 'bg-green-50 text-green-800' :
                  'bg-blue-50 text-blue-800'
                }`}
              >
                <div className="flex gap-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="font-bold">[{log.category}]</span>
                </div>
                <div className="ml-2">{log.message}</div>
                {log.details && (
                  <details className="ml-2 mt-1">
                    <summary className="cursor-pointer text-slate-600">Ver detalles</summary>
                    <pre className="mt-1 text-xs overflow-x-auto bg-slate-100 p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-300 p-2 bg-slate-50 text-xs text-center">
            {logs.length} logs registrados
          </div>
        </>
      )}
    </div>
  );
};

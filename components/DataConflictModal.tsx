import React from 'react';
import { AlertCircle, Database, Cloud } from 'lucide-react';
import { UserData } from '../types';
import { Language, getTranslation } from '../services/translations';

interface DataConflictModalProps {
  localData: UserData;
  firebaseData: UserData;
  localChecksum: string;
  firebaseChecksum: string;
  localLastModified: string;
  firebaseLastModified: string;
  language: Language;
  onSelectLocal: () => void;
  onSelectCloud: () => void;
  onClose: () => void;
}

export const DataConflictModal: React.FC<DataConflictModalProps> = ({
  localData,
  firebaseData,
  localChecksum,
  firebaseChecksum,
  localLastModified,
  firebaseLastModified,
  language,
  onSelectLocal,
  onSelectCloud,
  onClose,
}) => {
  const t = getTranslation(language);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(language === 'es' ? 'es-ES' : 'en-US');
    } catch {
      return dateString;
    }
  };

  const countItems = (data: UserData) => {
    return (
      data.subjects.length +
      data.tests.length +
      data.results.length
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.dataConflict}</h2>
              <p className="text-gray-600 mt-1">{t.dataConflictDescription}</p>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Local Data */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg text-blue-900">{t.localData}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t.items}: </span>
                  <span className="text-gray-900">{countItems(localData)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.subjects}: </span>
                  <span className="text-gray-900">{localData.subjects.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.tests}: </span>
                  <span className="text-gray-900">{localData.tests.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.results}: </span>
                  <span className="text-gray-900">{localData.results.length}</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <span className="font-medium text-gray-700">{t.lastModified}: </span>
                  <span className="text-gray-900 text-xs block mt-1">
                    {formatDate(localLastModified)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Checksum: {localChecksum}
                </div>
              </div>
              <button
                onClick={onSelectLocal}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t.keepLocal}
              </button>
            </div>

            {/* Cloud Data */}
            <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg text-green-900">{t.cloudData}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t.items}: </span>
                  <span className="text-gray-900">{countItems(firebaseData)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.subjects}: </span>
                  <span className="text-gray-900">{firebaseData.subjects.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.tests}: </span>
                  <span className="text-gray-900">{firebaseData.tests.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.results}: </span>
                  <span className="text-gray-900">{firebaseData.results.length}</span>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <span className="font-medium text-gray-700">{t.lastModified}: </span>
                  <span className="text-gray-900 text-xs block mt-1">
                    {formatDate(firebaseLastModified)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Checksum: {firebaseChecksum}
                </div>
              </div>
              <button
                onClick={onSelectCloud}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {t.keepCloud}
              </button>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

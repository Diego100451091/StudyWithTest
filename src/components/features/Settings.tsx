import React, { useState, useEffect } from 'react';
import { User, Lock, Download, Upload, Save, AlertCircle, CheckCircle, Trash2, X } from 'lucide-react';
import { Language, getTranslation } from '../../services/translations';
import { firebaseService } from '../../services/firebase';

// Simple modal component for confirmation dialogs
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface SettingsProps {
  language: Language;
  firebaseAuth: {
    isSignedIn: boolean;
    user: {
      uid: string;
      name: string;
      email: string;
      photoURL: string;
    } | null;
  };
  onExport: () => void;
  onImport: () => void;
  onDeleteAllData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({
  language,
  firebaseAuth,
  onExport,
  onImport,
  onDeleteAllData,
  onDeleteAccount,
}) => {
  const t = getTranslation(language);
  const [displayName, setDisplayName] = useState(firebaseAuth.user?.name || '');
  
  // Update displayName when user info changes
  useEffect(() => {
    if (firebaseAuth.user?.name) {
      setDisplayName(firebaseAuth.user.name);
    }
  }, [firebaseAuth.user?.name]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Delete data modal
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [deleteDataConfirmText, setDeleteDataConfirmText] = useState('');
  const [deleteDataLoading, setDeleteDataLoading] = useState(false);
  const [deleteDataMessage, setDeleteDataMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Delete account modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountMessage, setDeleteAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!displayName.trim()) {
      setProfileMessage({ type: 'error', text: t.pleaseEnterName });
      return;
    }

    try {
      setProfileLoading(true);
      await firebaseService.updateUserProfile(displayName.trim());
      setProfileMessage({ type: 'success', text: t.profileUpdated });
    } catch (error: any) {
      console.error('Profile update error:', error);
      setProfileMessage({ 
        type: 'error', 
        text: error.message || t.profileUpdateError 
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: t.pleaseFillAllFields });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: t.newPasswordMismatch });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t.weakPassword });
      return;
    }

    try {
      setPasswordLoading(true);
      await firebaseService.updateUserPassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: t.passwordUpdated });
      // Clear fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      let errorMessage = t.passwordUpdateError;
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = t.wrongPassword;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t.weakPassword;
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = t.invalidCredentials;
      }
      
      setPasswordMessage({ type: 'error', text: errorMessage });
    } finally {
      setPasswordLoading(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const storeEvent = new CustomEvent('import-data', { detail: content });
        window.dispatchEvent(storeEvent);
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAllData = async () => {
    const expectedText = t.deleteAllDataConfirmText;
    if (deleteDataConfirmText !== expectedText) {
      setDeleteDataMessage({ type: 'error', text: t.confirmationMismatch });
      return;
    }

    try {
      setDeleteDataLoading(true);
      setDeleteDataMessage(null);
      await onDeleteAllData();
      setDeleteDataMessage({ type: 'success', text: t.allDataDeleted });
      setTimeout(() => {
        setShowDeleteDataModal(false);
        setDeleteDataConfirmText('');
        setDeleteDataMessage(null);
      }, 2000);
    } catch (error: any) {
      console.error('Delete data error:', error);
      setDeleteDataMessage({ type: 'error', text: t.deleteAllDataError });
    } finally {
      setDeleteDataLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const expectedText = t.deleteAccountConfirmText;
    if (deleteAccountConfirmText !== expectedText) {
      setDeleteAccountMessage({ type: 'error', text: t.confirmationMismatch });
      return;
    }

    try {
      setDeleteAccountLoading(true);
      setDeleteAccountMessage(null);
      await onDeleteAccount();
      setDeleteAccountMessage({ type: 'success', text: t.accountDeleted });
      setTimeout(() => {
        setShowDeleteAccountModal(false);
        setDeleteAccountConfirmText('');
        setDeleteAccountMessage(null);
      }, 2000);
    } catch (error: any) {
      console.error('Delete account error:', error);
      setDeleteAccountMessage({ type: 'error', text: t.deleteAccountError });
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.settings}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {language === 'es' 
            ? 'Gestiona tu perfil, contraseña y datos de la aplicación.' 
            : 'Manage your profile, password, and application data.'}
        </p>
      </div>

      {!firebaseAuth.isSignedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                {language === 'es' ? 'No has iniciado sesión' : 'Not signed in'}
              </h3>
              <p className="text-sm text-blue-800">
                {language === 'es' 
                  ? 'Inicia sesión para acceder a la configuración de perfil y sincronización en la nube.' 
                  : 'Sign in to access profile settings and cloud sync.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {firebaseAuth.isSignedIn && (
        <>
          {/* Account Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.accountSettings}</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              value={firebaseAuth.user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'es' 
                ? 'El correo electrónico no puede modificarse.' 
                : 'Email address cannot be changed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.profileSettings}</h2>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.displayName}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.displayName}
              />
            </div>

            {profileMessage && (
              <div className={`flex items-start space-x-2 p-4 rounded-lg ${
                profileMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {profileMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  profileMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {profileMessage.text}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? t.pleaseWait : t.updateProfileButton}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Password Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.updatePassword}</h2>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.currentPassword}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.currentPassword}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.newPassword}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.newPassword}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.confirmNewPassword}
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.confirmNewPassword}
              />
            </div>

            {passwordMessage && (
              <div className={`flex items-start space-x-2 p-4 rounded-lg ${
                passwordMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {passwordMessage.text}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? t.pleaseWait : t.updatePasswordButton}</span>
            </button>
          </form>
        </div>
      </div>
        </>
      )}

      {/* Data Management - Always visible */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.dataManagementSettings}</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Export Data */}
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t.exportData}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.exportDescription}</p>
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportButton}</span>
            </button>
          </div>

          {/* Import Data */}
          <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t.importData}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.importDescription}</p>
            <button
              onClick={handleImportClick}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{t.importButton}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone - Always visible */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-red-200 dark:border-red-800 overflow-hidden">
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">{t.dangerZone}</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Delete All Data */}
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t.deleteAllData}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.deleteAllDataDescription}</p>
            <button
              onClick={() => setShowDeleteDataModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border border-red-300 dark:border-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteAllDataButton}</span>
            </button>
          </div>

          {/* Delete Account - Only visible when logged in */}
          {firebaseAuth.isSignedIn && (
            <div className="space-y-2 pt-6 border-t border-red-200 dark:border-red-800">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{t.deleteAccount}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.deleteAccountDescription}</p>
              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.deleteAccountButton}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete All Data Modal */}
      <ConfirmModal
        isOpen={showDeleteDataModal}
        onClose={() => {
          setShowDeleteDataModal(false);
          setDeleteDataConfirmText('');
          setDeleteDataMessage(null);
        }}
        title={t.deleteAllDataConfirmTitle}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {t.deleteAllDataConfirmDescription}
          </p>
          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
            <code className="text-sm font-mono text-red-600 dark:text-red-400">
              {t.deleteAllDataConfirmText}
            </code>
          </div>
          <input
            type="text"
            value={deleteDataConfirmText}
            onChange={(e) => setDeleteDataConfirmText(e.target.value)}
            placeholder={t.typeToConfirm}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          
          {deleteDataMessage && (
            <div className={`flex items-start space-x-2 p-4 rounded-lg ${
              deleteDataMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {deleteDataMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                deleteDataMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {deleteDataMessage.text}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteDataModal(false);
                setDeleteDataConfirmText('');
                setDeleteDataMessage(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleDeleteAllData}
              disabled={deleteDataLoading || deleteDataConfirmText !== t.deleteAllDataConfirmText}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteDataLoading ? t.pleaseWait : t.deleteAllDataButton}
            </button>
          </div>
        </div>
      </ConfirmModal>

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteAccountModal}
        onClose={() => {
          setShowDeleteAccountModal(false);
          setDeleteAccountConfirmText('');
          setDeleteAccountMessage(null);
        }}
        title={t.deleteAccountConfirmTitle}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {t.deleteAccountConfirmDescription}
          </p>
          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
            <code className="text-sm font-mono text-red-600 dark:text-red-400">
              {t.deleteAccountConfirmText}
            </code>
          </div>
          <input
            type="text"
            value={deleteAccountConfirmText}
            onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
            placeholder={t.typeToConfirm}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          
          {deleteAccountMessage && (
            <div className={`flex items-start space-x-2 p-4 rounded-lg ${
              deleteAccountMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {deleteAccountMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                deleteAccountMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {deleteAccountMessage.text}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteAccountModal(false);
                setDeleteAccountConfirmText('');
                setDeleteAccountMessage(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading || deleteAccountConfirmText !== t.deleteAccountConfirmText}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteAccountLoading ? t.pleaseWait : t.deleteAccountButton}
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Settings;

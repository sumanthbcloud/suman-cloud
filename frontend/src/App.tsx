import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { authService } from './services/authService';
import { fileService } from './services/fileService';
import type { CloudFile, FileCategory, StorageOverviewData } from './types';

const TOTAL_STORAGE_BYTES = 53_687_091_200; // 50 GB demo quota

export function App() {
  const [view, setView] = useState<'app' | 'login' | 'signup'>(() =>
    authService.isAuthenticated() ? 'app' : 'login'
  );
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(() =>
    authService.getCurrentUser()
  );

  const [currentCategory, setCurrentCategory] = useState<FileCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<CloudFile[]>([]);

  const loadFiles = async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const data = await fileService.listFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files from backend:', err);
    }
  };

  useEffect(() => {
    if (view === 'app') {
      loadFiles();
    }
  }, [view]);

  // Compute live storage breakdown from real backend file records
  const storageData: StorageOverviewData = useMemo(() => {
    let photosBytes = 0;
    let photosCount = 0;
    let videosBytes = 0;
    let videosCount = 0;
    let audioBytes = 0;
    let audioCount = 0;
    let documentsBytes = 0;
    let documentsCount = 0;

    for (const f of files) {
      if (f.category === 'photos') {
        photosBytes += f.size;
        photosCount += 1;
      } else if (f.category === 'videos') {
        videosBytes += f.size;
        videosCount += 1;
      } else if (f.category === 'audio') {
        audioBytes += f.size;
        audioCount += 1;
      } else {
        documentsBytes += f.size;
        documentsCount += 1;
      }
    }

    const usedBytes = photosBytes + videosBytes + audioBytes + documentsBytes;

    return {
      usedBytes,
      totalBytes: TOTAL_STORAGE_BYTES,
      categories: [
        {
          category: 'photos',
          label: 'Photos',
          bytes: photosBytes,
          count: photosCount,
          color: 'bg-rose-500',
        },
        {
          category: 'videos',
          label: 'Videos',
          bytes: videosBytes,
          count: videosCount,
          color: 'bg-amber-500',
        },
        {
          category: 'audio',
          label: 'Audio',
          bytes: audioBytes,
          count: audioCount,
          color: 'bg-emerald-500',
        },
        {
          category: 'documents',
          label: 'Documents',
          bytes: documentsBytes,
          count: documentsCount,
          color: 'bg-blue-500',
        },
      ],
    };
  }, [files]);

  const handleSignOut = () => {
    authService.logout();
    setUser(null);
    setFiles([]);
    setLoginSuccessMessage(null);
    setView('login');
  };

  if (view === 'login') {
    return (
      <LoginPage
        successMessage={loginSuccessMessage}
        onLoginSuccess={() => {
          setLoginSuccessMessage(null);
          setUser(authService.getCurrentUser());
          setView('app');
        }}
        onNavigateToSignup={() => {
          setLoginSuccessMessage(null);
          setView('signup');
        }}
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={() => {
          setLoginSuccessMessage('Account created successfully. Please sign in.');
          setView('login');
        }}
        onNavigateToLogin={() => {
          setLoginSuccessMessage(null);
          setView('login');
        }}
      />
    );
  }

  return (
    <AppLayout
      currentCategory={currentCategory}
      onSelectCategory={setCurrentCategory}
      storageData={storageData}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      uploadModalOpen={uploadModalOpen}
      onOpenUpload={() => setUploadModalOpen(true)}
      onCloseUpload={() => setUploadModalOpen(false)}
      onUploadSuccess={loadFiles}
      user={user}
      onSignOut={handleSignOut}
    >
      <DashboardPage
        files={files}
        storageData={storageData}
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        searchQuery={searchQuery}
        onRefreshFiles={loadFiles}
        user={user}
      />
    </AppLayout>
  );
}

export default App;

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Search, BookOpen, Download, Bookmark, FileText, File, Image, Video, Music, Upload, X } from 'lucide-react';
import type { Note } from '../types';

const typeIcons: Record<string, { icon: any; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  docx: { icon: File, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  ppt: { icon: File, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  image: { icon: Image, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  video: { icon: Video, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  audio: { icon: Music, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
};

export default function NotesScreen() {
  const { notes, toggleBookmark, addNote, user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCourse, setUploadCourse] = useState('');
  const [uploadType, setUploadType] = useState<Note['fileType']>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isLecturer = user?.role === 'lecturer';

  // Check for auto-upload trigger from navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upload') === 'true' && isLecturer) {
      fileInputRef.current?.click();
      // Clean up URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, isLecturer, navigate]);

  const filtered = useMemo(() => notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || n.fileType === typeFilter;
    return matchesSearch && matchesType;
  }), [notes, searchQuery, typeFilter]);

  const fileTypes = ['all', 'pdf', 'docx', 'ppt', 'image', 'video', 'audio'] as const;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUpload(true);
      if (!uploadTitle) setUploadTitle(file.name.split('.')[0]);
      
      // Auto-detect type from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validTypes = ['pdf', 'docx', 'ppt', 'image', 'video', 'audio'];
      if (validTypes.includes(ext || '')) {
        setUploadType(ext as any);
      }
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadCourse || !selectedFile) return;

    const fileSize = selectedFile.size > 1024 * 1024 
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(selectedFile.size / 1024).toFixed(0)} KB`;

    addNote({
      title: uploadTitle,
      description: uploadDesc,
      courseId: 'c1',
      courseName: uploadCourse,
      fileType: uploadType,
      fileUrl: URL.createObjectURL(selectedFile),
      fileSize: fileSize,
    });

    // Reset state
    setUploadTitle('');
    setUploadDesc('');
    setUploadCourse('');
    setSelectedFile(null);
    setShowUpload(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      
      {/* Hidden file input: Moved outside conditional block so ref is always available */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept=".pdf,.docx,.ppt,.jpg,.jpeg,.png,.mp4,.mp3"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isLecturer ? 'Upload & Manage Notes' : 'Lecture Notes'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{notes.length} resources available</p>
        </div>
        {isLecturer && (
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Upload className="w-4 h-4" /> Upload Note
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && selectedFile && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upload New Note</h3>
            <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleUpload} className="space-y-3">
            <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Note title" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={uploadCourse} onChange={e => setUploadCourse(e.target.value)} placeholder="Course name (e.g. Database Systems)" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex gap-2 flex-wrap">
              {(['pdf', 'docx', 'ppt', 'video', 'audio'] as const).map(t => (
                <button key={t} type="button" onClick={() => setUploadType(t)} className={cn('px-3 py-1 rounded-lg text-xs font-medium uppercase transition-all', uploadType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{t}</button>
              ))}
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                selectedFile ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
              )}
            >
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {selectedFile ? (
                <p className="text-sm font-medium text-blue-600 truncate px-4">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Drag & drop file or <span className="text-blue-600 font-medium">browse</span></p>
              )}
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPT, Images, MP4, MP3 (Max 50MB)</p>
            </div>
            <button 
              type="submit" 
              disabled={!selectedFile || !uploadTitle.trim() || !uploadCourse.trim()} 
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Upload
            </button>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes & courses..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {fileTypes.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all', typeFilter === t ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>{t === 'all' ? 'All Types' : t}</button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notes found</p>
          </div>
        ) : (
          filtered.map(note => {
            const typeInfo = typeIcons[note.fileType] || typeIcons.pdf;
            const Icon = typeInfo.icon;
            return (
              <div key={note.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all group">
                <div className="flex gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', typeInfo.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{note.title}</h3>
                      <button onClick={() => toggleBookmark(note.id)} className={cn('p-1 rounded-lg flex-shrink-0 transition-colors', note.bookmarked ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500')}>
                        <Bookmark className={cn('w-4 h-4', note.bookmarked && 'fill-current')} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{note.courseName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{note.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="uppercase font-medium">{note.fileType}</span>
                        <span>{note.fileSize}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{note.downloads} downloads</span>
                        <button onClick={() => { if (note.fileUrl) { const a = document.createElement('a'); a.href = note.fileUrl; a.download = note.title; a.click(); } else { const blob = new Blob([`Note: ${note.title}\nCourse: ${note.courseName}\nDescription: ${note.description || ''}\nFile type: ${note.fileType}`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${note.title}.txt`; a.click(); URL.revokeObjectURL(url); } }} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

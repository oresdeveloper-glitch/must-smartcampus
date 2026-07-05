import { useState, useRef, useEffect } from 'react';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { ClipboardList, Clock, Upload, CheckCircle, XCircle, AlertCircle, Plus, Download, Star, X, FileText, Loader2 } from 'lucide-react';

export default function AssignmentScreen() {
  const { assignments, submitAssignment, user, addAssignment, courses } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const isLecturer = user?.role === 'lecturer';

  useEffect(() => {
    return () => { blobUrlsRef.current.forEach(URL.revokeObjectURL); };
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxScore, setMaxScore] = useState('100');

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.submitted;
    if (filter === 'submitted') return a.submitted && !a.grade;
    if (filter === 'graded') return a.grade !== undefined;
    return true;
  });

  const getDaysLeft = (deadline: Date) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return days;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || !deadline) return;
    const selectedCourse = courses.find(c => c.id === courseId);
    addAssignment({
      title, description, courseId,
      courseName: selectedCourse?.name || 'Unknown Course',
      deadline: new Date(deadline), maxScore: parseInt(maxScore),
    });
    setTitle(''); setDescription(''); setCourseId(''); setDeadline(''); setMaxScore('100');
    setShowCreateModal(false);
  };

  const openUpload = (id: string) => {
    setUploadTarget(id);
    setUploadFile(null);
    setUploadDone(false);
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!uploadTarget) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (uploadFile) {
      const url = URL.createObjectURL(uploadFile);
      blobUrlsRef.current.push(url);
      submitAssignment(uploadTarget, url, uploadFile.name);
    } else {
      submitAssignment(uploadTarget);
    }
    setUploading(false);
    setUploadDone(true);
    setTimeout(() => { setShowUploadModal(false); setUploadTarget(null); setUploadFile(null); }, 1500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{assignments.length} total &bull; {assignments.filter(a => !a.submitted).length} pending</p>
        </div>
        {isLecturer && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-medium text-sm hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4" /> Create
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
            {uploadDone ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submitted!</h3>
                <p className="text-sm text-gray-500 mt-1">Your assignment has been submitted.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Assignment</h3>
                    <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Upload your work as a file</p>
                </div>

                <div className="p-6 space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f); }}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group',
                      uploadFile ? 'border-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                    )}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f); if (e.target) e.target.value = ''; }} />
                    {uploadFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{uploadFile.name}</p>
                        <p className="text-xs text-gray-400">{formatSize(uploadFile.size)}</p>
                        <button onClick={(e) => { e.stopPropagation(); setUploadFile(null); }} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-10 h-10 text-gray-300 group-hover:text-orange-400 transition-colors" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop your file here or <span className="text-orange-600 font-semibold">browse</span></p>
                        <p className="text-xs text-gray-400">PDF, DOC, DOCX, ZIP &mdash; Max 50 MB</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Submit</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Create New Assignment</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500" />
            <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Instructions..." rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Deadline</label>
                <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Max Score</label>
                <input type="number" required value={maxScore} onChange={e => setMaxScore(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors text-sm">Post Assignment</button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'submitted', 'graded'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all', filter === f ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{f}</button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
          </div>
        ) : (
          filtered.map(assignment => {
            const daysLeft = getDaysLeft(assignment.deadline);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 2;

            return (
              <div key={assignment.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {assignment.submitted && assignment.grade !== undefined ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : assignment.submitted ? (
                        <Clock className="w-5 h-5 text-blue-500" />
                      ) : isOverdue ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{assignment.courseName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{assignment.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium',
                      isOverdue ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      isUrgent ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    )}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Deadline: {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>Max Score: {assignment.maxScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.grade !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{assignment.grade}/{assignment.maxScore}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    ) : assignment.submitted ? (
                      <div className="flex items-center gap-2">
                        {assignment.fileName && <span className="text-xs text-gray-400 truncate max-w-[100px]">{assignment.fileName}</span>}
                        <span className="text-xs text-blue-500 font-medium">Submitted</span>
                        {assignment.fileUrl && (
                          <button onClick={() => { const a = document.createElement('a'); a.href = assignment.fileUrl!; a.download = assignment.fileName || assignment.title; a.click(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title="Download submission">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => openUpload(assignment.id)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5" /> Submit
                      </button>
                    )}
                  </div>
                </div>

                {assignment.feedback && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">Feedback:</p>
                    <p className="text-sm text-green-800 dark:text-green-200">{assignment.feedback}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Search, MessageSquare, Plus, Users, CheckCheck, X, ArrowLeft, Check, UserPlus, MessageCircle, Camera } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  role: 'lecturer' | 'student';
  avatar?: string;
  isOnline: boolean;
  department?: string;
  studentId?: string;
  staffId?: string;
}

const SEED_CONTACTS: Contact[] = [
  { id: 'lec-seed-1', name: 'Dr. Mwambene', role: 'lecturer', isOnline: true, department: 'Telecommunication Engineering', staffId: 'LEC-001' },
  { id: 'lec-seed-2', name: 'Prof. Kalinga', role: 'lecturer', isOnline: false, department: 'Telecommunication Engineering', staffId: 'LEC-002' },
  { id: 'lec-seed-3', name: 'Dr. Nyambo', role: 'lecturer', isOnline: true, department: 'Telecommunication Engineering', staffId: 'LEC-003' },
  { id: 'lec-seed-4', name: 'Dr. Mbise', role: 'lecturer', isOnline: false, department: 'Telecommunication Engineering', staffId: 'LEC-004' },
  { id: 'lec-seed-5', name: 'Prof. Mwakyusa', role: 'lecturer', isOnline: true, department: 'Telecommunication Engineering', staffId: 'LEC-005' },
  { id: 'stud-seed-1', name: 'Anna Mwaka', role: 'student', isOnline: true, studentId: 'STU-2024-001' },
  { id: 'stud-seed-2', name: 'John Paulo', role: 'student', isOnline: false, studentId: 'STU-2024-002' },
  { id: 'stud-seed-3', name: 'Grace Hassan', role: 'student', isOnline: true, studentId: 'STU-2024-003' },
  { id: 'stud-seed-4', name: 'Peter Lema', role: 'student', isOnline: false, studentId: 'STU-2024-004' },
  { id: 'stud-seed-5', name: 'Sarah John', role: 'student', isOnline: true, studentId: 'STU-2024-005' },
  { id: 'stud-seed-6', name: 'David Mushi', role: 'student', isOnline: false, studentId: 'STU-2024-006' },
  { id: 'stud-seed-7', name: 'Mary Ntemi', role: 'student', isOnline: true, studentId: 'STU-2024-007' },
  { id: 'stud-seed-8', name: 'Emmanuel Sanga', role: 'student', isOnline: true, studentId: 'STU-2024-008' },
  { id: 'stud-seed-9', name: 'Neema Kipara', role: 'student', isOnline: false, studentId: 'STU-2024-009' },
  { id: 'stud-seed-10', name: 'James Omary', role: 'student', isOnline: true, studentId: 'STU-2024-010' },
  { id: 'stud-seed-11', name: 'Elizabeth Chuwa', role: 'student', isOnline: false, studentId: 'STU-2024-011' },
  { id: 'stud-seed-12', name: 'Samson Laiser', role: 'student', isOnline: true, studentId: 'STU-2024-012' },
];

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500',
  'bg-purple-500', 'bg-teal-500', 'bg-cyan-500', 'bg-rose-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(date: Date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function ContactRow({ contact, selected, onToggle, singleSelect }: { contact: Contact; selected: boolean; onToggle: () => void; singleSelect?: boolean }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-[#16262b] transition-colors text-left"
    >
      {!singleSelect && (
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          selected ? 'bg-[#25D366] border-[#25D366]' : 'border-slate-300 dark:border-slate-600'
        )}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}
      <div className="relative flex-shrink-0">
        <div className={cn('w-[45px] h-[45px] rounded-full flex items-center justify-center text-white font-bold text-sm', avatarColor(contact.name))}>
          {contact.name.charAt(0).toUpperCase()}
        </div>
        {contact.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#0f1a1e]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{contact.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {contact.role === 'lecturer'
            ? (contact.department ? `${contact.department} • Lecturer` : 'Lecturer')
            : `Student${contact.studentId ? ` • ${contact.studentId}` : ''}`
          }
        </p>
      </div>
      {contact.isOnline ? (
        <span className="text-[11px] text-emerald-500 font-medium flex-shrink-0">Online</span>
      ) : (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">Offline</span>
      )}
    </button>
  );
}

export default function ChatScreen() {
  const navigate = useNavigate();
  const { chats, user, addChat } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showGroupName, setShowGroupName] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const actionSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showActionSheet) {
      const handler = (e: MouseEvent) => {
        if (actionSheetRef.current && !actionSheetRef.current.contains(e.target as Node)) {
          setShowActionSheet(false);
        }
      };
      setTimeout(() => document.addEventListener('click', handler), 50);
      return () => document.removeEventListener('click', handler);
    }
  }, [showActionSheet]);

  const basePath = `/${user?.role || 'student'}`;

  const filtered = useMemo(() =>
    chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [chats, searchQuery]
  );

  const contacts = useMemo(() =>
    SEED_CONTACTS.filter(c => c.id !== user?.id),
    [user]
  );

  const filteredContacts = useMemo(() =>
    contacts.filter(c =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.department?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.studentId?.toLowerCase().includes(contactSearch.toLowerCase())
    ),
    [contacts, contactSearch]
  );

  function startNewChat(contact: Contact) {
    const existing = chats.find(c => c.type === 'private' && c.name === contact.name);
    if (existing) {
      navigate(`${basePath}/chat/${existing.id}`);
      setShowNewChat(false);
      setShowActionSheet(false);
      return;
    }
    const id = addChat(
      { type: 'private', name: contact.name, participants: [contact.id], unread: 0 },
      `You can now chat privately with ${contact.name}. Say hello!`
    );
    setShowNewChat(false);
    setShowActionSheet(false);
    navigate(`${basePath}/chat/${id}`);
  }

  function createGroup() {
    if (!groupName.trim() || selectedContacts.length === 0) return;
    const id = addChat(
      { type: 'group', name: groupName.trim(), participants: selectedContacts, unread: 0 },
      `Group "${groupName.trim()}" created. Start collaborating!`
    );
    setShowGroupName(false);
    setShowNewGroup(false);
    setShowActionSheet(false);
    setSelectedContacts([]);
    setGroupName('');
    setContactSearch('');
    navigate(`${basePath}/chat/${id}`);
  }

  function openGroupNameStep() {
    if (selectedContacts.length === 0) return;
    setShowNewGroup(false);
    setShowGroupName(true);
  }

  function toggleContact(id: string) {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#075E54] dark:bg-[#0b3d36] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Chats</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowNewChat(true); setShowActionSheet(false); }}
              className="p-2 rounded-full hover:bg-white/10 text-white/90 transition-colors"
              title="New chat"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowActionSheet(p => !p)}
              className="p-2 rounded-full hover:bg-white/10 text-white/90 transition-colors"
              title="New group"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-2.5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/15 text-white placeholder-white/50 text-sm outline-none"
          />
        </div>
      </div>

      {/* Action Sheet Dropdown */}
      {showActionSheet && (
        <div className="absolute top-[72px] right-4 z-20">
          <div ref={actionSheetRef} className="bg-white dark:bg-[#1f2d33] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-64 overflow-hidden">
            <button
              onClick={() => { setShowNewChat(true); setShowActionSheet(false); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-[#16262b] transition-colors text-left border-b border-slate-100 dark:border-slate-700"
            >
              <div className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">New Chat</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Start a private conversation</p>
              </div>
            </button>
            <button
              onClick={() => { setShowNewGroup(true); setShowActionSheet(false); setSelectedContacts([]); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-[#16262b] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">New Group</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create a group conversation</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f1a1e]">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{searchQuery ? 'No chats found' : 'No conversations yet'}</p>
            <p className="text-xs mt-1 text-slate-400/70">Tap + to start a new chat</p>
          </div>
        ) : (
          filtered.map(chat => (
            <button
              key={chat.id}
              onClick={() => navigate(`${basePath}/chat/${chat.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#16262b] transition-colors text-left border-b border-slate-100 dark:border-slate-800/40"
            >
              <div className="relative flex-shrink-0">
                <div className={cn(
                  'w-[49px] h-[49px] rounded-full flex items-center justify-center text-white font-bold text-lg',
                  chat.type === 'group' ? 'bg-[#075E54] dark:bg-[#0b3d36]' : avatarColor(chat.name)
                )}>
                  {chat.type === 'group' ? <Users className="w-[22px] h-[22px]" /> : chat.name.charAt(0).toUpperCase()}
                </div>
                {chat.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#0f1a1e]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm', chat.unread > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-800 dark:text-slate-200')}>
                    {chat.name}
                  </p>
                  {chat.lastMessage && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    {chat.lastMessage && (
                      <CheckCheck className={cn('w-3.5 h-3.5 flex-shrink-0', chat.lastMessage.read ? 'text-blue-500' : 'text-slate-400')} />
                    )}
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate">
                      {chat.lastMessage?.type === 'voice' ? '🎤 Voice message' : chat.lastMessage?.type === 'file' ? '📎 File' : chat.lastMessage?.content || (chat.type === 'group' ? chat.participants.length + ' participants' : 'No messages yet')}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-[#25D366] text-white text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 ml-2">{chat.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0f1a1e] flex flex-col">
          <div className="bg-[#075E54] dark:bg-[#0b3d36] px-4 pt-11 pb-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowNewChat(false)} className="p-1 rounded-full hover:bg-white/10 text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">Select Contact</h2>
                <p className="text-xs text-white/70">{contacts.length} contacts</p>
              </div>
            </div>
            <div className="mt-2.5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/15 text-white placeholder-white/50 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No contacts found</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-[#0a1419]">
                  Contacts on MUST
                </div>
                {filteredContacts.map(contact => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    selected={false}
                    onToggle={() => startNewChat(contact)}
                    singleSelect
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* New Group - Contact Selection */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0f1a1e] flex flex-col">
          <div className="bg-[#075E54] dark:bg-[#0b3d36] px-4 pt-11 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => { setShowNewGroup(false); setSelectedContacts([]); }} className="p-1 rounded-full hover:bg-white/10 text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Participants</h2>
                  <p className="text-xs text-white/70">{selectedContacts.length} of {contacts.length} selected</p>
                </div>
              </div>
              <button
                onClick={openGroupNameStep}
                disabled={selectedContacts.length === 0}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedContacts.length > 0
                    ? 'bg-white text-[#075E54] hover:bg-white/90'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                )}
              >
                Next
              </button>
            </div>
            <div className="mt-2.5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/15 text-white placeholder-white/50 text-sm outline-none"
              />
            </div>
          </div>
          {/* Selected chips */}
          {selectedContacts.length > 0 && (
            <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-slate-50 dark:bg-[#0a1419] border-b border-slate-200 dark:border-slate-700">
              {selectedContacts.map(id => {
                const c = contacts.find(ct => ct.id === id);
                if (!c) return null;
                return (
                  <div key={c.id} className="flex items-center gap-1.5 bg-[#075E54] text-white text-xs px-3 py-1.5 rounded-full flex-shrink-0">
                    <span>{c.name}</span>
                    <button onClick={() => toggleContact(c.id)} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No contacts found</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-[#0a1419]">
                  Contacts on MUST
                </div>
                {filteredContacts.map(contact => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    selected={selectedContacts.includes(contact.id)}
                    onToggle={() => toggleContact(contact.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Group Name Modal */}
      {showGroupName && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0f1a1e] flex flex-col">
          <div className="bg-[#075E54] dark:bg-[#0b3d36] px-4 pt-11 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => { setShowGroupName(false); setShowNewGroup(true); }} className="p-1 rounded-full hover:bg-white/10 text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-white">New Group</h2>
              </div>
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedContacts.length === 0}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  groupName.trim() && selectedContacts.length > 0
                    ? 'bg-white text-[#075E54] hover:bg-white/90'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                )}
              >
                Create
              </button>
            </div>
          </div>
          <div className="flex-1 p-6">
            {/* Group Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Add group icon</p>
            </div>
            {/* Group Name Input */}
            <div className="border-b-2 border-[#075E54] dark:border-[#128C7E] pb-1 mb-6">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Type group name"
                className="w-full text-lg text-slate-900 dark:text-white placeholder-slate-400 outline-none bg-transparent"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') createGroup(); }}
              />
            </div>
            {/* Participants Preview */}
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Participants — {selectedContacts.length}
              </p>
              <div className="space-y-1">
                {selectedContacts.map(id => {
                  const c = contacts.find(ct => ct.id === id);
                  if (!c) return null;
                  return (
                    <div key={c.id} className="flex items-center gap-3 py-2">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs', avatarColor(c.name))}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{c.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

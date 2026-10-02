import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  Brain,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileAudio,
  FileText,
  Filter,
  FolderOpen,
  GitBranch,
  HelpCircle,
  Home,
  Info,
  Link2,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Network,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
  X,
  Zap
} from 'lucide-react';
import './styles.css';

const demoFacts = [
  {
    id: 'router',
    category: 'Internet',
    title: 'Router recovery',
    value: 'Restart the router, wait 30 seconds, then reconnect.',
    status: 'verified',
    confidence: 0.96,
    updated: 'Sep 14, 2026',
    source: 'WhatsApp · home-tech.txt',
    detail: '“If the Wi-Fi drops again, restart the router and give it 30 seconds.”',
    icon: 'wifi'
  },
  {
    id: 'water',
    category: 'Maintenance',
    title: 'Water purifier service',
    value: 'Next service is due around Nov 12, 2026.',
    status: 'verified',
    confidence: 0.91,
    updated: 'May 11, 2026',
    source: 'service-receipt.pdf',
    detail: 'Service invoice dated May 11 with a six-month replacement interval.',
    icon: 'drop'
  },
  {
    id: 'plumber',
    category: 'Contacts',
    title: 'Current plumber',
    value: 'Suresh · usually available after 11 AM.',
    status: 'current',
    confidence: 0.89,
    updated: 'Sep 02, 2026',
    source: 'WhatsApp · maintenance-chat.txt',
    detail: 'A Sep 02 message says to use Suresh instead of the previous plumber.',
    icon: 'user'
  },
  {
    id: 'key',
    category: 'Home',
    title: 'Spare key',
    value: 'Blue drawer → small envelope → labelled “BACKUP”.',
    status: 'verified',
    confidence: 0.94,
    updated: 'Aug 22, 2026',
    source: 'IMG_4821.jpg + note.txt',
    detail: 'Location appears in both a photo caption and a text note.',
    icon: 'key'
  }
];

const conflicts = [
  {
    title: 'Plumber contact changed',
    oldValue: 'Rakesh',
    newValue: 'Suresh',
    confidence: 0.91,
    reason: 'A newer message explicitly replaces the previous contact.',
    source: 'maintenance-chat.txt'
  },
  {
    title: 'Wi-Fi password is stale',
    oldValue: 'sunshine123',
    newValue: 'Unknown',
    confidence: 0.98,
    reason: 'A later message says the password changed, but no replacement was found.',
    source: 'home-tech.txt'
  }
];

const sources = [
  { name: 'whatsapp-export.txt', type: 'text', size: '18 KB', count: 62, status: 'Parsed' },
  { name: 'maintenance-chat.txt', type: 'text', size: '7 KB', count: 21, status: 'Parsed' },
  { name: 'service-receipt.pdf', type: 'pdf', size: '412 KB', count: 1, status: 'Parsed' },
  { name: 'IMG_4821.jpg', type: 'image', size: '2.1 MB', count: 1, status: 'Parsed' },
  { name: 'voice-note-01.m4a', type: 'audio', size: '846 KB', count: 1, status: 'Transcribed' }
];

const initialMessages = [
  {
    role: 'assistant',
    text: 'Ask me about the handoff. I will answer from the reconstructed knowledge and show the evidence behind the answer.'
  }
];

const answerMap = {
  'washing machine': {
    answer: 'Call Suresh — the appliance technician used most recently.',
    confidence: 'High',
    reason: 'The newest service conversation lists Suresh and replaces the older contact.',
    source: 'maintenance-chat.txt · Sep 02, 2026'
  },
  'wifi': {
    answer: 'I do not know the current Wi-Fi password.',
    confidence: 'High',
    reason: 'An older password exists, but a later message says it was changed. No replacement was found.',
    source: 'home-tech.txt · Aug 14, 2026'
  },
  'key': {
    answer: 'The spare key is in the blue drawer, inside a small envelope labelled “BACKUP”.',
    confidence: 'High',
    reason: 'The location appears in both a photo caption and a note.',
    source: 'IMG_4821.jpg + note.txt'
  },
  'purifier': {
    answer: 'The water purifier service is due around November 12, 2026.',
    confidence: 'High',
    reason: 'The last service receipt is dated May 11 and indicates a six-month cycle.',
    source: 'service-receipt.pdf · May 11, 2026'
  }
};

function scoreForQuestion(question) {
  const q = question.toLowerCase();
  for (const [key, data] of Object.entries(answerMap)) {
    if (q.includes(key)) return data;
  }
  return {
    answer: 'I could not find a sufficiently supported answer in the current handoff.',
    confidence: 'Unknown',
    reason: 'No source crossed the confidence threshold required for a direct answer.',
    source: 'No supporting evidence found'
  };
}

function App() {
  const [active, setActive] = useState('Overview');
  const [built, setBuilt] = useState(false);
  const [progress, setProgress] = useState(0);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedFact, setSelectedFact] = useState(null);

  const handoffStats = useMemo(() => ({
    sources: sources.length,
    facts: 18,
    contacts: 7,
    tasks: 11,
    conflicts: 2,
    unknown: 4
  }), []);

  function buildHandoff() {
    setShowBuildModal(true);
    setProgress(8);
    let current = 8;
    const timer = setInterval(() => {
      current += 18;
      setProgress(Math.min(current, 100));
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setShowBuildModal(false);
          setBuilt(true);
          setActive('Overview');
        }, 350);
      }
    }, 220);
  }

  function askQuestion(e) {
    e?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    const result = scoreForQuestion(trimmed);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'assistant', rich: result }
    ]);
    setQuestion('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Network size={17} /></div>
          <div>
            <div className="brand-name">RELAY</div>
            <div className="brand-sub">Personal handoff AI</div>
          </div>
        </div>

        <button className="workspace-card" onClick={() => setActive('Overview')}>
          <div className="avatar">T</div>
          <div className="workspace-copy">
            <strong>Tanisha's Home</strong>
            <span>10-day handoff</span>
          </div>
          <ChevronRight size={15} />
        </button>

        <nav>
          <NavItem icon={<Home size={16}/>} label="Overview" active={active === 'Overview'} onClick={() => setActive('Overview')} />
          <NavItem icon={<Sparkles size={16}/>} label="Ask RELAY" active={active === 'Ask RELAY'} onClick={() => setActive('Ask RELAY')} />
          <NavItem icon={<FolderOpen size={16}/>} label="Sources" active={active === 'Sources'} onClick={() => setActive('Sources')} />
          <NavItem icon={<GitBranch size={16}/>} label="Conflicts" active={active === 'Conflicts'} badge="2" onClick={() => setActive('Conflicts')} />
          <NavItem icon={<LockKeyhole size={16}/>} label="Privacy" active={active === 'Privacy'} onClick={() => setActive('Privacy')} />
        </nav>

        <div className="sidebar-spacer" />
        <div className="local-card">
          <div className="status-dot" />
          <div>
            <strong>Local-first mode</strong>
            <span>Open-weight model ready</span>
          </div>
        </div>
        <div className="version">v0.1 · Hacktoberfest 2026</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumbs"><span>Workspaces</span><ChevronRight size={14}/><strong>Tanisha's Home</strong></div>
          <div className="top-actions">
            <span className="privacy-pill"><ShieldCheck size={14}/> Local by default</span>
            <button className="icon-button"><MoreHorizontal size={19}/></button>
          </div>
        </header>

        {active === 'Overview' && <Overview built={built} handoffStats={handoffStats} buildHandoff={buildHandoff} onSelectFact={setSelectedFact} setActive={setActive} />}
        {active === 'Ask RELAY' && <AskPage question={question} setQuestion={setQuestion} messages={messages} askQuestion={askQuestion} />}
        {active === 'Sources' && <SourcesPage onInspect={() => setShowSourceModal(true)} />}
        {active === 'Conflicts' && <ConflictsPage />}
        {active === 'Privacy' && <PrivacyPage />}

        <footer className="footer">
          <span>RELAY reconstructs context from your sources. It does not guarantee truth.</span>
          <span className="footer-right"><LockKeyhole size={12}/> Evidence-backed · Open-weight AI</span>
        </footer>
      </main>

      {showBuildModal && (
        <Modal>
          <div className="build-hero"><div className="orb"><Brain size={28}/></div></div>
          <h2>Reconstructing your handoff</h2>
          <p className="muted center">Extracting facts, checking freshness, and preserving evidence.</p>
          <div className="progress-track"><div className="progress-fill" style={{width: `${progress}%`}} /></div>
          <div className="build-steps">
            <div><Check size={14}/> Ingesting sources</div>
            <div>{progress > 35 ? <Check size={14}/> : <span className="spinner"/>} Extracting structured facts</div>
            <div>{progress > 62 ? <Check size={14}/> : <span className="spinner"/>} Resolving temporal conflicts</div>
            <div>{progress > 84 ? <Check size={14}/> : <span className="spinner"/>} Building evidence-backed handoff</div>
          </div>
        </Modal>
      )}

      {showSourceModal && (
        <Modal wide onClose={() => setShowSourceModal(false)}>
          <div className="modal-title-row"><div><span className="eyebrow">SOURCE INSPECTOR</span><h2>whatsapp-export.txt</h2></div><button className="icon-button" onClick={() => setShowSourceModal(false)}><X size={17}/></button></div>
          <div className="source-preview">
            <div className="source-line"><span>Sep 02, 2026 · 10:18 AM</span><span className="source-tag">used by RELAY</span></div>
            <div className="chat-bubble">Don't call Rakesh anymore — use Suresh for plumbing now.</div>
            <div className="source-line"><span>Aug 14, 2026 · 9:02 PM</span><span className="source-tag stale">superseded</span></div>
            <div className="chat-bubble stale-bubble">Rakesh is our plumber. Call him if there is a leak.</div>
          </div>
          <div className="evidence-note"><CircleAlert size={16}/><div><strong>Why this matters</strong><p>The newer message supersedes the older contact. RELAY surfaces this instead of silently merging both names.</p></div></div>
        </Modal>
      )}

      {selectedFact && (
        <Modal wide onClose={() => setSelectedFact(null)}>
          <div className="modal-title-row"><div><span className="eyebrow">EVIDENCE TRACE</span><h2>{selectedFact.title}</h2></div><button className="icon-button" onClick={() => setSelectedFact(null)}><X size={17}/></button></div>
          <div className="trace-answer"><strong>{selectedFact.value}</strong><div className="confidence"><ShieldCheck size={14}/> {Math.round(selectedFact.confidence * 100)}% confidence</div></div>
          <div className="trace-grid"><div><span>Source</span><strong>{selectedFact.source}</strong></div><div><span>Updated</span><strong>{selectedFact.updated}</strong></div><div><span>Status</span><strong>{selectedFact.status}</strong></div></div>
          <div className="evidence-note"><Info size={16}/><div><strong>Evidence excerpt</strong><p>{selectedFact.detail}</p></div></div>
        </Modal>
      )}
    </div>
  );
}

function NavItem({icon,label,active,badge,onClick}) {
  return <button className={`nav-item ${active ? 'active':''}`} onClick={onClick}><span>{icon}</span><span>{label}</span>{badge && <em>{badge}</em>}</button>;
}

function Overview({ built, handoffStats, buildHandoff, onSelectFact, setActive }) {
  return (
    <div className="page">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/> HANDOFF READY</div>
          <h1>Everything they know.<br/><span>Ready to hand over.</span></h1>
          <p>RELAY reconstructs messy personal knowledge into a temporary, evidence-backed handoff — with uncertainty made visible.</p>
          <div className="hero-actions">
            <button className="primary" onClick={buildHandoff}><Zap size={16}/> {built ? 'Rebuild handoff' : 'Build handoff'} <ArrowUpRight size={15}/></button>
            <button className="secondary" onClick={() => setActive('Ask RELAY')}><MessageCircle size={16}/> Ask RELAY</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mini-window">
            <div className="mini-top"><div className="mini-dots"><i/><i/><i/></div><span>10-day handoff</span><LockKeyhole size={13}/></div>
            <div className="mini-summary"><div className="mini-kicker">FOR YOUR NEXT 10 DAYS</div><strong>Tanisha is away Oct 4–14.</strong></div>
            <MiniRow icon={<Users size={14}/>} label="7 contacts" text="Suresh · security · delivery" />
            <MiniRow icon={<Clock3 size={14}/>} label="3 upcoming" text="Electricity · service · delivery" />
            <MiniRow icon={<CircleAlert size={14}/>} label="2 conflicts" text="Review before sharing" danger />
          </div>
        </div>
      </section>

      <section className="metrics-row">
        <Metric value={handoffStats.facts} label="Facts reconstructed" sub="from source evidence" />
        <Metric value={handoffStats.contacts} label="Useful contacts" sub="with current context" />
        <Metric value={handoffStats.tasks} label="Action items" sub="within handoff window" />
        <Metric value={handoffStats.unknown} label="Unknowns" sub="intentionally not guessed" accent />
      </section>

      <section className="section-head"><div><div className="section-kicker">CURRENT KNOWLEDGE</div><h2>What the handoff knows</h2></div><button className="text-button" onClick={() => setActive('Sources')}>View all sources <ChevronRight size={15}/></button></section>
      <section className="fact-grid">
        {demoFacts.map(fact => <FactCard key={fact.id} fact={fact} onClick={() => onSelectFact(fact)} />)}
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-head"><div><span className="section-kicker">RECENCY CHECK</span><h3>Things RELAY is watching</h3></div><Filter size={17}/></div>
          <TimelineItem date="Sep 02" title="Suresh replaced Rakesh" detail="Newest plumbing contact" good />
          <TimelineItem date="Aug 14" title="Wi-Fi password changed" detail="Replacement password not found" warn />
          <TimelineItem date="May 11" title="Purifier serviced" detail="Next service estimated Nov 12" good />
        </div>
        <div className="panel dark-panel">
          <div className="panel-head"><div><span className="section-kicker">SAFETY BY DESIGN</span><h3>RELAY refuses to guess</h3></div><ShieldCheck size={18}/></div>
          <p className="large-quote">“I don't know the current Wi-Fi password.”</p>
          <p className="muted">An older password exists, but a later source says it changed. The replacement was not found, so the answer stays unknown.</p>
          <div className="source-chip"><LockKeyhole size={12}/> Evidence required for direct answers</div>
        </div>
      </section>
    </div>
  );
}

function MiniRow({icon,label,text,danger}) { return <div className={`mini-row ${danger?'danger':''}`}><span className="mini-icon">{icon}</span><div><strong>{label}</strong><span>{text}</span></div><ChevronRight size={14}/></div>; }
function Metric({value,label,sub,accent}) { return <div className={`metric ${accent?'accent':''}`}><strong>{value}</strong><div><span>{label}</span><small>{sub}</small></div></div>; }
function FactCard({fact,onClick}) { return <button className="fact-card" onClick={onClick}><div className="fact-top"><span className={`fact-icon ${fact.icon}`}>{fact.icon==='user'?<UserRound size={15}/>:fact.icon==='key'?<LockKeyhole size={15}/>:fact.icon==='drop'?<Zap size={15}/>:<Network size={15}/>}</span><span className={`fact-status ${fact.status}`}>{fact.status==='current'?'Current':'Verified'}</span></div><div className="fact-category">{fact.category}</div><h3>{fact.title}</h3><p>{fact.value}</p><div className="fact-foot"><span>{fact.source}</span><span>{Math.round(fact.confidence*100)}%</span></div></button>; }
function TimelineItem({date,title,detail,good,warn}) { return <div className="timeline-item"><div className={`timeline-dot ${good?'good':''} ${warn?'warn':''}`}></div><div className="timeline-date">{date}</div><div className="timeline-body"><strong>{title}</strong><span>{detail}</span></div></div>; }

function AskPage({question,setQuestion,messages,askQuestion}) {
  return <div className="page ask-page"><div className="ask-heading"><div className="eyebrow"><Sparkles size={14}/> SOURCE-GROUNDED Q&amp;A</div><h1>Ask RELAY</h1><p>Ask a practical question. RELAY answers from the reconstructed handoff and keeps evidence attached.</p></div><div className="suggestions"><button onClick={()=>setQuestion('Who should I call if the washing machine stops working?')}>Who fixes the washing machine?</button><button onClick={()=>setQuestion('What is the current Wi-Fi password?')}>What’s the Wi-Fi password?</button><button onClick={()=>setQuestion('Where is the spare key?')}>Where is the spare key?</button></div><div className="chat-box">{messages.map((m,i)=><div key={i} className={`chat-row ${m.role}`}>{m.role==='assistant'?<div className="chat-avatar"><Brain size={15}/></div>:<div className="chat-avatar user"><UserRound size={15}/></div>}<div className="chat-content">{m.rich?<><div className="answer-title">{m.rich.answer}</div><div className="answer-meta"><span className={`confidence-badge ${m.rich.confidence==='Unknown'?'unknown':''}`}><ShieldCheck size={12}/> {m.rich.confidence} confidence</span><span>{m.rich.source}</span></div><div className="why-card"><div><Info size={14}/><strong>Why this answer?</strong></div><p>{m.rich.reason}</p></div></>:<p>{m.text}</p>}</div></div>)}<form className="ask-form" onSubmit={askQuestion}><Search size={17}/><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask where something is, who to contact, or what changed…"/><button className="primary small"><ArrowUpRight size={15}/></button></form></div></div>;
}

function SourcesPage({onInspect}) { return <div className="page"><div className="page-heading"><div><div className="section-kicker">EVIDENCE LAYER</div><h1>Sources</h1><p>Everything RELAY used to reconstruct the current handoff.</p></div><button className="secondary"><Upload size={15}/> Add sources</button></div><div className="source-grid">{sources.map(s=><button className="source-card" key={s.name} onClick={onInspect}><div className="source-icon">{s.type==='audio'?<FileAudio size={18}/>:s.type==='pdf'?<FileText size={18}/>:<FolderOpen size={18}/>}</div><div className="source-copy"><strong>{s.name}</strong><span>{s.size} · {s.count} {s.count===1?'item':'items'}</span></div><span className="parsed"><Check size={12}/> {s.status}</span><ChevronRight size={15}/></button>)}</div><div className="panel source-principles"><div className="panel-head"><div><span className="section-kicker">HOW RELAY USES SOURCES</span><h3>Evidence is not decoration.</h3></div><Link2 size={18}/></div><div className="principle-grid"><Principle title="Freshness" text="Newer statements can supersede older information." icon={<RefreshCcw size={17}/>} /><Principle title="Provenance" text="Facts keep the file and message they came from." icon={<Link2 size={17}/>} /><Principle title="Uncertainty" text="Unsupported answers remain unknown instead of being invented." icon={<HelpCircle size={17}/>} /></div></div></div>; }
function Principle({title,text,icon}) { return <div className="principle"><div className="principle-icon">{icon}</div><strong>{title}</strong><span>{text}</span></div>; }

function ConflictsPage() { return <div className="page"><div className="page-heading"><div><div className="section-kicker">TEMPORAL REASONING</div><h1>Conflicts</h1><p>RELAY found information that cannot safely be merged without context.</p></div><span className="count-pill"><CircleAlert size={14}/> 2 need review</span></div><div className="conflict-stack">{conflicts.map((c,i)=><div className="conflict-card" key={i}><div className="conflict-top"><div><span className="conflict-label">CONFLICT {String(i+1).padStart(2,'0')}</span><h2>{c.title}</h2></div><span className="confidence-badge"><ShieldCheck size={12}/> {Math.round(c.confidence*100)}%</span></div><div className="compare"><div className="compare-old"><span>OLDER</span><strong>{c.oldValue}</strong></div><div className="compare-arrow"><GitBranch size={18}/></div><div className="compare-new"><span>NEWER / CURRENT CANDIDATE</span><strong>{c.newValue}</strong></div></div><div className="conflict-explain"><Info size={15}/><div><strong>Why RELAY flagged this</strong><p>{c.reason}</p><small>{c.source}</small></div></div></div>)}</div></div>; }

function PrivacyPage() { return <div className="page"><div className="page-heading"><div><div className="section-kicker">LOCAL-FIRST</div><h1>Privacy</h1><p>Designed around the assumption that the data is sensitive.</p></div><div className="privacy-big"><ShieldCheck size={18}/> Protected by design</div></div><div className="privacy-grid"><div className="privacy-card"><LockKeyhole size={22}/><h3>Local inference</h3><p>The model layer can run on your own machine. Personal source material doesn't need to become a remote API payload.</p></div><div className="privacy-card"><Network size={22}/><h3>Source control</h3><p>RELAY stores provenance alongside facts so you can inspect what generated an answer.</p></div><div className="privacy-card"><Clock3 size={22}/><h3>Temporary handoffs</h3><p>The product is designed for scoped handoffs instead of creating an unlimited permanent archive of someone's life.</p></div></div><div className="panel privacy-note"><div className="note-icon"><ShieldCheck size={20}/></div><div><strong>Trust boundary</strong><p>RELAY should be treated as a reasoning aid, not an authority. For sensitive or consequential decisions, verify the underlying source yourself.</p></div></div></div>; }

function Modal({children,wide,onClose}) { return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget&&onClose)onClose();}}><div className={`modal ${wide?'wide':''}`}>{children}</div></div>; }

createRoot(document.getElementById('root')).render(<App />);

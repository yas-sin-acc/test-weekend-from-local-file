import { useState, useEffect } from 'react';
import { defaults } from './config.js';
import { Clock, alerts, useToday, planIsNow } from './ui.jsx';
import Students from './pages/Students.jsx';
import Teachers from './pages/Teachers.jsx';
import Plans from './pages/Plans.jsx';
import Daily from './pages/Daily.jsx';
import Exams from './pages/Exams.jsx';
import Discipline from './pages/Discipline.jsx';
import Finance from './pages/Finance.jsx';
import Settings from './pages/Settings.jsx';

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem('madrasa_db2'));
    return s && s.v === 2 ? { ...defaults, ...s, settings: { ...defaults.settings, ...s.settings } } : defaults;
  } catch { return defaults; }
};

function Scene() {
  return (
    <svg className="scene" viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M640 40a26 26 0 1 0 22 44a20 20 0 1 1-22-44z" fill="#f6e08b" />
      {[[80, 40], [180, 90], [300, 30], [470, 60], [560, 25], [720, 110], [40, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#fff" />)}
      <g fill="#06281c">
        <path d="M300 230A100 100 0 0 1 500 230V260H300Z" /><rect x="396" y="112" width="8" height="22" /><circle cx="400" cy="108" r="6" />
        <path d="M180 250A50 50 0 0 1 280 250V260H180Z" /><path d="M520 250A50 50 0 0 1 620 250V260H520Z" />
        <rect x="120" y="120" width="22" height="140" /><path d="M116 120L131 90L146 120Z" />
        <rect x="660" y="120" width="22" height="140" /><path d="M656 120L671 90L686 120Z" />
        <rect x="0" y="255" width="800" height="45" />
      </g>
      <g fill="#e8c872">{[330, 380, 430].map((x) => <path key={x} d={`M${x} 260v-25a12 12 0 0 1 24 0v25z`} />)}</g>
    </svg>
  );
}

function Login({ db, setUser }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const go = (e) => {
    e.preventDefault();
    const a = db.settings.admin;
    if (u === a.user && p === a.pass) return setUser({ role: 'head', name: 'Director' });
    const t = db.teachers.find((x) => x.username === u && x.password === p);
    if (t) return setUser({ role: 'teacher', name: t.name, classId: t.classId, id: t.id });
    setErr('Wrong username or password');
  };
  return (
    <div className="loginbg">
      <Scene />
      <div className="welcome">
        <div className="bis">بسم الله الرحمن الرحيم</div>
        <h1>Welcome · Ahlan wa Sahlan</h1>
        <p>{db.settings.school}</p>
      </div>
      <form className="card login" onSubmit={go}>
        <input placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
        <input placeholder="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
        {err && <p className="err">{err}</p>}
        <button className="btn">Login</button>
      </form>
    </div>
  );
}

export default function App() {
  const [db, setDb] = useState(load);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('students');
  const [focus, setFocus] = useState('');
  const now = useToday();
  useEffect(() => { localStorage.setItem('madrasa_db2', JSON.stringify(db)); }, [db]);
  const set = (k, v) => setDb((d) => ({ ...d, [k]: typeof v === 'function' ? v(d[k]) : v }));
  if (!user) return <Login db={db} setUser={setUser} />;
  const head = user.role === 'head';
  const me = head ? 'head' : user.id;
  const students = head ? db.students : db.students.filter((s) => s.classId === user.classId);
  const go = (p, f = '') => { setFocus(f); setPage(p); };
  const ctx = { db, set, user, head, students, go, focus };
  const al = alerts(db, students);
  const hot = al.filter((a) => a.pts >= +db.settings.foulLimit);
  const todo = db.plans.filter((p) => p.owner === me && !p.done && planIsNow(p, now)).length;
  const pages = {
    plans: ['Plans' + (todo ? ` (${todo})` : ''), Plans],
    students: [head ? 'Registration' : 'Registered Students', Students],
    ...(head ? { teachers: ['Teachers', Teachers] } : {}),
    daily: ['Attendance', Daily],
    exams: ['Exams & Results', Exams], disc: ['Discipline' + (al.length ? ` (${al.length})` : ''), Discipline],
    ...(head ? { fin: ['Finance', Finance], set: ['Settings', Settings] } : {}),
  };
  const P = (pages[page] || pages.students)[1];
  return (
    <div className={'pg pg-' + page}>
      <header className="top no-print">
        <b>{db.settings.school}</b>
        <small><Clock /></small>
        <span>Welcome, {user.name} <button className="btn gray" onClick={() => setUser(null)}>Logout</button></span>
      </header>
      <nav className="nav no-print">
        {Object.entries(pages).map(([k, [n]]) => (
          <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}>{n}</button>
        ))}
      </nav>
      {hot.length > 0 && (
        <div className="alert no-print" onClick={() => go('disc')}>
          ⚠ Foul limit reached: {hot.map((h) => h.st.name).join(', ')} — tap to open Discipline
        </div>
      )}
      <main><P {...ctx} /></main>
    </div>
  );
}

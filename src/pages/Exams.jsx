import { useState } from 'react';
import { coursesOf } from '../ui.jsx';

function Certificate({ db, row, cid, courses, termName, onClose }) {
  const s = db.settings;
  const cls = s.classes.find((c) => c.id === cid);
  const dept = s.departments.find((d) => d.id === cls.dept);
  const kind = dept?.child ? 'q' : row.st.gender === 'Female' ? 'g' : 'b'; // q = Qaeda children, g = girls, b = boys
  const pass = row.avg >= s.pass;
  const line = courses.map((c, i) => `${c} ${row.pc[i].toFixed(0)}%`).join('  •  ');
  return (
    <div className="overlay">
      <style>{`@page{size:A4 ${kind === 'q' ? 'portrait' : 'landscape'};margin:0}`}</style>
      <div className="wrapc">
        <div className={'certbox ' + (kind === 'q' ? 'P' : 'L')}>
          <div className={'cert ' + kind}>
            {kind !== 'q' && <div className="fr" />}
            {kind === 'g' && <div className="medal">AWARD</div>}
            <div className="cin">
              <div className="cs">{s.school}</div>
              <div className="ct">CERTIFICATE</div>
              <div className="cs">OF COMPLETION (SHAHADA)</div>
              <div className="cs small">This certificate is proudly presented to</div>
              <div className="cn">{row.st.name}</div>
              <div className="cp">
                {dept?.name} · {cls.name} · {s.year} · {termName}<br />
                Average <b>{row.avg.toFixed(1)}%</b> · Rank <b>{row.rank}</b> · <b>{pass ? 'PASSED' : 'NOT PASSED'}</b><br />
                {line}
              </div>
            </div>
            {kind !== 'q' && <div className="sg"><span>Teacher</span><span>Director</span></div>}
            {kind === 'b' && <div className="seal" />}
            {kind === 'g' && <div className="seal star">★</div>}
          </div>
        </div>
        <div className="no-print bar"><button className="btn" onClick={() => window.print()}>Print</button> <button className="btn gray" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

export default function Exams({ db, set, user, head, students }) {
  const s = db.settings;
  const myClasses = head ? s.classes : s.classes.filter((c) => c.id === user.classId);
  const [cid, setCid] = useState(myClasses[0]?.id);
  const [term, setTerm] = useState(s.term || s.terms[0]?.id);
  const [course, setCourse] = useState('');
  const [tab, setTab] = useState('enter');
  const [cert, setCert] = useState(null);
  const cls = s.classes.find((c) => c.id === cid);
  if (!cls) return <p>No class.</p>;
  const courses = coursesOf(cls, term);
  const crs = courses.includes(course) ? course : courses[0];
  const termName = s.terms.find((t) => t.id === term)?.name || '';
  const key = (sid, c, e) => `${term}|${sid}|${c}|${e}`;
  const list = students.filter((x) => x.classId === cid);
  const total = s.exams.reduce((a, e) => a + +e.max, 0) || 1;
  const rows = list.map((st) => {
    const pc = courses.map((c) => s.exams.reduce((a, e) => a + (+db.results[key(st.id, c, e.id)] || 0), 0) / total * 100);
    return { st, pc, avg: pc.reduce((a, b) => a + b, 0) / (pc.length || 1) };
  }).sort((a, b) => b.avg - a.avg);
  rows.forEach((r) => { r.rank = rows.findIndex((x) => x.avg === r.avg) + 1; });
  const dn = (c) => s.departments.find((d) => d.id === c.dept)?.name;
  return (
    <div>
      <div className="card row">
        <select value={cid} onChange={(e) => setCid(e.target.value)}>{myClasses.map((c) => <option key={c.id} value={c.id}>{dn(c)} - {c.name}</option>)}</select>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>{s.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <button className={`btn ${tab === 'enter' ? '' : 'gray'}`} onClick={() => setTab('enter')}>Enter marks</button>
        <button className={`btn ${tab === 'rank' ? '' : 'gray'}`} onClick={() => setTab('rank')}>Average / Rank / Certificate</button>
      </div>
      {tab === 'enter' ? (
        <div className="card scroll">
          {crs ? <select value={crs} onChange={(e) => setCourse(e.target.value)}>{courses.map((c) => <option key={c}>{c}</option>)}</select> : <p>No courses for this term. Add them in Settings.</p>}
          <table>
            <thead><tr><th>Student</th>{s.exams.map((e) => <th key={e.id}>{e.name} /{e.max}</th>)}</tr></thead>
            <tbody>{crs && list.map((st) => (
              <tr key={st.id}><td>{st.name}</td>{s.exams.map((e) => { const k = key(st.id, crs, e.id); return (
                <td key={e.id}><input className="sm" type="number" min="0" max={e.max} value={db.results[k] ?? ''}
                  onChange={(ev) => set('results', (r) => ({ ...r, [k]: ev.target.value }))} /></td>); })}</tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="card scroll"><table>
          <thead><tr><th>Rank</th><th>Student</th>{courses.map((c) => <th key={c}>{c}</th>)}<th>Average</th><th>Result</th><th></th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.st.id}><td>{r.rank}</td><td>{r.st.name}</td>{r.pc.map((p, i) => <td key={i}>{p.toFixed(1)}</td>)}
              <td><b>{r.avg.toFixed(1)}</b></td><td>{r.avg >= s.pass ? 'Pass' : 'Fail'}</td>
              <td><button className="btn sm" onClick={() => setCert(r)}>Certificate</button></td></tr>
          ))}</tbody>
        </table></div>
      )}
      {cert && <Certificate db={db} row={cert} cid={cid} courses={courses} termName={termName} onClose={() => setCert(null)} />}
    </div>
  );
}

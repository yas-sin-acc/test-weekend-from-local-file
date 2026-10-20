import { useState } from 'react';
import { nowTime, today, useToday, mins } from '../ui.jsx';

export default function Daily({ db, set, user, head, students }) {
  const s = db.settings;
  const now = useToday();
  const myClasses = head ? s.classes : s.classes.filter((c) => c.id === user.classId);
  const [cid, setCid] = useState(myClasses[0]?.id);
  const [pick, setPick] = useState(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [log, setLog] = useState('');
  const [hid, setHid] = useState('');
  const date = pick || now; // follows the real day unless a date is picked
  const list = students.filter((x) => x.classId === cid);
  const get = (id) => db.daily.find((d) => d.sid === id && d.date === date) || {};
  const put = (id, patch, day = date) => set('daily', (a) => {
    const i = a.findIndex((d) => d.sid === id && d.date === day);
    if (i < 0) return [...a, { sid: id, date: day, ...patch }];
    const b = [...a]; b[i] = { ...b[i], ...patch }; return b;
  });
  // fingerprint device sends the ID (like a keyboard) -> arrival time is recorded automatically
  const apply = (raw, time, day, force) => {
    const c = raw.trim(); if (!c) return '';
    const late = mins(time) - mins(s.start) > +s.grace;
    const st = db.students.find((x) => x.id === c || x.fp === c);
    if (st) {
      if (!head && st.classId !== user.classId) return `✖ ${st.name} is not in your class`;
      const old = db.daily.find((d) => d.sid === st.id && d.date === day);
      if (old?.time && !force) return `• ${st.name} already scanned at ${old.time}`;
      put(st.id, { time, att: late ? 'Late' : 'Present' }, day);
      return `${late ? '⚠ LATE' : '✔ ON TIME'} ${st.name} ${time}`;
    }
    const th = db.teachers.find((x) => x.id === c || x.fp === c);
    if (th) {
      const old = db.tatt.find((x) => x.tid === th.id && x.date === day);
      if (old?.arrive && !force) return `• Ustaz ${th.name} already scanned at ${old.arrive}`;
      set('tatt', (a) => [...a.filter((x) => !(x.tid === th.id && x.date === day)), { tid: th.id, date: day, status: 'Present', arrive: time }]);
      return `${late ? '⚠ LATE' : '✔ ON TIME'} Ustaz ${th.name} ${time}`;
    }
    return `✖ Unknown ID ${c}`;
  };
  const scan = (e) => { if (e.key === 'Enter') { setMsg(apply(code, nowTime(), today())); setCode(''); } };
  const importLog = () => setMsg(log.split('\n').map((l) => { const [i, t] = l.split(','); return i && t ? apply(i, t.trim(), date, true) : ''; }).filter(Boolean).join(' | '));
  const absentRest = () => list.filter((x) => !get(x.id).att).forEach((x) => put(x.id, { att: 'Absent' }));
  const hist = db.daily.filter((d) => d.sid === hid).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15);
  const cnt = (t) => db.daily.filter((d) => d.sid === hid && d.att === t).length;
  return (
    <div>
      <div className="card">
        <h3>Fingerprint scan station</h3>
        <input className="search" autoFocus placeholder="Touch fingerprint device (ID arrives here) or type ID + Enter" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={scan} />
        {msg && <p className="scanmsg">{msg}</p>}
        <p><small>Class starts {s.start}; late after {s.grace} min. Students and ustazs are both recorded here.</small></p>
        <details><summary>Import device log (ID,HH:MM per line)</summary>
          <textarea className="search" rows="3" value={log} onChange={(e) => setLog(e.target.value)} />
          <button className="btn sm" onClick={importLog}>Import</button></details>
      </div>
      <div className="card row">
        <select value={cid} onChange={(e) => setCid(e.target.value)}>{myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input type="date" value={date} onChange={(e) => setPick(e.target.value)} />
        <button className="btn gray" onClick={() => setPick(null)}>Today</button>
        <button className="btn gold" onClick={absentRest}>Mark not-arrived as Absent</button>
      </div>
      <div className="card scroll"><table>
        <thead><tr><th>Student</th><th>Arrived</th><th>Status (teacher can correct)</th><th>Feedback</th><th>Feedback text</th><th>Lesson</th><th>Revision</th><th>Quality</th></tr></thead>
        <tbody>{list.map((x) => { const d = get(x.id); return (
          <tr key={x.id}>
            <td><a href="#h" onClick={(e) => { e.preventDefault(); setHid(x.id); }}>{x.name}</a></td>
            <td>{d.time || '-'}</td>
            <td><select className={'st ' + (d.att || '')} value={d.att || ''} onChange={(e) => put(x.id, { att: e.target.value })}><option value="">-</option><option>Present</option><option>Late</option><option>Absent</option><option>Excused</option></select></td>
            <td><select value={d.fbType || ''} onChange={(e) => put(x.id, { fbType: e.target.value })}><option value="">-</option><option>Warning</option><option>Caution</option><option>Advice</option><option>Appreciation</option></select></td>
            <td><input value={d.fbText || ''} onChange={(e) => put(x.id, { fbText: e.target.value })} /></td>
            <td><input value={d.hifz || ''} placeholder="Surah / ayah" onChange={(e) => put(x.id, { hifz: e.target.value })} /></td>
            <td><input value={d.rev || ''} onChange={(e) => put(x.id, { rev: e.target.value })} /></td>
            <td><select value={d.grade || ''} onChange={(e) => put(x.id, { grade: e.target.value })}><option value="">-</option><option>Excellent</option><option>Good</option><option>Fair</option><option>Weak</option></select></td>
          </tr>); })}</tbody>
      </table></div>
      {hid && (
        <div className="card">
          <h3>Growth: {db.students.find((x) => x.id === hid)?.name}</h3>
          <p>Present {cnt('Present')} | Late {cnt('Late')} | Absent {cnt('Absent')} | Excused {cnt('Excused')}</p>
          <div className="scroll"><table><thead><tr><th>Date</th><th>Time</th><th>Att.</th><th>Feedback</th><th>Lesson</th><th>Revision</th><th>Quality</th></tr></thead>
            <tbody>{hist.map((d, i) => <tr key={i}><td>{d.date}</td><td>{d.time}</td><td>{d.att}</td><td>{d.fbType} {d.fbText}</td><td>{d.hifz}</td><td>{d.rev}</td><td>{d.grade}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
}

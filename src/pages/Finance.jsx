import { useState } from 'react';
import { F, cname, find, mins, useToday, nowTime, today, monthsBetween } from '../ui.jsx';

function Receipt({ db, r, onClose }) {
  const s = db.settings; const x = db.students.find((y) => y.id === r.sid) || {};
  return (
    <div className="overlay">
      <style>{'@page{size:A5 portrait;margin:6mm}'}</style>
      <div className="wrapc">
        <div className="rcpt">
          <h3>{s.school}</h3><p>{s.address} {s.phone}</p><h2>PAYMENT RECEIPT</h2><hr />
          <p>No: {r.no}</p><p>Date: {r.date} {r.time}</p>
          <p>Student: {x.name} ({x.id})</p><p>Class: {cname(db, x.classId)}</p>
          <p>Month paid: {r.month}</p><p><b>Amount: {r.amount} {s.currency}</b></p><hr />
          <p>Received by: ______________</p>
        </div>
        <div className="no-print bar"><button className="btn" onClick={() => window.print()}>Print receipt</button> <button className="btn gray" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

export default function Finance({ db, set, focus }) {
  const s = db.settings;
  const now = useToday();
  const [tab, setTab] = useState('fee');
  const [pick, setPick] = useState(null);
  const month = pick || now.slice(0, 7); // follows the real month
  const [q, setQ] = useState(focus || '');
  const [rc, setRc] = useState(null);
  const [minM, setMinM] = useState(1);
  const [sel, setSel] = useState({});
  const [t, setT] = useState({ tid: '', date: '', status: 'Present', arrive: s.start, fbType: '', fbText: '' });
  const due = (x) => Math.round((+s.classes.find((c) => c.id === x.classId)?.fee || 0) * (1 - (+x.discount || 0) / 100));
  const paidRec = (x, m = month) => db.pay.find((p) => p.sid === x.id && p.month === m);
  const pay = (x, m) => {
    const rec = { sid: x.id, month: m, amount: due(x), date: today(), time: nowTime(), no: 'R' + Date.now().toString().slice(-7) };
    set('pay', (a) => [...a, rec]); setRc(rec);
  };
  const unpay = (x) => set('pay', (a) => a.filter((p) => !(p.sid === x.id && p.month === month)));
  const unpaid = (x) => monthsBetween((x.date || today()).slice(0, 7), now.slice(0, 7)).filter((m) => !paidRec(x, m));
  const addAtt = (e) => {
    e.preventDefault(); if (!t.tid) return;
    const rec = { ...t, date: t.date || now };
    set('tatt', (a) => [...a.filter((x) => !(x.tid === rec.tid && x.date === rec.date)), rec]);
  };
  const salary = (th) => {
    const e = db.tatt.filter((x) => x.tid === th.id && x.date.startsWith(month));
    const absent = e.filter((x) => x.status === 'Absent').length;
    const late = e.filter((x) => x.status === 'Present').reduce((a, x) => a + Math.max(0, mins(x.arrive) - mins(s.start) - +s.grace), 0);
    const ded = absent * (+th.salary / +s.workDays) + late * +s.lateFine;
    return { absent, late, ded: Math.round(ded), net: Math.max(0, Math.round(+th.salary - ded)) };
  };
  const list = db.students.filter((x) => find({ ...x, cls: cname(db, x.classId) }, q));
  const sum = list.filter((x) => paidRec(x)).reduce((a, x) => a + due(x), 0);
  const ur = list.map((x) => ({ x, um: unpaid(x) })).filter((r) => r.um.length >= minM).sort((a, b) => b.um.length - a.um.length);
  const tn = (id) => db.teachers.find((x) => x.id === id)?.name;
  return (
    <div>
      <div className="card row">
        <button className={`btn ${tab === 'fee' ? '' : 'gray'}`} onClick={() => setTab('fee')}>Student fees</button>
        <button className={`btn ${tab === 'unp' ? '' : 'gray'}`} onClick={() => setTab('unp')}>Unpaid months</button>
        <button className={`btn ${tab === 'sal' ? '' : 'gray'}`} onClick={() => setTab('sal')}>Teacher salary</button>
        {tab !== 'unp' && <input type="month" value={month} onChange={(e) => setPick(e.target.value)} />}
      </div>
      {tab === 'fee' && (
        <div className="card scroll">
          <input className="search" placeholder="Search by name, phone, class, family, ID..." value={q} onChange={(e) => setQ(e.target.value)} />
          <p>Collected this month (listed): <b>{sum} {s.currency}</b></p>
          <table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Phone</th><th>Status</th><th>Fee</th><th>Paid</th></tr></thead>
            <tbody>{list.map((x) => (
              <tr key={x.id}><td>{x.id}</td><td>{x.name}</td><td>{cname(db, x.classId)}</td><td>{x.phone}</td><td>{x.status} {x.discount > 0 && `(-${x.discount}%)`}</td><td>{due(x)}</td>
                <td>{paidRec(x)
                  ? <><button className="btn sm" onClick={() => setRc(paidRec(x))}>Receipt</button> <button className="btn gray sm" onClick={() => unpay(x)}>Undo</button></>
                  : <button className="btn gold sm" onClick={() => pay(x, month)}>Receive + receipt</button>}</td></tr>
            ))}</tbody></table>
        </div>
      )}
      {tab === 'unp' && (
        <div className="card scroll">
          <div className="row">
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
            <label>Unpaid at least <input className="sm" type="number" min="1" value={minM} onChange={(e) => setMinM(+e.target.value || 1)} /> months</label>
          </div>
          <table><thead><tr><th>Unpaid months</th><th>Student</th><th>Class</th><th>Phone</th><th>Owed</th><th>Pay month</th></tr></thead>
            <tbody>{ur.map(({ x, um }) => (
              <tr key={x.id}><td><b>{um.length}</b></td><td>{x.name}</td><td>{cname(db, x.classId)}</td><td>{x.phone}</td><td>{um.length * due(x)} {s.currency}</td>
                <td><select value={sel[x.id] || um[0]} onChange={(e) => setSel({ ...sel, [x.id]: e.target.value })}>{um.map((m) => <option key={m}>{m}</option>)}</select>{' '}
                  <button className="btn sm gold" onClick={() => pay(x, sel[x.id] && um.includes(sel[x.id]) ? sel[x.id] : um[0])}>Pay + receipt</button></td></tr>
            ))}</tbody></table>
        </div>
      )}
      {tab === 'sal' && (
        <div>
          <form className="card grid" onSubmit={addAtt}>
            <F label="Teacher"><select value={t.tid} onChange={(e) => setT({ ...t, tid: e.target.value })}><option value="">Select</option>{db.teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></F>
            <F label="Date (empty = today)"><input type="date" value={t.date} onChange={(e) => setT({ ...t, date: e.target.value })} /></F>
            <F label="Status (correction)"><select value={t.status} onChange={(e) => setT({ ...t, status: e.target.value })}><option>Present</option><option>Absent</option></select></F>
            <F label={`Arrival (class starts ${s.start})`}><input type="time" value={t.arrive} onChange={(e) => setT({ ...t, arrive: e.target.value })} /></F>
            <F label="Feedback"><select value={t.fbType} onChange={(e) => setT({ ...t, fbType: e.target.value })}><option value="">-</option><option>Warning</option><option>Caution</option><option>Appreciation</option></select></F>
            <F label="Feedback text"><input value={t.fbText} onChange={(e) => setT({ ...t, fbText: e.target.value })} /></F>
            <div className="full"><button className="btn">Save / correct attendance</button> <small>Ustaz fingerprint scans arrive from the Attendance page.</small></div>
          </form>
          <div className="card scroll"><table>
            <thead><tr><th>Teacher</th><th>Base</th><th>Absent days</th><th>Late min</th><th>Deduction</th><th>Net salary</th></tr></thead>
            <tbody>{db.teachers.map((th) => { const r = salary(th); return (
              <tr key={th.id}><td>{th.name}</td><td>{th.salary}</td><td>{r.absent}</td><td>{r.late}</td><td>{r.ded}</td><td><b>{r.net} {s.currency}</b></td></tr>); })}</tbody>
          </table></div>
          <div className="card scroll"><h3>Attendance log ({month})</h3><table>
            <thead><tr><th>Date</th><th>Teacher</th><th>Status</th><th>Arrived</th><th>Feedback</th></tr></thead>
            <tbody>{db.tatt.filter((x) => x.date.startsWith(month)).sort((a, b) => (a.date < b.date ? 1 : -1)).map((x, i) => (
              <tr key={i}><td>{x.date}</td><td>{tn(x.tid)}</td><td>{x.status}</td><td>{x.arrive}</td><td>{x.fbType} {x.fbText}</td></tr>))}</tbody></table></div>
        </div>
      )}
      {rc && <Receipt db={db} r={rc} onClose={() => setRc(null)} />}
    </div>
  );
}

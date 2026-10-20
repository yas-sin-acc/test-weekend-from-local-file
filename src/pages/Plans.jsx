import { useState } from 'react';
import { F, useToday, uid, planIsNow } from '../ui.jsx';

export default function Plans({ db, set, user, head }) {
  const now = useToday();
  const me = head ? 'head' : user.id;
  const [per, setPer] = useState('Daily');
  const [who, setWho] = useState('mine');
  const [f, setF] = useState({ period: 'Daily', date: '', title: '', details: '' });
  const add = (e) => {
    e.preventDefault();
    set('plans', (a) => [...a, { ...f, date: f.date || now, id: uid(), owner: me, ownerName: user.name, done: false }]);
    setF({ ...f, title: '', details: '' }); setPer(f.period);
  };
  const list = db.plans.filter((p) => p.period === per && (who === 'all' && head ? true : p.owner === me)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const label = (p) => (p.period === 'Monthly' ? p.date.slice(0, 7) : p.period === 'Yearly' ? p.date.slice(0, 4) : p.period === 'Weekly' ? 'Week of ' + p.date : p.date);
  return (
    <div>
      <form className="card grid" onSubmit={add}>
        <h3 className="full">New plan</h3>
        <F label="Plan type"><select value={f.period} onChange={(e) => setF({ ...f, period: e.target.value })}><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></F>
        <F label="Date (empty = today)"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></F>
        <F label="Plan title"><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></F>
        <F label="Details / goals"><textarea value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></F>
        <div className="full"><button className="btn">Add plan</button></div>
      </form>
      <div className="card row">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((p) => <button key={p} className={`btn ${per === p ? '' : 'gray'}`} onClick={() => setPer(p)}>{p}</button>)}
        {head && <select value={who} onChange={(e) => setWho(e.target.value)}><option value="mine">My plans</option><option value="all">All teachers + director</option></select>}
      </div>
      <div className="card scroll"><table>
        <thead><tr><th>Done</th><th>When</th><th>Plan</th><th>Details</th><th>By</th><th></th></tr></thead>
        <tbody>{list.map((p) => (
          <tr key={p.id} className={planIsNow(p, now) ? 'nowrow' : ''}>
            <td><input type="checkbox" checked={p.done} disabled={p.owner !== me && !head} onChange={() => set('plans', (a) => a.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)))} /></td>
            <td>{label(p)}{planIsNow(p, now) && ' ← now'}</td><td style={{ textDecoration: p.done ? 'line-through' : '' }}>{p.title}</td><td>{p.details}</td><td>{p.ownerName}</td>
            <td>{(p.owner === me || head) && <button className="btn red sm" onClick={() => set('plans', (a) => a.filter((x) => x.id !== p.id))}>X</button>}</td>
          </tr>))}</tbody>
      </table></div>
    </div>
  );
}

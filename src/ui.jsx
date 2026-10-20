import { useState, useEffect } from 'react';
const pad = (n) => String(n).padStart(2, '0');
export const dstr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dstr(); // real local date
export const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const uid = () => Math.random().toString(36).slice(2, 8);
export const mins = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
export const cname = (db, id) => db.settings.classes.find((c) => c.id === id)?.name || '-';
export const deptOf = (db, classId) => db.settings.departments.find((d) => d.id === db.settings.classes.find((c) => c.id === classId)?.dept);
export const F = ({ label, children }) => (<label className="f"><span>{label}</span>{children}</label>);
export const find = (o, q) => JSON.stringify(Object.values(o)).toLowerCase().includes(q.toLowerCase());
export const monthsBetween = (a, b) => {
  const r = []; let [y, m] = a.split('-').map(Number); const [ey, em] = b.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) { r.push(`${y}-${pad(m)}`); m++; if (m > 12) { m = 1; y++; } }
  return r;
};
// live clock + a "today" value that follows the real date by itself
export function Clock() {
  const [n, setN] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setN(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{n.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} · {n.toLocaleTimeString()}</span>;
}
export function useToday() {
  const [t, setT] = useState(today());
  useEffect(() => { const i = setInterval(() => setT(today()), 15000); return () => clearInterval(i); }, []);
  return t;
}
export const readPhoto = (file, cb) => {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 240; c.height = Math.round((img.height * 240) / img.width);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.8));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
};
export const rule = (db, id) => db.settings.rules.find((r) => r.id === id) || { points: 0 };
export const foulPts = (db, sid) => db.disc.filter((d) => d.sid === sid).reduce((a, d) => a + +rule(db, d.rid).points, 0);
export const alerts = (db, students) =>
  students.map((st) => ({ st, pts: foulPts(db, st.id) })).filter((x) => x.pts >= +db.settings.foulWarn).sort((a, b) => b.pts - a.pts);
// courses can be different for every term/semester (class.tc[termId]); falls back to the default list
export const coursesOf = (cls, term) => (cls.tc && cls.tc[term]) || cls.courses;
// comma-separated text input that keeps what you type (commas and spaces work normally)
export function Csv({ value, onChange, ...p }) {
  const [t, setT] = useState(value.join(', '));
  return <input {...p} value={t} onChange={(e) => { setT(e.target.value); onChange(e.target.value.split(',').map((x) => x.trim()).filter(Boolean)); }} />;
}
export const weekStart = (d) => { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dstr(x); };
export const planIsNow = (p, now) =>
  p.period === 'Daily' ? p.date === now : p.period === 'Weekly' ? weekStart(p.date) === weekStart(now)
  : p.period === 'Monthly' ? p.date.slice(0, 7) === now.slice(0, 7) : p.date.slice(0, 4) === now.slice(0, 4);

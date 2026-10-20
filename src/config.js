// Everything here can be edited from the Settings pa.
const C = (id, dept, name, fee, courses) => ({ id, dept, name, fee, courses });
export const defaults = {
  v: 2,
  settings: {
    school: 'Your Madrasa Name', address: 'City / Town', phone: '', year: '2026',
    admin: { user: 'admin', pass: 'admin123' },
    maxClass: 40,
    departments: [
      { id: 'd1', name: 'Qaedatu Nuraniya', child: true },
      { id: 'd2', name: 'Quran Nezer' },
      { id: 'd3', name: 'Quran Hifz' },
      { id: 'd4', name: 'Hadith, Fiqh & Sira' },
    ],
    classes: [
      C('c1', 'd1', 'Qaeda A', 300, ['Qaeda', 'Tajweed', 'Akhlaq']),
      C('c2', 'd1', 'Qaeda B', 300, ['Qaeda', 'Tajweed', 'Akhlaq']),
      C('c3', 'd1', 'Qaeda C', 300, ['Qaeda', 'Tajweed', 'Akhlaq']),
      C('c4', 'd1', 'Qaeda D', 300, ['Qaeda', 'Tajweed', 'Akhlaq']),
      C('c5', 'd2', 'Nezer A', 400, ['Nezer', 'Tajweed', 'Fiqh']),
      C('c6', 'd2', 'Nezer B', 400, ['Nezer', 'Tajweed', 'Fiqh']),
      C('c7', 'd3', 'Hifz A', 500, ['Hifz', 'Revision', 'Tajweed']),
      C('c8', 'd3', 'Hifz B', 500, ['Hifz', 'Revision', 'Tajweed']),
      C('c9', 'd4', 'Kitab A', 400, ['Hadith', 'Fiqh', 'Sira']),
    ],
    statuses: ['Normal', 'Poor', 'Orphan', 'Sick'],
    exams: [
      { id: 'e1', name: 'Monthly Test', max: 20 }, { id: 'e2', name: 'Mid Exam', max: 30 },
      { id: 'e3', name: 'Oral', max: 20 }, { id: 'e4', name: 'Final Exam', max: 30 },
    ],
    rules: [
      { id: 'r1', rule: 'Late to class', points: 1, punish: 'Warning' },
      { id: 'r2', rule: 'Absent without permission', points: 2, punish: 'Call parent' },
      { id: 'r3', rule: 'Disrespect to teacher', points: 5, punish: 'Parent meeting' },
      { id: 'r4', rule: 'Fighting', points: 8, punish: 'Suspension 3 days' },
    ],
    foulWarn: 6, foulLimit: 10, foulAction: 'Call parents + director meeting',
    terms: [{ id: 't1', name: 'Term 1' }, { id: 't2', name: 'Term 2' }], term: 't1',
    pass: 50, start: '08:00', grace: 10, lateFine: 5, workDays: 26, currency: 'ETB',
  },
  students: [], teachers: [], results: {}, plans: [], daily: [], disc: [], tatt: [], pay: [],
};

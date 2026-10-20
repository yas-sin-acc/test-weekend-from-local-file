// items: [{ id, name, photo, lines: [text...], foot }]
export default function IdCards({ school, items, onClose }) {
  return (
    <div className="overlay">
      <style>{'@page{size:A4 portrait;margin:8mm}'}</style>
      <div className="wrapc">
        <div className="no-print bar"><button className="btn" onClick={() => window.print()}>Print</button> <button className="btn gray" onClick={onClose}>Close</button></div>
        <div className="idwrap">
          {items.map((x) => (
            <div className="idc" key={x.id}>
              <div className="idh">{school}</div>
              <div className="idb">
                <div className="idp">{x.photo ? <img src={x.photo} alt="" /> : <span>PHOTO</span>}</div>
                <div className="idi"><b>{x.name}</b><div>ID: {x.id}</div>{x.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
              </div>
              <div className="idf">{x.foot}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

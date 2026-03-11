import { useState, useEffect } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const DEPARTMENTS = ["Road & Infrastructure", "Water Supply", "Electricity", "Waste Management", "Public Safety", "Other Civic Issues"];
const STATUS_STAGES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
const STATUS_COLORS = {
  "Submitted": "#f59e0b",
  "Under Review": "#3b82f6",
  "Assigned": "#8b5cf6",
  "In Progress": "#f97316",
  "Resolved": "#10b981"
};
const CATEGORY_ICONS = {
  "Road & Infrastructure": "🛣️",
  "Water Supply": "💧",
  "Electricity": "⚡",
  "Waste Management": "♻️",
  "Public Safety": "🚔",
  "Other Civic Issues": "🏙️"
};

const INITIAL_COMPLAINTS = [
  { id: "GRV-0001", title: "Pothole on MG Road", category: "Road & Infrastructure", description: "Large pothole near junction causing accidents.", location: "MG Road, Sector 4", status: "In Progress", citizen: "rahul@email.com", assignedTo: "officer@dept.com", department: "Road & Infrastructure", remarks: "Repair team scheduled for Thursday.", submittedAt: "2026-03-01", rating: null, feedback: "" },
  { id: "GRV-0002", title: "No water supply for 3 days", category: "Water Supply", description: "Our area has had no water supply since Sunday.", location: "Green Park Colony", status: "Assigned", citizen: "priya@email.com", assignedTo: "officer@dept.com", department: "Water Supply", remarks: "", submittedAt: "2026-03-04", rating: null, feedback: "" },
  { id: "GRV-0003", title: "Broken streetlight", category: "Electricity", description: "Streetlight at park entrance broken for 2 weeks.", location: "Central Park Entrance", status: "Resolved", citizen: "rahul@email.com", assignedTo: "officer@dept.com", department: "Electricity", remarks: "Bulb replaced and tested.", submittedAt: "2026-02-20", rating: 4, feedback: "Quick resolution, thank you!" },
  { id: "GRV-0004", title: "Garbage overflow at market", category: "Waste Management", description: "Garbage bins overflowing near main market.", location: "Main Market, Block C", status: "Submitted", citizen: "anita@email.com", assignedTo: "", department: "", remarks: "", submittedAt: "2026-03-07", rating: null, feedback: "" },
  { id: "GRV-0005", title: "Illegal parking blocking road", category: "Public Safety", description: "Vehicles parked on footpath forcing pedestrians to road.", location: "Station Road", status: "Under Review", citizen: "anita@email.com", assignedTo: "", department: "Public Safety", remarks: "Under admin review.", submittedAt: "2026-03-06", rating: null, feedback: "" },
];

const INITIAL_USERS = [
  { email: "rahul@email.com", name: "Rahul Sharma", phone: "9876543210", password: "pass123", role: "citizen" },
  { email: "priya@email.com", name: "Priya Mehta", phone: "9123456789", password: "pass123", role: "citizen" },
  { email: "anita@email.com", name: "Anita Singh", phone: "9988776655", password: "pass123", role: "citizen" },
  { email: "officer@dept.com", name: "Officer Vijay Kumar", phone: "9001122334", password: "officer123", role: "official", department: "Road & Infrastructure" },
  { email: "admin@portal.com", name: "Admin Suresh", phone: "9000000001", password: "admin123", role: "admin" },
];

function generateId(complaints) {
  return `GRV-${String(complaints.length + 1).padStart(4, "0")}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0f172a;
    --navy2: #1e293b;
    --slate: #334155;
    --steel: #64748b;
    --silver: #cbd5e1;
    --white: #f8fafc;
    --gold: #f59e0b;
    --gold2: #d97706;
    --green: #10b981;
    --red: #ef4444;
    --blue: #3b82f6;
    --orange: #f97316;
    --purple: #8b5cf6;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--white); min-height: 100vh; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* Header */
  .header {
    background: linear-gradient(135deg, var(--navy2) 0%, #162032 100%);
    border-bottom: 2px solid var(--gold);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 70px; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .logo { display: flex; align-items: center; gap: 0.75rem; }
  .logo-icon { font-size: 1.8rem; }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--gold); line-height: 1.1; }
  .logo-sub { font-size: 0.65rem; color: var(--silver); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 300; }
  .header-right { display: flex; align-items: center; gap: 1rem; }
  .user-badge { background: rgba(245,158,11,0.15); border: 1px solid var(--gold); border-radius: 20px; padding: 0.3rem 0.9rem; font-size: 0.8rem; color: var(--gold); }
  .role-tag { background: var(--gold); color: var(--navy); border-radius: 12px; padding: 0.2rem 0.6rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 0.3rem; }

  /* Buttons */
  .btn { cursor: pointer; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.4rem; }
  .btn-primary { background: var(--gold); color: var(--navy); padding: 0.6rem 1.4rem; font-size: 0.9rem; }
  .btn-primary:hover { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 4px 15px rgba(245,158,11,0.3); }
  .btn-outline { background: transparent; border: 1px solid var(--silver); color: var(--silver); padding: 0.5rem 1.2rem; font-size: 0.85rem; }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .btn-danger { background: var(--red); color: white; padding: 0.5rem 1rem; font-size: 0.85rem; }
  .btn-success { background: var(--green); color: white; padding: 0.5rem 1rem; font-size: 0.85rem; }
  .btn-sm { padding: 0.35rem 0.8rem; font-size: 0.8rem; }
  .btn-ghost { background: rgba(255,255,255,0.05); color: var(--silver); padding: 0.5rem 1rem; font-size: 0.85rem; }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: var(--white); }

  /* Auth */
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%), var(--navy); padding: 2rem; }
  .auth-card { background: var(--navy2); border: 1px solid rgba(245,158,11,0.2); border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--gold); margin-bottom: 0.3rem; }
  .auth-sub { color: var(--steel); font-size: 0.9rem; margin-bottom: 2rem; }
  .form-group { margin-bottom: 1.2rem; }
  .form-label { display: block; font-size: 0.8rem; color: var(--silver); margin-bottom: 0.4rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  .form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem 1rem; color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; transition: border-color 0.2s; }
  .form-input:focus { outline: none; border-color: var(--gold); background: rgba(245,158,11,0.05); }
  .form-input option { background: var(--navy2); }
  .form-textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem 1rem; color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; resize: vertical; min-height: 100px; transition: border-color 0.2s; }
  .form-textarea:focus { outline: none; border-color: var(--gold); }
  .auth-switch { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--steel); }
  .auth-switch span { color: var(--gold); cursor: pointer; font-weight: 500; }
  .auth-switch span:hover { text-decoration: underline; }
  .demo-accounts { margin-top: 1.5rem; background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.15); border-radius: 10px; padding: 1rem; }
  .demo-title { font-size: 0.75rem; color: var(--gold); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; }
  .demo-row { font-size: 0.78rem; color: var(--silver); margin: 0.2rem 0; cursor: pointer; }
  .demo-row:hover { color: var(--gold); }

  /* Layout */
  .main-layout { display: flex; flex: 1; }
  .sidebar { width: 240px; background: var(--navy2); border-right: 1px solid rgba(255,255,255,0.06); padding: 1.5rem 0; flex-shrink: 0; }
  .sidebar-section { padding: 0 1rem; margin-bottom: 0.5rem; }
  .sidebar-label { font-size: 0.68rem; color: var(--steel); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; padding: 0 0.5rem; margin-bottom: 0.4rem; }
  .nav-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.75rem; border-radius: 8px; cursor: pointer; color: var(--silver); font-size: 0.88rem; transition: all 0.15s; margin-bottom: 0.1rem; }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--white); }
  .nav-item.active { background: rgba(245,158,11,0.12); color: var(--gold); font-weight: 500; }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
  .content { flex: 1; padding: 2rem; overflow-y: auto; max-height: calc(100vh - 70px); }

  /* Cards */
  .page-title { font-family: 'Playfair Display', serif; font-size: 1.7rem; color: var(--white); margin-bottom: 0.3rem; }
  .page-sub { color: var(--steel); font-size: 0.9rem; margin-bottom: 2rem; }
  .card { background: var(--navy2); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.5rem; }
  .card + .card { margin-top: 1rem; }

  /* Stats */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--navy2); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.2rem; text-align: center; }
  .stat-number { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; }
  .stat-label { font-size: 0.78rem; color: var(--steel); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }

  /* Complaint List */
  .complaints-list { display: flex; flex-direction: column; gap: 1rem; }
  .complaint-card { background: var(--navy2); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.3rem; cursor: pointer; transition: all 0.2s; }
  .complaint-card:hover { border-color: rgba(245,158,11,0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.3); transform: translateY(-2px); }
  .complaint-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; }
  .complaint-id { font-size: 0.75rem; color: var(--gold); font-weight: 600; letter-spacing: 0.05em; }
  .complaint-title { font-size: 1rem; font-weight: 600; color: var(--white); margin: 0.2rem 0; }
  .complaint-meta { font-size: 0.8rem; color: var(--steel); display: flex; gap: 1rem; flex-wrap: wrap; }
  .status-badge { padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.73rem; font-weight: 600; }
  .category-tag { display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 0.2rem 0.6rem; font-size: 0.78rem; color: var(--silver); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
  .modal { background: var(--navy2); border: 1px solid rgba(245,158,11,0.2); border-radius: 16px; padding: 2rem; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--gold); margin-bottom: 1.5rem; }
  .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; flex-wrap: wrap; }

  /* Detail view */
  .detail-section { margin-bottom: 1.5rem; }
  .detail-label { font-size: 0.75rem; color: var(--steel); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem; font-weight: 600; }
  .detail-value { font-size: 0.95rem; color: var(--white); }
  .timeline { border-left: 2px solid rgba(245,158,11,0.3); padding-left: 1.5rem; margin-top: 0.5rem; }
  .timeline-item { position: relative; margin-bottom: 1rem; }
  .timeline-item::before { content: ''; position: absolute; left: -1.65rem; top: 0.3rem; width: 10px; height: 10px; border-radius: 50%; background: var(--gold); }
  .timeline-status { font-size: 0.85rem; font-weight: 600; color: var(--white); }
  .timeline-remark { font-size: 0.82rem; color: var(--steel); margin-top: 0.2rem; }

  /* Rating */
  .stars { display: flex; gap: 0.3rem; margin: 0.5rem 0; }
  .star { font-size: 1.3rem; cursor: pointer; transition: transform 0.1s; }
  .star:hover { transform: scale(1.2); }

  /* Filter bar */
  .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
  .filter-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.5rem 0.8rem; color: var(--silver); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; }
  .filter-select option { background: var(--navy2); }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { text-align: left; padding: 0.75rem 1rem; color: var(--steel); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(255,255,255,0.06); }
  td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--silver); vertical-align: middle; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* Alert */
  .alert { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
  .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
  .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; }

  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 1.5rem 0; }
  .flex { display: flex; } .gap-1 { gap: 0.5rem; } .gap-2 { gap: 1rem; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .flex-wrap { flex-wrap: wrap; }
  .mb-1 { margin-bottom: 0.5rem; } .mb-2 { margin-bottom: 1rem; } .mb-3 { margin-bottom: 1.5rem; }
  .text-gold { color: var(--gold); } .text-steel { color: var(--steel); } .text-green { color: var(--green); } .text-red { color: var(--red); }
  .w-full { width: 100%; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } .sidebar { display: none; } }
  .empty-state { text-align: center; padding: 3rem; color: var(--steel); }
  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

  .badge-count { background: var(--gold); color: var(--navy); border-radius: 10px; padding: 0.1rem 0.5rem; font-size: 0.7rem; font-weight: 700; margin-left: auto; }

  /* Image Upload */
  .upload-zone { border: 2px dashed rgba(245,158,11,0.35); border-radius: 10px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(245,158,11,0.03); }
  .upload-zone:hover { border-color: var(--gold); background: rgba(245,158,11,0.08); }
  .upload-zone.drag { border-color: var(--gold); background: rgba(245,158,11,0.08); }
  .upload-icon { font-size: 2rem; margin-bottom: 0.4rem; }
  .upload-text { font-size: 0.85rem; color: var(--steel); }
  .upload-text b { color: var(--gold); }
  .upload-hint { font-size: 0.73rem; color: var(--steel); margin-top: 0.25rem; }
  .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.6rem; margin-top: 0.75rem; }
  .preview-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
  .preview-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .preview-remove { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; color: white; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; }
  .preview-remove:hover { background: var(--red); }
  .img-count { font-size: 0.73rem; color: var(--steel); margin-top: 0.4rem; }
  .img-badge { display: inline-flex; align-items: center; gap: 0.25rem; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; padding: 0.15rem 0.5rem; font-size: 0.72rem; color: #93c5fd; }
  .detail-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.6rem; margin-top: 0.5rem; }
  .detail-img { aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.15s; }
  .detail-img:hover { transform: scale(1.04); }
  .detail-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.93); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .lightbox img { max-width: 100%; max-height: 88vh; border-radius: 10px; }
  .lightbox-close { position: absolute; top: 1.2rem; right: 1.5rem; background: rgba(255,255,255,0.12); border: none; color: white; font-size: 1.3rem; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .lightbox-close:hover { background: rgba(255,255,255,0.25); }
`;

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#64748b";
  return <span className="status-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{status}</span>;
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className="star"
          style={{ color: s <= (hover || value) ? "#f59e0b" : "#334155" }}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(s)}>★</span>
      ))}
    </div>
  );
}

// ─── Image Upload Component ───────────────────────────────────────────────────
function ImageUpload({ images, setImages }) {
  const [drag, setDrag] = useState(false);
  const processFiles = (files) => {
    const allowed = Array.from(files).filter(f => f.type.startsWith("image/"));
    allowed.slice(0, 5 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setImages(prev => [...prev, { url: e.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div>
      {images.length < 5 && (
        <div
          className={`upload-zone${drag ? " drag" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); processFiles(e.dataTransfer.files); }}
          onClick={() => document.getElementById("imgFileInput").click()}
        >
          <div className="upload-icon">📷</div>
          <div className="upload-text">Drag & drop photos or <b>click to browse</b></div>
          <div className="upload-hint">JPG, PNG, WEBP — up to 5 images</div>
          <input id="imgFileInput" type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => processFiles(e.target.files)} />
        </div>
      )}
      {images.length > 0 && (
        <>
          <div className="preview-grid">
            {images.map((img, i) => (
              <div key={i} className="preview-item">
                <img src={img.url} alt={img.name} />
                <button className="preview-remove" onClick={e => { e.stopPropagation(); setImages(prev => prev.filter((_, j) => j !== i)); }}>✕</button>
              </div>
            ))}
          </div>
          <div className="img-count">{images.length}/5 image{images.length !== 1 ? "s" : ""} attached</div>
        </>
      )}
    </div>
  );
}

function Lightbox({ src, onClose }) {
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <img src={src} onClick={e => e.stopPropagation()} alt="Complaint photo" />
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ users, setUsers, setCurrentUser }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "citizen" });
  const [error, setError] = useState("");

  const fill = (email, password) => setForm(f => ({ ...f, email, password }));

  const login = () => {
    const user = users.find(u => u.email === form.email && u.password === form.password);
    if (!user) { setError("Invalid email or password."); return; }
    setCurrentUser(user);
  };

  const register = () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError("All fields are required."); return; }
    if (users.find(u => u.email === form.email)) { setError("Email already registered."); return; }
    const newUser = { ...form, role: "citizen" };
    setUsers(u => [...u, newUser]);
    setCurrentUser(newUser);
  };

  const demoAccounts = [
    { label: "Citizen", email: "rahul@email.com", pass: "pass123" },
    { label: "Official", email: "officer@dept.com", pass: "officer123" },
    { label: "Admin", email: "admin@portal.com", pass: "admin123" },
  ];

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo mb-3">
          <span style={{ fontSize: "2rem" }}>🏛️</span>
          <div>
            <div className="auth-title">CivicConnect</div>
            <div style={{ fontSize: "0.72rem", color: "var(--steel)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Citizen Grievance Portal</div>
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {mode === "register" && (
          <>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit phone number" /></div>
          </>
        )}
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
        <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "0.75rem" }} onClick={mode === "login" ? login : register}>
          {mode === "login" ? "Sign In →" : "Create Account →"}
        </button>
        <div className="auth-switch">
          {mode === "login" ? <>Don't have an account? <span onClick={() => { setMode("register"); setError(""); }}>Register</span></> : <>Already have an account? <span onClick={() => { setMode("login"); setError(""); }}>Login</span></>}
        </div>
        <div className="demo-accounts">
          <div className="demo-title">⚡ Quick Demo Login</div>
          {demoAccounts.map(a => (
            <div key={a.email} className="demo-row" onClick={() => { fill(a.email, a.pass); setMode("login"); setError(""); }}>
              <strong>{a.label}:</strong> {a.email} / {a.pass}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Submit Complaint Modal ───────────────────────────────────────────────────
function SubmitComplaintModal({ onClose, onSubmit, userEmail }) {
  const [form, setForm] = useState({ title: "", category: "", description: "", location: "" });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.title || !form.category || !form.description || !form.location) { setError("All fields are required."); return; }
    onSubmit({ ...form, images });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📝 Submit New Complaint</div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief title of the issue" /></div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select a category</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{CATEGORY_ICONS[d]} {d}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of the issue..." /></div>
        <div className="form-group"><label className="form-label">📍 Location</label><input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Exact address or landmark" /></div>
        <div className="form-group">
          <label className="form-label">📸 Photos <span style={{ color: "var(--steel)", fontWeight: 400, textTransform: "none", fontSize: "0.72rem" }}>(optional · up to 5)</span></label>
          <ImageUpload images={images} setImages={setImages} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Submit Complaint</button>
        </div>
      </div>
    </div>
  );
}

// ─── Complaint Detail Modal ───────────────────────────────────────────────────
function ComplaintDetailModal({ complaint, onClose, currentUser, onUpdate }) {
  const [rating, setRating] = useState(complaint.rating || 0);
  const [feedback, setFeedback] = useState(complaint.feedback || "");
  const [newRemark, setNewRemark] = useState("");
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [assignDept, setAssignDept] = useState(complaint.department || "");
  const [submitted, setSubmitted] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const saveStatus = () => {
    onUpdate(complaint.id, { status: newStatus, remarks: newRemark || complaint.remarks, department: assignDept });
    onClose();
  };

  const submitFeedback = () => {
    onUpdate(complaint.id, { rating, feedback });
    setSubmitted(true);
  };

  const isResolved = complaint.status === "Resolved";
  const canFeedback = currentUser.role === "citizen" && isResolved && !complaint.rating;
  const canManage = currentUser.role === "official" || currentUser.role === "admin";
  const imgs = complaint.images || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.05em" }}>{complaint.id}</div>
            <div className="modal-title" style={{ marginBottom: 0 }}>{complaint.title}</div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="grid-2">
          <div className="detail-section"><div className="detail-label">Category</div><div className="detail-value">{CATEGORY_ICONS[complaint.category]} {complaint.category}</div></div>
          <div className="detail-section"><div className="detail-label">Submitted</div><div className="detail-value">{complaint.submittedAt}</div></div>
          <div className="detail-section"><div className="detail-label">Location</div><div className="detail-value">📍 {complaint.location}</div></div>
          <div className="detail-section"><div className="detail-label">Citizen</div><div className="detail-value">{complaint.citizen}</div></div>
        </div>

        <div className="detail-section"><div className="detail-label">Description</div><div className="detail-value" style={{ lineHeight: 1.6 }}>{complaint.description}</div></div>

        {imgs.length > 0 && (
          <div className="detail-section">
            <div className="detail-label">📸 Photos ({imgs.length})</div>
            <div className="detail-img-grid">
              {imgs.map((img, i) => (
                <div key={i} className="detail-img" onClick={() => setLightbox(img.url)}>
                  <img src={img.url} alt={`Photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {complaint.remarks && (
          <div className="detail-section">
            <div className="detail-label">Official Remarks</div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-status">{complaint.status}</div>
                <div className="timeline-remark">{complaint.remarks}</div>
              </div>
            </div>
          </div>
        )}

        {complaint.rating && (
          <div className="detail-section">
            <div className="detail-label">Citizen Feedback</div>
            <StarRating value={complaint.rating} />
            {complaint.feedback && <div className="detail-value" style={{ fontStyle: "italic", color: "var(--steel)" }}>"{complaint.feedback}"</div>}
          </div>
        )}

        {/* Official / Admin controls */}
        {canManage && (
          <>
            <div className="divider" />
            <div className="detail-label" style={{ marginBottom: "0.75rem" }}>🔧 Update Complaint</div>
            {currentUser.role === "admin" && (
              <div className="form-group">
                <label className="form-label">Assign Department</label>
                <select className="form-input" value={assignDept} onChange={e => setAssignDept(e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Add Remark</label>
              <textarea className="form-textarea" style={{ minHeight: 70 }} value={newRemark} onChange={e => setNewRemark(e.target.value)} placeholder="Add update or remark..." />
            </div>
          </>
        )}

        {/* Citizen feedback */}
        {canFeedback && !submitted && (
          <>
            <div className="divider" />
            <div className="detail-label" style={{ marginBottom: "0.5rem" }}>⭐ Rate the Resolution</div>
            <StarRating value={rating} onChange={setRating} />
            <textarea className="form-textarea" style={{ minHeight: 70, marginTop: "0.5rem" }} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share your experience..." />
          </>
        )}
        {submitted && <div className="alert alert-success mt-2">✅ Thank you for your feedback!</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {canManage && <button className="btn btn-primary" onClick={saveStatus}>Save Updates</button>}
          {canFeedback && !submitted && rating > 0 && <button className="btn btn-success" onClick={submitFeedback}>Submit Feedback</button>}
        </div>
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ─── Citizen Dashboard ────────────────────────────────────────────────────────
function CitizenDashboard({ complaints, currentUser, onSubmit, onUpdate }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const myComplaints = complaints.filter(c => c.citizen === currentUser.email);
  const filtered = filter === "All" ? myComplaints : myComplaints.filter(c => c.status === filter);

  const counts = STATUS_STAGES.reduce((a, s) => ({ ...a, [s]: myComplaints.filter(c => c.status === s).length }), {});

  return (
    <div>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <div className="page-title">My Complaints</div>
          <div className="page-sub">Track and manage your submitted grievances</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>+ New Complaint</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number" style={{ color: "var(--gold)" }}>{myComplaints.length}</div><div className="stat-label">Total</div></div>
        {STATUS_STAGES.map(s => (
          <div key={s} className="stat-card">
            <div className="stat-number" style={{ color: STATUS_COLORS[s] }}>{counts[s]}</div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {["All", ...STATUS_STAGES].map(s => (
          <button key={s} className={`btn ${filter === s ? "btn-primary btn-sm" : "btn-ghost btn-sm"}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><div>No complaints found.</div>{filter === "All" && <div style={{ marginTop: "0.5rem" }}><button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setShowSubmit(true)}>Submit your first complaint</button></div>}</div>
      ) : (
        <div className="complaints-list">
          {filtered.map(c => (
            <div key={c.id} className="complaint-card" onClick={() => setSelected(c)}>
              <div className="complaint-header">
                <div>
                  <div className="complaint-id">{c.id}</div>
                  <div className="complaint-title">{c.title}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="category-tag">{CATEGORY_ICONS[c.category]} {c.category}</span>
                <span className="complaint-meta">📍 {c.location}</span>
                <span className="complaint-meta">🗓 {c.submittedAt}</span>
                {c.status === "Resolved" && !c.rating && <span style={{ color: "var(--gold)", fontSize: "0.78rem" }}>⭐ Rate this</span>}
                {c.images && c.images.length > 0 && <span className="img-badge">📸 {c.images.length} photo{c.images.length !== 1 ? "s" : ""}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSubmit && <SubmitComplaintModal onClose={() => setShowSubmit(false)} onSubmit={form => onSubmit(form, currentUser.email)} userEmail={currentUser.email} />}
      {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} currentUser={currentUser} onUpdate={(id, updates) => { onUpdate(id, updates); setSelected(s => ({ ...s, ...updates })); }} />}
    </div>
  );
}

// ─── Official Dashboard ───────────────────────────────────────────────────────
function OfficialDashboard({ complaints, currentUser, onUpdate }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const assigned = complaints.filter(c => c.assignedTo === currentUser.email || c.department === currentUser.department);
  const filtered = filter === "All" ? assigned : assigned.filter(c => c.status === filter);

  return (
    <div>
      <div className="page-title">Assigned Complaints</div>
      <div className="page-sub">Manage and resolve complaints assigned to your department</div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number text-gold">{assigned.length}</div><div className="stat-label">Assigned</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: "var(--orange)" }}>{assigned.filter(c => c.status === "In Progress").length}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-number text-green">{assigned.filter(c => c.status === "Resolved").length}</div><div className="stat-label">Resolved</div></div>
      </div>

      <div className="filter-bar">
        {["All", ...STATUS_STAGES].map(s => (
          <button key={s} className={`btn ${filter === s ? "btn-primary btn-sm" : "btn-ghost btn-sm"}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">✅</div><div>No complaints in this filter.</div></div> : (
        <div className="complaints-list">
          {filtered.map(c => (
            <div key={c.id} className="complaint-card" onClick={() => setSelected(c)}>
              <div className="complaint-header">
                <div>
                  <div className="complaint-id">{c.id}</div>
                  <div className="complaint-title">{c.title}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="category-tag">{CATEGORY_ICONS[c.category]} {c.category}</span>
                <span className="complaint-meta">📍 {c.location}</span>
                <span className="complaint-meta">👤 {c.citizen}</span>
              </div>
              {c.remarks && <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--steel)", fontStyle: "italic" }}>💬 {c.remarks}</div>}
            </div>
          ))}
        </div>
      )}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} currentUser={currentUser} onUpdate={(id, updates) => { onUpdate(id, updates); setSelected(s => ({ ...s, ...updates })); }} />}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ complaints, users, currentUser, onUpdate }) {
  const [view, setView] = useState("overview");
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const pending = complaints.filter(c => !c.department);
  const totalResolved = complaints.filter(c => c.status === "Resolved").length;
  const citizens = users.filter(u => u.role === "citizen").length;

  const filtered = complaints
    .filter(c => filterCat === "All" || c.category === filterCat)
    .filter(c => filterStatus === "All" || c.status === filterStatus);

  const catCounts = DEPARTMENTS.map(d => ({ name: d, count: complaints.filter(c => c.category === d).length }));

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {["overview", "complaints", "analytics"].map(v => (
          <button key={v} className={`btn btn-sm ${view === v ? "btn-primary" : "btn-ghost"}`} onClick={() => setView(v)}>
            {v === "overview" ? "📊 Overview" : v === "complaints" ? "📋 All Complaints" : "📈 Analytics"}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <>
          <div className="page-title">Admin Overview</div>
          <div className="page-sub">Platform-wide complaint management and monitoring</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-number text-gold">{complaints.length}</div><div className="stat-label">Total Complaints</div></div>
            <div className="stat-card"><div className="stat-number text-red">{pending.length}</div><div className="stat-label">Unassigned</div></div>
            <div className="stat-card"><div className="stat-number text-green">{totalResolved}</div><div className="stat-label">Resolved</div></div>
            <div className="stat-card"><div className="stat-number" style={{ color: "var(--blue)" }}>{citizens}</div><div className="stat-label">Citizens</div></div>
          </div>

          {pending.length > 0 && (
            <>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold)", marginBottom: "1rem" }}>⚠️ Pending Assignment ({pending.length})</div>
              <div className="complaints-list">
                {pending.map(c => (
                  <div key={c.id} className="complaint-card" onClick={() => setSelected(c)} style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                    <div className="complaint-header">
                      <div><div className="complaint-id">{c.id}</div><div className="complaint-title">{c.title}</div></div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex gap-2"><span className="category-tag">{CATEGORY_ICONS[c.category]} {c.category}</span><span className="complaint-meta">📍 {c.location}</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {view === "complaints" && (
        <>
          <div className="page-title">All Complaints</div>
          <div className="filter-bar">
            <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="All">All Categories</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="card table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Citizen</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                    <td style={{ color: "var(--gold)", fontWeight: 600 }}>{c.id}</td>
                    <td style={{ color: "var(--white)" }}>{c.title}</td>
                    <td><span className="category-tag">{CATEGORY_ICONS[c.category]} {c.category}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.citizen}</td>
                    <td>{c.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "analytics" && (
        <>
          <div className="page-title">Analytics & Reports</div>
          <div className="page-sub">Data insights for better decision-making</div>
          <div className="grid-2">
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: "1rem" }}>Complaints by Category</div>
              {catCounts.map(({ name, count }) => (
                <div key={name} style={{ marginBottom: "0.75rem" }}>
                  <div className="flex justify-between" style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                    <span>{CATEGORY_ICONS[name]} {name}</span>
                    <span className="text-gold">{count}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${complaints.length ? (count / complaints.length) * 100 : 0}%`, background: "var(--gold)", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: "1rem" }}>Status Distribution</div>
              {STATUS_STAGES.map(s => {
                const cnt = complaints.filter(c => c.status === s).length;
                return (
                  <div key={s} style={{ marginBottom: "0.75rem" }}>
                    <div className="flex justify-between" style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                      <span>{s}</span>
                      <span style={{ color: STATUS_COLORS[s] }}>{cnt}</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${complaints.length ? (cnt / complaints.length) * 100 : 0}%`, background: STATUS_COLORS[s], borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
              <div className="divider" />
              <div className="flex justify-between">
                <span className="text-steel" style={{ fontSize: "0.85rem" }}>Resolution Rate</span>
                <span className="text-green" style={{ fontWeight: 600 }}>{complaints.length ? Math.round((totalResolved / complaints.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </>
      )}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} currentUser={currentUser} onUpdate={(id, updates) => { onUpdate(id, updates); setSelected(s => ({ ...s, ...updates })); }} />}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");

  const logout = () => { setCurrentUser(null); setActiveNav("dashboard"); };

  const submitComplaint = (form, email) => {
    const newC = {
      id: generateId(complaints),
      ...form,
      status: "Submitted",
      citizen: email,
      assignedTo: "",
      department: "",
      remarks: "",
      submittedAt: new Date().toISOString().split("T")[0],
      rating: null,
      feedback: ""
    };
    setComplaints(c => [...c, newC]);
  };

  const updateComplaint = (id, updates) => {
    setComplaints(cs => cs.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const navItems = {
    citizen: [{ id: "dashboard", icon: "🏠", label: "My Complaints" }],
    official: [{ id: "dashboard", icon: "📋", label: "Assigned" }],
    admin: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
    ]
  };

  if (!currentUser) return (
    <>
      <style>{css}</style>
      <AuthScreen users={users} setUsers={setUsers} setCurrentUser={setCurrentUser} />
    </>
  );

  const myNavItems = navItems[currentUser.role] || [];
  const pendingCount = complaints.filter(c => !c.department).length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🏛️</span>
            <div>
              <div className="logo-text">CivicConnect</div>
              <div className="logo-sub">Citizen Grievance Portal</div>
            </div>
          </div>
          <div className="header-right">
            <span className="user-badge">
              {currentUser.name}
              <span className="role-tag">{currentUser.role}</span>
            </span>
            <button className="btn btn-outline btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </header>

        <div className="main-layout">
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Navigation</div>
              {myNavItems.map(item => (
                <div key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.id === "dashboard" && currentUser.role === "admin" && pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: "1rem" }} />
            <div className="sidebar-section">
              <div style={{ padding: "0.5rem", background: "rgba(245,158,11,0.06)", borderRadius: "8px", fontSize: "0.78rem", color: "var(--steel)" }}>
                <div style={{ color: "var(--gold)", fontWeight: 600, marginBottom: "0.3rem" }}>Platform Stats</div>
                <div>Total: {complaints.length} complaints</div>
                <div>Resolved: {complaints.filter(c => c.status === "Resolved").length}</div>
                <div>Active: {complaints.filter(c => c.status !== "Resolved").length}</div>
              </div>
            </div>
          </aside>

          <main className="content">
            {currentUser.role === "citizen" && <CitizenDashboard complaints={complaints} currentUser={currentUser} onSubmit={submitComplaint} onUpdate={updateComplaint} />}
            {currentUser.role === "official" && <OfficialDashboard complaints={complaints} currentUser={currentUser} onUpdate={updateComplaint} />}
            {currentUser.role === "admin" && <AdminDashboard complaints={complaints} users={users} currentUser={currentUser} onUpdate={updateComplaint} />}
          </main>
        </div>
      </div>
    </>
  );
}
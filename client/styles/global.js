import { T } from "./tokens";

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${T.gray50}; color: ${T.gray900}; font-size: 15px; line-height: 1.6; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; }
  input, select { font-family: inherit; }

  .ff-nav {
    position: sticky; top: 0; z-index: 100;
    background: ${T.white}; border-bottom: ${T.border};
    padding: 0 1.5rem; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ff-nav-logo {
    font-size: 17px; font-weight: 600; color: ${T.green};
    display: flex; align-items: center; gap: 8px;
  }
  .ff-nav-logo span { color: ${T.gray900}; }
  .ff-nav-links { display: flex; gap: 4px; }
  .ff-nav-link {
    padding: 6px 12px; border-radius: 6px;
    font-size: 14px; color: ${T.gray700};
    background: none; border: none;
    transition: background 0.15s;
  }
  .ff-nav-link:hover { background: ${T.gray100}; }
  .ff-nav-link.active { color: ${T.green}; font-weight: 500; }
  .ff-btn {
    padding: 8px 16px; border-radius: 6px;
    font-size: 14px; font-weight: 500;
    border: ${T.border}; background: ${T.white};
    color: ${T.gray900}; transition: all 0.15s;
  }
  .ff-btn:hover { background: ${T.gray100}; }
  .ff-btn-primary {
    background: ${T.green}; color: ${T.white}; border-color: ${T.green};
  }
  .ff-btn-primary:hover { background: ${T.greenDark}; border-color: ${T.greenDark}; }
  .ff-btn-sm { padding: 5px 12px; font-size: 13px; }
  .ff-badge {
    display: inline-block; padding: 2px 8px;
    border-radius: 4px; font-size: 12px; font-weight: 500;
  }
  .ff-badge-green { background: ${T.greenLight}; color: ${T.greenDark}; }
  .ff-badge-gray  { background: ${T.gray100}; color: ${T.gray700}; }
  .ff-badge-amber { background: #fef3cd; color: #7d5a00; }
  .ff-badge-blue  { background: #e8f0fe; color: #1a4fa0; }
  .ff-badge-red   { background: #fde8e8; color: #8b1a1a; }
  .ff-card {
    background: ${T.white}; border: ${T.border};
    border-radius: ${T.radiusMd}; padding: 1.25rem;
    box-shadow: ${T.shadow};
  }
  .ff-input {
    width: 100%; padding: 8px 12px;
    border: ${T.border}; border-radius: 6px;
    font-size: 14px; background: ${T.white};
    color: ${T.gray900}; outline: none;
    transition: border-color 0.15s;
  }
  .ff-input:focus { border-color: ${T.green}; }
  .ff-label {
    font-size: 12px; color: ${T.gray500}; font-weight: 500;
    margin-bottom: 4px; display: block;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .ff-stat-num   { font-size: 28px; font-weight: 600; color: ${T.gray900}; }
  .ff-stat-label { font-size: 13px; color: ${T.gray500}; margin-top: 2px; }
  .ff-divider    { height: 1px; background: ${T.gray200}; margin: 1.5rem 0; }
  .ff-progress   { height: 6px; background: ${T.gray200}; border-radius: 3px; overflow: hidden; }
  .ff-progress-fill { height: 100%; background: ${T.green}; border-radius: 3px; transition: width 0.5s; }
  .ff-table      { width: 100%; border-collapse: collapse; font-size: 14px; }
  .ff-table th   { padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: ${T.gray500}; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: ${T.border}; }
  .ff-table td   { padding: 10px 12px; border-bottom: 0.5px solid ${T.gray200}; }
  .ff-table tr:last-child td { border-bottom: none; }
  .ff-table tr:hover td      { background: ${T.gray50}; }
  .ff-section    { padding: 4rem 0; }
  .ff-container  { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
  .ff-grid-2     { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .ff-grid-3     { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .ff-grid-4     { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .ff-sidebar    { width: 220px; flex-shrink: 0; }
  .ff-sidebar-link {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-radius: 6px;
    font-size: 14px; color: ${T.gray700};
    background: none; border: none; width: 100%;
    text-align: left; cursor: pointer;
    transition: all 0.15s; margin-bottom: 2px;
  }
  .ff-sidebar-link:hover  { background: ${T.gray100}; }
  .ff-sidebar-link.active { background: ${T.greenLight}; color: ${T.green}; font-weight: 500; }

  @media (max-width: 768px) {
    .ff-grid-2, .ff-grid-3, .ff-grid-4 { grid-template-columns: 1fr; }
    .ff-sidebar    { display: none; }
    .ff-nav-links  { display: none; }
  }
`;
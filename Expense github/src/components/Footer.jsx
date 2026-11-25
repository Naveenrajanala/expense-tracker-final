import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <span>
        Expense Tracker &copy; {new Date().getFullYear()} &middot; Personal Financial Management
      </span>
      <span>Stored securely in browser local storage</span>
    </footer>
  );
}

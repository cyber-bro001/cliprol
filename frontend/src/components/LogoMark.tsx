/** Temporary crop-frame mark; replace independently of the Cliprol wordmark. */
export default function LogoMark() {
  return (
    <svg className="logo-mark" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" focusable="false">
      <path d="M10 4H4v6M16 4h6v6M22 16v6h-6M10 22H4v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m11 9 6 4-6 4V9Z" fill="currentColor" />
    </svg>
  );
}

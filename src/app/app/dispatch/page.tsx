import DispatchBoard from "./board";

export default function DispatchPage() {
  return <main className="min-h-screen bg-canvas p-5 text-text sm:p-8 lg:p-10"><div className="mx-auto max-w-[1280px]"><header className="border-b border-line pb-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Opérations · 04</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Dispatch</h1><p className="mt-1 text-[13.5px] text-muted">Suivre la file de prise en charge et les exceptions du dernier kilomètre.</p></header><DispatchBoard /></div></main>;
}

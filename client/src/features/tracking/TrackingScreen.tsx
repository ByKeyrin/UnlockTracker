/** Écran de suivi des parties jouées — rempli dans un sprint ultérieur. */
export function TrackingScreen() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Suivi</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Le suivi de vos parties (à faire, en cours, terminées) arrivera ici.
      </p>
    </section>
  );
}

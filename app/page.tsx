import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-50">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            AssurePro
          </span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            href="/login"
          >
            Se Connecter
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <section className="w-full py-24 md:py-32 lg:py-40 flex flex-col items-center justify-center text-center px-4 relative z-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium shadow-sm transition-all hover:bg-blue-200 cursor-default">
            Le nouveau standard de la gestion d'assurance
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight md:leading-[1.1] text-slate-900">
            Ayez toujours une longueur d'avance avec{" "}
            <span className="text-blue-600">AssurePro</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
            La plateforme tout-en-un pour les courtiers et conseillers modernes.
            Gérez vos fiches clients, suivez vos performances et collaborez
            efficacement, sans friction.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:scale-105 hover:shadow-blue-500/50"
            >
              Découvrir la plateforme
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
              <Activity className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              Statistiques en Temps Réel
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Suivez précisément vos dossiers, les produits souscrits et
              détectez les tendances pour augmenter vos ventes.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Collaboration Équipe</h3>
            <p className="text-slate-500 leading-relaxed">
              Les administrateurs peuvent assigner des fiches et chaque
              conseiller garde une vision claire de ses dossiers prioritaires.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
              <Zap className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Productivité Maximale</h3>
            <p className="text-slate-500 leading-relaxed">
              Une interface épurée et ultra-rapide pour mettre à jour les
              statuts en un clic, sans page de chargement fastidieuse.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 bg-white mt-auto">
        <p className="text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} AssurePro. Construit pour l'excellence.
        </p>
      </footer>
    </main>
  );
}

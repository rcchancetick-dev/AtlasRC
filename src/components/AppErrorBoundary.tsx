import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { hasError: boolean };
export class AppErrorBoundary extends Component<{children:ReactNode},State> {
  state:State={hasError:false};
  static getDerivedStateFromError():State { return {hasError:true}; }
  componentDidCatch(error:Error, info:ErrorInfo) { console.error('Erreur de rendu AtlasRC',error,info); }
  render() {
    if (this.state.hasError) return <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center"><h1 className="text-2xl font-bold">Cette page n’a pas pu s’afficher.</h1><p className="text-[var(--soft)]">Vérifiez votre connexion puis réessayez.</p><button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white" onClick={()=>window.location.reload()}>Réessayer</button></div>;
    return this.props.children;
  }
}

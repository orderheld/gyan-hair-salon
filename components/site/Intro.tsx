import { Wordmark } from "../brand/Logo";
import { Scissors } from "../motion/Scissors";

// Vollbild-Intro beim ersten Besuch pro Sitzung: Logo erscheint, der rote Faden spannt sich,
// die Schere schneidet ihn durch und der Vorhang öffnet sich. Reines CSS, kein Warten auf JavaScript.
const script = `try{var d=document.documentElement;if(sessionStorage.getItem("gyan-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("no-intro")}else{sessionStorage.setItem("gyan-intro","1")}}catch(e){}`;

export function Intro({ line }: { line: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div className="intro" aria-hidden>
        <div className="intro-panel intro-top" />
        <div className="intro-panel intro-bottom" />
        <div className="intro-center">
          <Wordmark className="intro-logo" />
          <div className="intro-thread">
            <span className="intro-thread-l" />
            <span className="intro-thread-r" />
            <Scissors className="intro-scissors" />
          </div>
          <p className="intro-line">{line}</p>
        </div>
      </div>
    </>
  );
}

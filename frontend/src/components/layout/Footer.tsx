import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <img src="/logo.png" alt="NullArchive" className="w-6 h-6 object-contain" />
            <span className="font-serif text-base font-semibold">NullArchive</span>
          </div>
          <p className="text-sm text-inkmute max-w-sm leading-relaxed">
            An open, citable repository for negative results, failed experiments,
            and research paths that didn't work — so the next researcher doesn't
            have to find out the hard way.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-inkmute mb-3">
            Platform
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/explore" className="text-inkmute hover:text-ink">Explore research</Link></li>
            <li><Link to="/submit" className="text-inkmute hover:text-ink">Submit a finding</Link></li>
            <li><Link to="/about" className="text-inkmute hover:text-ink">Open source</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-inkmute mb-3">
            Community
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/Marwan-Alii/NullArchive"
                className="text-inkmute hover:text-ink"
              >
                GitHub
              </a>
            </li>
            <li><Link to="/about#contributing" className="text-inkmute hover:text-ink">Contribution guide</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page py-5 text-xs text-inkmute font-mono">
          NullArchive is open source and community-maintained. Findings are user-submitted and independently reviewed.
        </div>
      </div>
    </footer>
  );
}

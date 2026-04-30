export default function HomeShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:gap-0 lg:px-6 lg:py-6">
      <div
        id="loader"
        className="fixed inset-0 z-50 hidden items-center justify-center px-6"
      >
        <div className="loader-panel w-full max-w-sm rounded-4xl px-8 py-10 text-center">
          <div className="loader-rings mx-auto mb-6 flex items-center justify-center gap-3">
            <span className="loader-ring loader-ring-a" />
            <span className="loader-ring loader-ring-b" />
            <span className="loader-ring loader-ring-a" />
            <span className="loader-ring loader-ring-b" />
          </div>
          <h1 className="text-amber-300">Loading for the last Time...</h1>
        </div>
      </div>

      <div id="wrapper" className="hidden flex-1">
        <div className="grid min-h-screen gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-5">
          <main className="min-w-0">
            <div className="content editor-frame min-h-[60vh] cursor-text border-x-4 bg-[rgba(15,23,42,0.78)] px-3 py-3 shadow-2xl shadow-black/25 backdrop-blur lg:h-full lg:min-h-0 lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-4 shadow-inner shadow-black/20 backdrop-blur lg:min-h-full lg:p-6">
                <textarea
                  disabled
                  placeholder="Write Here"
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="min-h-[60vh] w-full resize-none bg-transparent text-[1rem] leading-8 text-slate-100 outline-none placeholder:text-slate-500 lg:min-h-[calc(100vh-4.5rem)]"
                />
              </div>
            </div>
          </main>

          <footer className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 px-4 py-5 shadow-2xl shadow-black/25 backdrop-blur lg:min-h-full lg:px-5 lg:py-6">
            <div className="flex h-full flex-col gap-6">
              <div className="toggle flex flex-wrap items-center gap-2">
                <div className="desktop-only label-pill bg-amber-400 text-slate-950">CONTROL</div>
                <div className="desktop-only label-pill bg-slate-950 text-amber-400 ring-1 ring-amber-400">+</div>
                <div className="desktop-only label-pill bg-amber-400 text-slate-950">.</div>
                <div className="swipe hidden w-full items-center justify-center rounded-2xl border border-dashed border-amber-400/30 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <div>swipe anywhere to switch</div>
                </div>
                <span className="switch right ml-auto">
                  <input type="checkbox" id="state" defaultChecked />
                  <label htmlFor="state" data-on="BN" data-off="EN" />
                </span>
              </div>

              <div className="drafts">
                <h2 className="mb-4 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
                  Drafts
                </h2>
                <ul className="space-y-2">
                  <li>
                    <a className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/10" href="#">
                      Draft 1
                    </a>
                  </li>
                  <li>
                    <a className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/10" href="#">
                      Draft 2
                    </a>
                  </li>
                  <li>
                    <a className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/10" href="#">
                      Draft 3
                    </a>
                  </li>
                  <li>
                    <a className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/10" href="#">
                      Draft 4
                    </a>
                  </li>
                  <li>
                    <a className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/10" href="#">
                      Draft 5
                    </a>
                  </li>
                </ul>
              </div>

              <div
                className="logo mt-auto h-10 border-t border-white/10 bg-[url('/images/logo-secondary.png')] bg-no-repeat bg-bottom-right pt-3"
                aria-hidden="true"
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

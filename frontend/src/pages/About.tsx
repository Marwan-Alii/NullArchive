export default function About() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-6">
        NullArchive is open source.
      </h1>
      <p className="text-inkmute leading-relaxed mb-10">
        The platform, the archive schema, and the review workflow are all
        public. We think an archive built to prevent wasted research effort
        should itself be inspectable, forkable, and improvable by the
        community it serves.
      </p>

      <section className="mb-12">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">Mission</h2>
        <p className="text-inkmute leading-relaxed">
          Reduce repeated failure in research by making negative results as
          discoverable, citable, and well-documented as positive ones. We
          believe a null result, reported clearly, is a contribution — not a
          gap in someone's CV.
        </p>
      </section>

      <section id="contributing" className="mb-12">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          Contribution guidelines
        </h2>
        <ul className="space-y-3 text-inkmute leading-relaxed list-disc list-inside">
          <li>Fork the repository and open a pull request against <code className="font-mono text-sm bg-white border border-line px-1 rounded-sm">main</code>.</li>
          <li>Follow the existing folder structure — frontend and backend are independent apps that share only the API contract.</li>
          <li>Include tests for new backend endpoints and keep frontend components typed.</li>
          <li>Open an issue before starting large changes so maintainers can weigh in early.</li>
          <li>Be precise in code review the same way we ask submitters to be precise in their write-ups.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">Source code</h2>
        <p className="text-inkmute leading-relaxed">
          The repository is hosted at{" "}
          <a
            href="https://github.com/Marwan-Alii/NullArchive"
            className="text-navy hover:underline"
          >
            github.com/Marwan-Alii/NullArchive
          </a>
          .
        </p>
      </section>
    </div>
  );
}

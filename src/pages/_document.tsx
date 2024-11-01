import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script defer src="https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js"></script>
        {/* <script defer src="https://cdn.opalrb.com/opal/current/opal.min.js"></script> */}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
